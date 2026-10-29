import logging

from fastapi import APIRouter

from app.models.debris import DebrisObject
from app.services.cache import get_debris_objects

logger = logging.getLogger(__name__)
router = APIRouter()

_mock_fallback: list[DebrisObject] = [
    DebrisObject(id="sat-001", nom="ISS (ZARYA)", type="satellite", lat=51.6, lon=-12.4, altitude=420),
    DebrisObject(id="deb-001", nom="COSMOS 1408 DEB", type="debris", lat=62.1, lon=-140.5, altitude=480),
]


@router.get("/api/debris", response_model=list[DebrisObject])
async def get_debris():
    try:
        objects = await get_debris_objects()
        return objects if objects else _mock_fallback
    except Exception:
        logger.exception("Failed to fetch live debris data, falling back to mock")
        return _mock_fallback