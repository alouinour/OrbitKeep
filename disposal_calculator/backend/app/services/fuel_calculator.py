"""Tsiolkovsky rocket-equation helpers."""
from math import exp
from app.core.constants import STANDARD_GRAVITY_M_S2


def calculate_required_propellant_kg(delta_v_m_s: float, dry_mass_kg: float, available_fuel_kg: float, specific_impulse_s: float) -> float:
    """Estimate required propellant using Δv = Isp*g0*ln(m0/mf).

    m0 is dry mass plus currently available propellant. The returned propellant is
    an ideal impulsive-burn estimate; reserve policy and maneuver losses are excluded.
    """
    if delta_v_m_s < 0 or dry_mass_kg <= 0 or available_fuel_kg < 0 or specific_impulse_s <= 0:
        raise ValueError("delta-v, masses, and specific impulse are outside valid ranges")
    initial_mass = dry_mass_kg + available_fuel_kg
    final_mass = initial_mass / exp(delta_v_m_s / (specific_impulse_s * STANDARD_GRAVITY_M_S2))
    return initial_mass - final_mass
