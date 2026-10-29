from datetime import datetime, timedelta, timezone
import numpy as np
from app.schemas.danger import OrbitalObject


def calculate_distance(position_a: np.ndarray, position_b: np.ndarray) -> float:
    """Return Euclidean separation in kilometres for ECI Cartesian vectors."""
    return float(np.linalg.norm(np.asarray(position_a, dtype=float) - np.asarray(position_b, dtype=float)))


def sample_times(start: datetime, window_minutes: int, sample_seconds: int) -> list[datetime]:
    """NOUVEAU: instants échantillonnés sur la fenêtre de prédiction."""
    start = start.astimezone(timezone.utc)
    return [start + timedelta(seconds=s) for s in range(0, window_minutes * 60 + 1, sample_seconds)]


def closest_from_positions(positions_a: np.ndarray, positions_b: np.ndarray, times: list[datetime]) -> tuple[float, datetime]:
    """NOUVEAU: distance minimale entre deux trajectoires (n,3) déjà propagées sur les mêmes instants."""
    distances = np.linalg.norm(positions_a - positions_b, axis=1)
    index = int(np.argmin(distances))
    return float(distances[index]), times[index]


def closest_approach(satellite: OrbitalObject, debris: OrbitalObject, orbit_service, start: datetime, window_minutes: int, sample_seconds: int) -> tuple[float, datetime]:
    # FIX: version vectorisée (2 propagations au lieu de 2 × nb_échantillons) — même résultat
    times = sample_times(start, window_minutes, sample_seconds)
    return closest_from_positions(orbit_service.get_positions(satellite, times), orbit_service.get_positions(debris, times), times)