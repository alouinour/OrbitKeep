import asyncio
import logging
from datetime import datetime, timezone
import numpy as np
from app.core.config import danger_settings
from app.repositories.danger_repository import DangerRepository
from app.schemas.danger import ObjectType, RiskLevel
from app.services.celestrak_service import CelestrakService
from app.services.collision_service import closest_from_positions, sample_times
from app.services.orbit_service import OrbitService, OrbitPropagationError
from app.services.risk_service import classify_risk
from app.websocket.manager import manager

logger=logging.getLogger(__name__)


class MonitorService:
    def __init__(self, celestrak=None, repository=None, orbit_service=None):
        self.celestrak=celestrak or CelestrakService(); self.repository=repository or DangerRepository(); self.orbit_service=orbit_service
        self._task: asyncio.Task | None=None

    @staticmethod
    def _motion(o) -> float:
        """Mean motion (rev/jour) lu dans la ligne 2 du TLE — sert de filtre grossier d'altitude."""
        try: return float(o.tle_line2[52:63])
        except ValueError: return 0.0

    def _screen(self, satellites, debris, now):
        """NOUVEAU: tout le calcul CPU (Skyfield/numpy). Exécuté dans un thread (asyncio.to_thread).

        FIX: avant, cette boucle tournait DIRECTEMENT dans la boucle asyncio → pendant un cycle de
        monitoring l'API entière (dont /ws) était gelée. De plus les positions étaient recalculées
        pour chaque paire : ici chaque débris n'est propagé qu'UNE fois par cycle et chaque satellite une fois.
        """
        orbit=self.orbit_service
        times=sample_times(now,danger_settings.prediction_window_minutes,danger_settings.sampling_interval_seconds)
        sf_time=orbit.to_time(times)  # conversion des dates faite une seule fois
        debris_positions: dict[int, np.ndarray | None]={}

        def debris_pos(piece):
            if piece.norad_id not in debris_positions:
                try: debris_positions[piece.norad_id]=orbit.get_positions(piece,times,sf_time)
                except OrbitPropagationError:
                    logger.warning("Propagation failure for debris %s",piece.norad_id); debris_positions[piece.norad_id]=None
            return debris_positions[piece.norad_id]

        motions=np.array([self._motion(d) for d in debris])
        hits=[]
        for satellite in satellites:
            try: sat_positions=orbit.get_positions(satellite,times,sf_time)
            except OrbitPropagationError: logger.warning("Propagation failure for satellite %s",satellite.norad_id); continue
            nearest=np.argsort(np.abs(motions-self._motion(satellite)))[:danger_settings.max_candidates_per_satellite]
            for index in nearest:
                piece=debris[int(index)]
                if piece.norad_id==satellite.norad_id: continue  # NOUVEAU: jamais d'alerte d'un objet contre lui-même
                piece_positions=debris_pos(piece)
                if piece_positions is None: continue
                distance,approach=closest_from_positions(sat_positions,piece_positions,times)
                risk=classify_risk(distance)
                if risk is not RiskLevel.LOW: hits.append((satellite,piece,distance,approach,risk))
        return hits

    async def run_once(self) -> int:
        logger.info("Danger monitoring cycle started")
        satellites,debris=await self.celestrak.fetch_active_satellites(),await self.celestrak.fetch_debris()
        await asyncio.to_thread(self.repository.upsert_objects,[*satellites,*debris])  # FIX: écriture SQLite hors boucle asyncio
        if self.orbit_service is None: self.orbit_service=OrbitService()
        now=datetime.now(timezone.utc)
        resolved=self.repository.resolve_expired(now)  # NOUVEAU: les approches passées deviennent RESOLVED
        if resolved: logger.info("%s expired alerts resolved",resolved)
        hits=await asyncio.to_thread(self._screen,satellites,debris,now)
        created=0
        for satellite,piece,distance,approach,risk in hits:
            alert,is_new=self.repository.upsert_alert(satellite,piece,distance,approach,risk,danger_settings.duplicate_tolerance_seconds)
            if is_new:
                created += 1; logger.warning("New %s risk alert: %s/%s",risk,satellite.norad_id,piece.norad_id)
                await manager.broadcast({"type":"NEW_ALERT","alert":alert.model_dump(mode="json")})
        logger.info("Danger monitoring cycle completed: %s new alerts",created); return created

    async def _loop(self):
        while True:
            try: await self.run_once()
            except Exception: logger.exception("Danger monitoring cycle failed")
            await asyncio.sleep(danger_settings.monitor_interval_seconds)

    def start(self):
        if danger_settings.monitor_enabled and self._task is None: self._task=asyncio.create_task(self._loop())
    async def stop(self):
        # FIX: annule la tâche, attend sa terminaison, puis remet _task à None
        # (avant: double if redondant + _task jamais remis à None → start() ne pouvait plus relancer après stop)
        task=self._task
        if task is None: return
        self._task=None
        task.cancel()
        try: await task
        except asyncio.CancelledError: pass