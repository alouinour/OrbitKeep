import logging
from fastapi import APIRouter
from app.models.simulation import SimulationRequest, SimulationResponse
from app.services.simulation_service import run_simulation

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/simulate", tags=["simulation"])


@router.post("/calculate", response_model=SimulationResponse, summary="Calculate satellite disposal options")
def calculate_disposal(request: SimulationRequest) -> SimulationResponse:
    logger.info("Simulation requested for altitude_km=%s", request.satellite.altitude_km)
    try:
        return run_simulation(request)
    except ValueError:
        logger.exception("Simulation calculation failed")
        raise
