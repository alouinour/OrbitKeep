from app.core.config import Settings
from app.core.constants import ATMOSPHERIC_INTERFACE_ALTITUDE_KM
from app.models.disposal import DisposalMethod, DisposalOption
from app.models.satellite import Satellite
from app.services.fuel_calculator import calculate_required_propellant_kg
from app.services.orbital_mechanics import calculate_hohmann_delta_v
from app.services.pollution_service import get_pollution_cost


def _option(method: DisposalMethod, description: str, delta_v: float, satellite: Satellite, isp: float, settings: Settings, note: str) -> DisposalOption:
    fuel = calculate_required_propellant_kg(delta_v, satellite.dry_mass_kg, satellite.fuel_mass_kg, isp)
    feasible = fuel <= satellite.fuel_mass_kg
    return DisposalOption(method=method, description=description, status="feasible" if feasible else "insufficient_fuel", delta_v_m_s=round(delta_v, 2), fuel_required_kg=round(fuel, 3), pollution=get_pollution_cost(method, settings), suitability_score=0 if not feasible else 100 - min(100, fuel / max(satellite.fuel_mass_kg, 0.001) * 40) - get_pollution_cost(method, settings).value * .3, explanation=(note if feasible else f"Requires {fuel:.3f} kg but only {satellite.fuel_mass_kg:.3f} kg is available. {note}"))


def build_disposal_options(satellite: Satellite, isp: float, settings: Settings) -> list[DisposalOption]:
    reentry_dv = calculate_hohmann_delta_v(satellite.altitude_km, ATMOSPHERIC_INTERFACE_ALTITUDE_KM)
    graveyard_dv = calculate_hohmann_delta_v(satellite.altitude_km, settings.graveyard_altitude_km)
    return [
        _option(DisposalMethod.atmospheric_reentry, "Lower orbit to the project re-entry interface.", reentry_dv, satellite, isp, settings, "Atmospheric interface is a configurable 120 km project assumption."),
        _option(DisposalMethod.ocean_fall, "Controlled re-entry with a targeted ocean footprint.", reentry_dv, satellite, isp, settings, "Uses the same idealized deorbit maneuver; targeting and breakup analysis are outside this model."),
        _option(DisposalMethod.moon_impact, "Mission-specific transfer and impact trajectory.", settings.moon_impact_delta_v_m_s, satellite, isp, settings, "Delta-v is a configurable project planning proxy; lunar transfer design is required before use."),
        _option(DisposalMethod.graveyard_orbit, "Transfer to a higher, configurable disposal orbit.", graveyard_dv, satellite, isp, settings, "Target altitude is a configurable project assumption and is not a regulatory prescription."),
    ]


def recommend(options: list[DisposalOption]):
    feasible = [option for option in options if option.status == "feasible"]
    if not feasible:
        return None, "No option is feasible with the available fuel. Increase propellant, revise propulsion data, or perform mission-specific analysis."
    chosen = max(feasible, key=lambda option: option.suitability_score)
    return chosen.method, "Selected from feasible options using the transparent project suitability score, which combines fuel margin and configurable pollution score; it does not select pollution alone."
