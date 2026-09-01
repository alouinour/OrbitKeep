from app.core.config import Settings
from app.models.disposal import DisposalMethod, PollutionCost


def get_pollution_cost(method: DisposalMethod, settings: Settings) -> PollutionCost:
    values = {
        DisposalMethod.atmospheric_reentry: settings.pollution_atmospheric,
        DisposalMethod.ocean_fall: settings.pollution_ocean,
        DisposalMethod.moon_impact: settings.pollution_moon,
        DisposalMethod.graveyard_orbit: settings.pollution_graveyard,
    }
    return PollutionCost(value=values[method], label="Configurable comparative project score", source="OrbitKeep project assumption; not a scientifically validated coefficient")
