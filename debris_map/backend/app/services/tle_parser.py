import math
from datetime import datetime, timezone

from sgp4.api import Satrec, jday

from app.models.debris import DebrisObject

EARTH_RADIUS_KM = 6378.137


def _gmst_radians(jd: float, fr: float) -> float:
    """Greenwich Mean Sidereal Time, in radians (needed to rotate ECI -> ECEF)."""
    t = (jd + fr - 2451545.0) / 36525.0
    gmst_deg = (
        280.46061837
        + 360.98564736629 * (jd + fr - 2451545.0)
        + 0.000387933 * t * t
        - t**3 / 38710000.0
    ) % 360.0
    return math.radians(gmst_deg)


def _eci_to_geodetic(x: float, y: float, z: float, jd: float, fr: float) -> tuple[float, float, float]:
    """Convert ECI (km) to (lat, lon, altitude_km). Spherical Earth approximation —
    good enough for a visualization, not for precision orbit determination."""
    theta = _gmst_radians(jd, fr)
    cos_t, sin_t = math.cos(theta), math.sin(theta)
    x_ecef = x * cos_t + y * sin_t
    y_ecef = -x * sin_t + y * cos_t
    z_ecef = z

    r = math.sqrt(x_ecef**2 + y_ecef**2 + z_ecef**2)
    lat = math.degrees(math.asin(z_ecef / r))
    lon = math.degrees(math.atan2(y_ecef, x_ecef))
    altitude = r - EARTH_RADIUS_KM
    return lat, lon, altitude


def parse_tle_to_object(
    id_: str,
    nom: str,
    line1: str,
    line2: str,
    type_: str,
    when: datetime | None = None,
) -> DebrisObject | None:
    """Parse a TLE and propagate it to `when` (default: now) using SGP4.
    Returns None if the TLE is malformed or SGP4 can't propagate it."""
    try:
        sat = Satrec.twoline2rv(line1, line2)
    except Exception:
        return None

    when = when or datetime.now(timezone.utc)
    jd, fr = jday(when.year, when.month, when.day, when.hour, when.minute, when.second)
    error, r, _v = sat.sgp4(jd, fr)
    if error != 0:
        return None

    lat, lon, altitude = _eci_to_geodetic(r[0], r[1], r[2], jd, fr)
    return DebrisObject(id=id_, nom=nom.strip(), type=type_, lat=lat, lon=lon, altitude=altitude)