from datetime import datetime, timezone
import numpy as np
from app.schemas.danger import OrbitalObject


class OrbitPropagationError(RuntimeError): pass

_MAX_CACHED_SATELLITES = 50_000


class OrbitService:
    """TLE propagation using Skyfield; positions are geocentric ECI/ICRF vectors in km."""
    def __init__(self):
        try:
            from skyfield.api import load
            self.timescale = load.timescale(builtin=True)
        except ImportError as exc: raise OrbitPropagationError("skyfield is required for orbital propagation") from exc
        self._satellites: dict = {}  # NOUVEAU: cache des EarthSatellite (avant: TLE re-parsé à CHAQUE appel)

    def _satellite(self, obj):
        # FIX: perf — construire un EarthSatellite (init SGP4) à chaque position était le goulot d'étranglement
        key = (obj.norad_id, obj.tle_line1, obj.tle_line2)
        satellite = self._satellites.get(key)
        if satellite is None:
            from skyfield.api import EarthSatellite
            if len(self._satellites) >= _MAX_CACHED_SATELLITES: self._satellites.clear()
            satellite = self._satellites[key] = EarthSatellite(obj.tle_line1, obj.tle_line2, obj.name, self.timescale)
        return satellite

    def get_position(self, obj: OrbitalObject, timestamp: datetime) -> np.ndarray:
        try:
            t=timestamp.astimezone(timezone.utc); sf_time=self.timescale.from_datetime(t)
            return np.asarray(self._satellite(obj).at(sf_time).position.km, dtype=float)
        except Exception as exc: raise OrbitPropagationError(f"Unable to propagate NORAD {obj.norad_id}") from exc

    def to_time(self, timestamps: list[datetime]):
        """NOUVEAU: convertit une liste de datetimes en Time Skyfield (à faire UNE fois par cycle)."""
        return self.timescale.from_datetimes([t.astimezone(timezone.utc) for t in timestamps])

    def get_positions(self, obj: OrbitalObject, timestamps: list[datetime], sf_time=None) -> np.ndarray:
        """NOUVEAU: positions vectorisées, tableau (n, 3) en km. Une seule propagation pour tous les instants."""
        try:
            t = sf_time if sf_time is not None else self.to_time(timestamps)
            positions = np.asarray(self._satellite(obj).at(t).position.km, dtype=float).T
        except Exception as exc: raise OrbitPropagationError(f"Unable to propagate NORAD {obj.norad_id}") from exc
        # SGP4 renvoie NaN pour un satellite dont l'orbite a décru / TLE périmé
        if not np.isfinite(positions).all(): raise OrbitPropagationError(f"Invalid propagation for NORAD {obj.norad_id}")
        return positions

    def map_position(self, obj: OrbitalObject, timestamp: datetime) -> tuple[float,float,float]:
        try:
            from skyfield.api import wgs84
            subpoint=wgs84.subpoint(self._satellite(obj).at(self.timescale.from_datetime(timestamp.astimezone(timezone.utc))))
            lat,lon,alt=float(subpoint.latitude.degrees), float(subpoint.longitude.degrees), float(subpoint.elevation.km)
        except Exception as exc: raise OrbitPropagationError(f"Unable to map NORAD {obj.norad_id}") from exc
        # FIX: NaN n'est pas sérialisable en JSON → toute la réponse /map plantait à cause d'un seul TLE périmé
        if not all(np.isfinite(v) for v in (lat,lon,alt)): raise OrbitPropagationError(f"Invalid position for NORAD {obj.norad_id}")
        return lat, lon, alt