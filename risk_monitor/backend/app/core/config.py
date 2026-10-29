"""Environment-configurable project assumptions.

The default propulsion and pollution values are planning assumptions, not validated
environmental or spacecraft-performance data. Replace them for an actual mission.
"""
from dataclasses import dataclass
import os
from pydantic_settings import BaseSettings, SettingsConfigDict


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


class DangerSettings(BaseSettings):
    """Configuration for the TLE-based conjunction screening prototype."""
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    celestrak_base_url: str = "https://celestrak.org/NORAD/elements"
    celestrak_satellites_url: str = "https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=JSON"
    celestrak_debris_url: str = "https://celestrak.org/NORAD/elements/gp.php?GROUP=cosmos-1408-debris&FORMAT=JSON,https://celestrak.org/NORAD/elements/gp.php?GROUP=iridium-33-debris&FORMAT=JSON,https://celestrak.org/NORAD/elements/gp.php?GROUP=fengyun-1c-debris&FORMAT=JSON"
    celestrak_cache_seconds: int = 7200
    request_timeout_seconds: float = 20.0
    database_url: str = "sqlite:///./orbitkeep.db"
    monitor_enabled: bool = False
    monitor_interval_seconds: int = 300
    prediction_window_minutes: int = 60
    sampling_interval_seconds: int = 30
    high_risk_distance_km: float = 1.0
    medium_risk_distance_km: float = 5.0
    duplicate_tolerance_seconds: int = 300
    max_candidates_per_satellite: int = 75
    # NOUVEAU: CORS configurable (avant: localhost:5173 en dur dans main.py → inutilisable une fois déployé)
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    # NOUVEAU: plafond d'objets renvoyés par /api/danger/map (objets à risque toujours inclus en premier)
    map_max_objects: int = 1500


danger_settings = DangerSettings()