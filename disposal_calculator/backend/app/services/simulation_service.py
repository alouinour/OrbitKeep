from app.core.config import settings
from app.core.constants import ATMOSPHERIC_INTERFACE_ALTITUDE_KM
from app.models.simulation import Recommendation, SimulationRequest, SimulationResponse, SimulationSummary
from app.services.disposal_service import build_disposal_options, recommend


def run_simulation(request: SimulationRequest) -> SimulationResponse:
    isp = request.specific_impulse_s or settings.default_specific_impulse_s
    options = build_disposal_options(request.satellite, isp, settings)
    reentry = options[0]
    method, reason = recommend(options)
    return SimulationResponse(satellite=request.satellite, simulation=SimulationSummary(reference_reentry_delta_v_m_s=reentry.delta_v_m_s or 0, reference_reentry_fuel_kg=reentry.fuel_required_kg or 0, specific_impulse_s=isp, assumptions=["Circular, coplanar two-body Hohmann transfers.", f"Re-entry target is {ATMOSPHERIC_INTERFACE_ALTITUDE_KM:g} km.", "Specific impulse and pollution values are configurable project assumptions."]), disposal_options=options, recommendation=Recommendation(method=method, reason=reason))
