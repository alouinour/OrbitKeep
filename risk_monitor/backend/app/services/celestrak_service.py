import asyncio
import json
import logging
import time
from uuid import uuid5, NAMESPACE_URL

import httpx

from app.core.config import danger_settings
from app.schemas.danger import ObjectType, OrbitalObject


logger = logging.getLogger(__name__)


class CelestrakError(RuntimeError):
    pass


class CelestrakService:
    def __init__(self, client: httpx.AsyncClient | None = None):
        self.client = client

        self._cache: dict[str, tuple[float, list[OrbitalObject]]] = {}
        self._blocked: dict[str, float] = {}

        self._lock = asyncio.Lock()

    async def fetch_active_satellites(self) -> list[OrbitalObject]:
        return await self._fetch(
            "satellites",
            danger_settings.celestrak_satellites_url,
            ObjectType.ACTIVE_SATELLITE,
        )

    async def fetch_debris(self) -> list[OrbitalObject]:
        # Supporte plusieurs URLs séparées par des virgules (ex: 3 groupes de débris)
        urls = [u.strip() for u in danger_settings.celestrak_debris_url.split(",") if u.strip()]
        if len(urls) == 1:
            return await self._fetch("debris", urls[0], ObjectType.DEBRIS)
        # Plusieurs groupes : on les fetch en parallèle et on déduplique par norad_id
        results = await asyncio.gather(
            *[self._fetch(f"debris_{i}", url, ObjectType.DEBRIS) for i, url in enumerate(urls)],
            return_exceptions=True,
        )
        seen: set[int] = set()
        combined: list[OrbitalObject] = []
        for result in results:
            if isinstance(result, Exception):
                logger.warning("One debris group failed: %s", result)
                continue
            for obj in result:
                if obj.norad_id not in seen:
                    seen.add(obj.norad_id)
                    combined.append(obj)
        if not combined:
            raise CelestrakError("All debris groups failed to fetch")
        logger.info("Combined debris catalog: %d unique objects from %d groups", len(combined), len(urls))
        return combined

    async def _fetch(
        self,
        key: str,
        url: str,
        default_type: ObjectType,
    ) -> list[OrbitalObject]:

        async with self._lock:

            # ---------------------------------------------------------
            # 1. Vérifier le cache
            # ---------------------------------------------------------
            cached = self._cache.get(key)

            if cached:
                cache_age = time.monotonic() - cached[0]

                if cache_age < danger_settings.celestrak_cache_seconds:
                    logger.debug(
                        "Using cached CelesTrak data for %s (age=%.1fs)",
                        key,
                        cache_age,
                    )
                    return cached[1]

            # ---------------------------------------------------------
            # 2. Vérifier si CelesTrak est temporairement bloqué
            # ---------------------------------------------------------
            blocked_until = self._blocked.get(key, 0)

            if time.monotonic() < blocked_until:

                remaining = blocked_until - time.monotonic()

                logger.warning(
                    "CelesTrak %s is temporarily blocked. "
                    "Retrying in %.0f seconds.",
                    key,
                    remaining,
                )

                if cached:
                    return cached[1]

                raise CelestrakError(
                    f"CelesTrak temporarily unavailable for {key}"
                )

            # ---------------------------------------------------------
            # 3. Headers
            # ---------------------------------------------------------
            headers = {
                "User-Agent": (
                    "OrbitKeep/1.0 "
                    "(educational project; contact@orbitkeep.dev)"
                ),
                "Accept": "application/json, text/plain, */*",
            }

            # ---------------------------------------------------------
            # 4. Timeout
            # ---------------------------------------------------------
            timeout_seconds = max(
                float(danger_settings.request_timeout_seconds),
                30.0,
            )

            timeout = httpx.Timeout(
                connect=15.0,
                read=timeout_seconds,
                write=15.0,
                pool=15.0,
            )

            # ---------------------------------------------------------
            # 5. Nombre de tentatives
            # ---------------------------------------------------------
            max_attempts = 3

            last_error: Exception | None = None

            for attempt in range(1, max_attempts + 1):

                try:

                    logger.info(
                        "Fetching CelesTrak %s "
                        "(attempt %d/%d): %s",
                        key,
                        attempt,
                        max_attempts,
                        url,
                    )

                    # -------------------------------------------------
                    # Utiliser le client fourni si disponible
                    # -------------------------------------------------
                    if self.client:

                        response = await self.client.get(
                            url,
                            timeout=timeout,
                            headers=headers,
                        )

                    else:

                        async with httpx.AsyncClient(
                            timeout=timeout,
                            follow_redirects=True,
                        ) as client:

                            response = await client.get(
                                url,
                                headers=headers,
                            )

                    # -------------------------------------------------
                    # 403
                    # -------------------------------------------------
                    if response.status_code == 403:

                        self._blocked[key] = (
                            time.monotonic() + 7200
                        )

                        logger.warning(
                            "CelesTrak returned 403 for %s. "
                            "Backing off for 2 hours.",
                            key,
                        )

                        if cached:
                            logger.warning(
                                "Returning stale cached data for %s",
                                key,
                            )
                            return cached[1]

                        raise CelestrakError(
                            f"CelesTrak returned 403 for {key}"
                        )

                    # -------------------------------------------------
                    # Other HTTP errors
                    # -------------------------------------------------
                    response.raise_for_status()

                    # -------------------------------------------------
                    # Parse response
                    # -------------------------------------------------
                    content_type = response.headers.get(
                        "content-type",
                        "",
                    ).lower()

                    body = response.text

                    if (
                        "json" in content_type
                        or body.lstrip().startswith("[")
                    ):
                        objects = self.parse_omm_json(
                            body,
                            default_type,
                        )
                    else:
                        objects = self.parse_tle(
                            body,
                            default_type,
                        )

                    # -------------------------------------------------
                    # Vérifier données
                    # -------------------------------------------------
                    if not objects:
                        raise CelestrakError(
                            f"CelesTrak returned no valid "
                            f"orbital objects for {key}"
                        )

                    # -------------------------------------------------
                    # Mettre à jour le cache
                    # -------------------------------------------------
                    self._cache[key] = (
                        time.monotonic(),
                        objects,
                    )

                    logger.info(
                        "CelesTrak %s successfully fetched: %d objects",
                        key,
                        len(objects),
                    )

                    return objects

                # -----------------------------------------------------
                # Timeout
                # -----------------------------------------------------
                except httpx.ConnectTimeout as exc:

                    last_error = exc

                    logger.warning(
                        "CelesTrak connection timeout for %s "
                        "(attempt %d/%d)",
                        key,
                        attempt,
                        max_attempts,
                    )

                except httpx.ReadTimeout as exc:

                    last_error = exc

                    logger.warning(
                        "CelesTrak read timeout for %s "
                        "(attempt %d/%d)",
                        key,
                        attempt,
                        max_attempts,
                    )

                # -----------------------------------------------------
                # Network error
                # -----------------------------------------------------
                except httpx.RequestError as exc:

                    last_error = exc

                    logger.warning(
                        "CelesTrak request error for %s: %s "
                        "(attempt %d/%d)",
                        key,
                        exc,
                        attempt,
                        max_attempts,
                    )

                # -----------------------------------------------------
                # HTTP error
                # -----------------------------------------------------
                except httpx.HTTPStatusError as exc:

                    last_error = exc

                    logger.error(
                        "CelesTrak HTTP error for %s: %s",
                        key,
                        exc,
                    )

                    break

                # -----------------------------------------------------
                # Parsing / validation
                # -----------------------------------------------------
                except (ValueError, CelestrakError) as exc:

                    last_error = exc

                    logger.error(
                        "CelesTrak data error for %s: %s",
                        key,
                        exc,
                    )

                    break

                # -----------------------------------------------------
                # Retry delay
                # -----------------------------------------------------
                if attempt < max_attempts:

                    delay = 2 ** (attempt - 1)

                    logger.info(
                        "Retrying CelesTrak %s in %d seconds...",
                        key,
                        delay,
                    )

                    await asyncio.sleep(delay)

            # ---------------------------------------------------------
            # 6. Fallback sur cache
            # ---------------------------------------------------------
            if cached:

                logger.warning(
                    "CelesTrak unavailable for %s. "
                    "Using stale cached data.",
                    key,
                )

                return cached[1]

            # ---------------------------------------------------------
            # 7. Aucun cache disponible
            # ---------------------------------------------------------
            logger.error(
                "Unable to retrieve CelesTrak data for %s after "
                "%d attempts",
                key,
                max_attempts,
            )

            raise CelestrakError(
                f"Unable to retrieve valid CelesTrak "
                f"orbital data for {key}"
            ) from last_error

    # =================================================================
    # OMM JSON
    # =================================================================

    @staticmethod
    def parse_omm_json(
        payload: str,
        default_type: ObjectType,
    ) -> list[OrbitalObject]:

        try:
            records = json.loads(payload)
        except json.JSONDecodeError as exc:
            raise ValueError("Invalid JSON from CelesTrak") from exc

        if not isinstance(records, list):
            raise ValueError("Unexpected JSON structure from CelesTrak")

        objects: list[OrbitalObject] = []

        for rec in records:
            try:
                norad_id = int(rec["NORAD_CAT_ID"])

                # Priorité 1 : lignes TLE déjà présentes dans le JSON
                line1 = rec.get("TLE_LINE1", "")
                line2 = rec.get("TLE_LINE2", "")

                # Priorité 2 : reconstruire depuis les éléments OMM
                if not line1 or not line2:
                    line1, line2 = CelestrakService._omm_to_tle(rec, norad_id)

                if not line1 or not line2:
                    continue

                name = (
                    rec.get("OBJECT_NAME")
                    or rec.get("SATNAME")
                    or "UNKNOWN"
                )
                upper = name.upper()
                object_type = (
                    ObjectType.ROCKET_BODY
                    if ("R/B" in upper or "ROCKET BODY" in upper)
                    else default_type
                )

                objects.append(OrbitalObject(
                    id=str(uuid5(NAMESPACE_URL, f"norad:{norad_id}")),
                    name=name,
                    norad_id=norad_id,
                    object_type=object_type,
                    tle_line1=line1,
                    tle_line2=line2,
                    is_active=(object_type is ObjectType.ACTIVE_SATELLITE),
                ))

            except (KeyError, ValueError, TypeError):
                continue

        return objects

    @staticmethod
    def _omm_to_tle(rec: dict, norad_id: int) -> tuple[str, str]:
        """Reconstruit des lignes TLE depuis un enregistrement OMM JSON CelesTrak."""
        try:
            from datetime import datetime as _dt

            # --- Epoch ---
            epoch_str = rec["EPOCH"]  # "2026-09-26T01:31:20.545536"
            epoch_dt = _dt.fromisoformat(epoch_str.replace("Z", "+00:00"))
            year2 = epoch_dt.year % 100
            day_of_year = epoch_dt.timetuple().tm_yday
            frac_day = (
                epoch_dt.hour * 3600
                + epoch_dt.minute * 60
                + epoch_dt.second
                + epoch_dt.microsecond / 1e6
            ) / 86400.0
            epoch_field = f"{year2:02d}{day_of_year + frac_day:012.8f}"

            # --- Éléments ---
            bstar       = float(rec.get("BSTAR", 0.0))
            mm_dot      = float(rec.get("MEAN_MOTION_DOT", 0.0))
            mm_ddot     = float(rec.get("MEAN_MOTION_DDOT", 0.0))
            inc         = float(rec["INCLINATION"])
            raan        = float(rec["RA_OF_ASC_NODE"])
            ecc         = float(rec["ECCENTRICITY"])
            argp        = float(rec["ARG_OF_PERICENTER"])
            ma          = float(rec["MEAN_ANOMALY"])
            mm          = float(rec["MEAN_MOTION"])
            rev         = int(rec.get("REV_AT_EPOCH", 0))
            eph         = int(rec.get("EPHEMERIS_TYPE", 0))
            elset       = int(rec.get("ELEMENT_SET_NO", 999))
            cls         = rec.get("CLASSIFICATION_TYPE", "U")
            intl        = rec.get("OBJECT_ID", "00001A  ").replace("-", "")[:8].ljust(8)

            # Formatage BSTAR en notation "décimale" TLE : ±.XXXXXE±Y → ±XXXXXYE±Y compressé
            def _bstar_fmt(v: float) -> str:
                if v == 0.0:
                    return " 00000+0"
                import math
                sign = "-" if v < 0 else " "
                v = abs(v)
                exp = math.floor(math.log10(v)) + 1
                mantissa = v / (10 ** exp)
                mantissa_int = round(mantissa * 1e5)
                exp_sign = "+" if exp >= 0 else "-"
                return f"{sign}{mantissa_int:05d}{exp_sign}{abs(exp):01d}"

            def _dot_fmt(v: float) -> str:
                if v == 0.0:
                    return " .00000000"
                sign = " " if v >= 0 else "-"
                return f"{sign}.{abs(v) * 1e8:08.0f}"

            # --- Ligne 1 ---
            norad5 = norad_id % 100000  # TLE limité à 5 chiffres
            l1_body = (
                f"1 {norad5:05d}{cls} "
                f"{intl} "
                f"{epoch_field} "
                f"{_dot_fmt(mm_dot)} "
                f"{_bstar_fmt(mm_ddot)} "
                f"{_bstar_fmt(bstar)} "
                f"{eph} {elset % 10000:4d}"
            )

            # --- Ligne 2 ---
            ecc7 = round(ecc * 1e7)
            l2_body = (
                f"2 {norad5:05d} "
                f"{inc:8.4f} "
                f"{raan:8.4f} "
                f"{ecc7:07d} "
                f"{argp:8.4f} "
                f"{ma:8.4f} "
                f"{mm:11.8f}"
                f"{rev % 100000:5d}"
            )

            # Checksum (modulo 10 de la somme des chiffres + 1 pour "-")
            def _cksum(line: str) -> int:
                return sum(
                    int(c) if c.isdigit() else (1 if c == "-" else 0)
                    for c in line
                ) % 10

            line1 = l1_body + str(_cksum(l1_body))
            line2 = l2_body + str(_cksum(l2_body))
            return line1, line2

        except (KeyError, ValueError, TypeError, ZeroDivisionError):
            return "", ""

    # =================================================================
    # TLE
    # =================================================================

    @staticmethod
    def parse_tle(
        payload: str,
        default_type: ObjectType,
    ) -> list[OrbitalObject]:

        lines = [
            line.strip()
            for line in payload.splitlines()
            if line.strip()
        ]

        objects: list[OrbitalObject] = []

        index = 0

        while index < len(lines):

            if lines[index].startswith("1 "):

                name = "UNKNOWN"

            else:

                name = lines[index]
                index += 1

            if (
                index + 1 >= len(lines)
                or not lines[index].startswith("1 ")
                or not lines[index + 1].startswith("2 ")
            ):
                break

            line1 = lines[index]
            line2 = lines[index + 1]

            index += 2

            try:

                norad_id = int(line1[2:7])

            except ValueError as exc:

                raise ValueError(
                    "Invalid NORAD ID in TLE"
                ) from exc

            upper = name.upper()

            object_type = (
                ObjectType.ROCKET_BODY
                if (
                    "R/B" in upper
                    or "ROCKET BODY" in upper
                )
                else default_type
            )

            objects.append(
                OrbitalObject(
                    id=str(
                        uuid5(
                            NAMESPACE_URL,
                            f"norad:{norad_id}",
                        )
                    ),
                    name=name,
                    norad_id=norad_id,
                    object_type=object_type,
                    tle_line1=line1,
                    tle_line2=line2,
                    is_active=(
                        object_type
                        is ObjectType.ACTIVE_SATELLITE
                    ),
                )
            )

        return objects