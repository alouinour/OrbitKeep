import time

from app.models.debris import DebrisObject
from app.services.celestrak import fetch_tle
from app.services.tle_parser import parse_tle_to_object

CACHE_TTL_SECONDS = 300  # 5 minutes
SATELLITE_LIMIT = 40  # évite de faire ramer le rendu du globe avec ~9000 satellites

_cache: dict[str, tuple[float, list[DebrisObject]]] = {}


async def get_debris_objects() -> list[DebrisObject]:
    now = time.monotonic()
    cached = _cache.get("debris")
    if cached and (now - cached[0]) < CACHE_TTL_SECONDS:
        return cached[1]

    objects: list[DebrisObject] = []

    satellites = await fetch_tle("active")
    for i, (name, line1, line2) in enumerate(satellites[:SATELLITE_LIMIT]):
        obj = parse_tle_to_object(f"sat-{i:03d}", name, line1, line2, "satellite")
        if obj:
            objects.append(obj)

    debris = await fetch_tle("cosmos-2251-debris")
    for i, (name, line1, line2) in enumerate(debris):
        obj = parse_tle_to_object(f"deb-{i:03d}", name, line1, line2, "debris")
        if obj:
            objects.append(obj)

    _cache["debris"] = (now, objects)
    return objects