"""Environment-configurable project assumptions.

The default propulsion and pollution values are planning assumptions, not validated
environmental or spacecraft-performance data. Replace them for an actual mission.
"""
from dataclasses import dataclass
import os


def _float(name: str, default: float) -> float:
    try:
        return float(os.getenv(name, default))
    except ValueError as exc:
        raise ValueError(f"{name} must be numeric") from exc


@dataclass(frozen=True)
class Settings:
    cors_origins: tuple[str, ...]
    default_specific_impulse_s: float
    graveyard_altitude_km: float
    moon_impact_delta_v_m_s: float
    pollution_atmospheric: float
    pollution_ocean: float
    pollution_moon: float
    pollution_graveyard: float


def get_settings() -> Settings:
    origins = tuple(item.strip() for item in os.getenv(
        "CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",") if item.strip())
    return Settings(
        cors_origins=origins,
        default_specific_impulse_s=_float("DEFAULT_SPECIFIC_IMPULSE_S", 220.0),
        graveyard_altitude_km=_float("GRAVEYARD_ALTITUDE_KM", 2_000.0),
        moon_impact_delta_v_m_s=_float("MOON_IMPACT_DELTA_V_M_S", 3_000.0),
        pollution_atmospheric=_float("POLLUTION_ATMOSPHERIC", 35.0),
        pollution_ocean=_float("POLLUTION_OCEAN", 80.0),
        pollution_moon=_float("POLLUTION_MOON", 55.0),
        pollution_graveyard=_float("POLLUTION_GRAVEYARD", 15.0),
    )


settings = get_settings()
