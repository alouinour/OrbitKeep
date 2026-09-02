import pytest
from app.services.orbital_mechanics import calculate_hohmann_delta_v


def test_hohmann_same_orbit_is_zero() -> None:
    assert calculate_hohmann_delta_v(700, 700) == pytest.approx(0)


def test_hohmann_transfer_is_positive_and_plausible() -> None:
    assert 300 < calculate_hohmann_delta_v(700, 120) < 500
