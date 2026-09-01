from app.core.config import settings
from app.models.satellite import Satellite
from app.services.disposal_service import build_disposal_options, recommend


def test_all_disposal_methods_and_recommendation() -> None:
    options = build_disposal_options(Satellite(altitude_km=700, fuel_mass_kg=100, dry_mass_kg=500), 220, settings)
    assert len(options) == 4
    assert recommend(options)[0] is not None
    assert all(option.pollution.unit == "project_score" for option in options)


def test_insufficient_fuel_has_no_recommendation() -> None:
    options = build_disposal_options(Satellite(altitude_km=700, fuel_mass_kg=0, dry_mass_kg=500), 220, settings)
    assert recommend(options)[0] is None
