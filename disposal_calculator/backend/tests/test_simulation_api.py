from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_calculate_success() -> None:
    response = client.post("/simulate/calculate", json={"satellite": {"altitude_km": 700, "fuel_mass_kg": 100, "dry_mass_kg": 500}})
    assert response.status_code == 200
    assert len(response.json()["disposal_options"]) == 4


def test_invalid_payload_has_clear_validation_error() -> None:
    response = client.post("/simulate/calculate", json={"satellite": {"altitude_km": -1, "fuel_mass_kg": -2, "dry_mass_kg": 0}})
    assert response.status_code == 422


def test_zero_fuel_returns_structured_option_status() -> None:
    response = client.post("/simulate/calculate", json={"satellite": {"altitude_km": 700, "fuel_mass_kg": 0, "dry_mass_kg": 500}})
    assert response.status_code == 200
    assert response.json()["recommendation"]["method"] is None
