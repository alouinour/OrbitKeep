from pydantic import BaseModel, Field, field_validator


class Satellite(BaseModel):
    """Masses are required because the rocket equation needs initial and dry mass."""

    altitude_km: float = Field(gt=0, description="Circular orbit altitude above Earth, km", examples=[700])
    fuel_mass_kg: float = Field(ge=0, description="Usable onboard propellant, kg", examples=[42])
    dry_mass_kg: float = Field(gt=0, description="Satellite mass excluding usable propellant, kg", examples=[500])

    @field_validator("altitude_km", "fuel_mass_kg", "dry_mass_kg")
    @classmethod
    def finite(cls, value: float) -> float:
        if value != value or value in (float("inf"), float("-inf")):
            raise ValueError("must be a finite number")
        return value
