"""Two-body, coplanar circular-orbit Hohmann transfer calculations."""
from math import sqrt
from app.core.constants import EARTH_MU_M3_S2, EARTH_RADIUS_M


def calculate_hohmann_delta_v(initial_altitude_km: float, target_altitude_km: float) -> float:
    """Return total Hohmann transfer delta-v in m/s for two circular Earth orbits.

    Uses vis-viva velocities at both burns; API inputs are converted from km to m.
    This idealized model excludes inclination, drag, finite burns, and perturbations.
    """
    if initial_altitude_km < 0 or target_altitude_km < 0:
        raise ValueError("orbit altitudes cannot be negative")
    r1 = EARTH_RADIUS_M + initial_altitude_km * 1_000
    r2 = EARTH_RADIUS_M + target_altitude_km * 1_000
    v1, v2 = sqrt(EARTH_MU_M3_S2 / r1), sqrt(EARTH_MU_M3_S2 / r2)
    a_transfer = (r1 + r2) / 2
    v_transfer_1 = sqrt(EARTH_MU_M3_S2 * (2 / r1 - 1 / a_transfer))
    v_transfer_2 = sqrt(EARTH_MU_M3_S2 * (2 / r2 - 1 / a_transfer))
    return abs(v_transfer_1 - v1) + abs(v2 - v_transfer_2)
