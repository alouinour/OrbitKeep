import pytest
from app.services.fuel_calculator import calculate_required_propellant_kg


def test_tsiolkovsky_zero_delta_v_needs_no_fuel() -> None:
    assert calculate_required_propellant_kg(0, 500, 100, 220) == pytest.approx(0)


def test_tsiolkovsky_needs_positive_fuel() -> None:
    assert calculate_required_propellant_kg(500, 500, 100, 220) > 0
