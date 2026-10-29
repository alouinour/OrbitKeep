from pydantic import BaseModel, Field, model_validator
from .satellite import Satellite
from .disposal import DisposalMethod, DisposalOption


class SimulationRequest(BaseModel):
    satellite: Satellite
    specific_impulse_s: float | None = Field(default=None, gt=0, description="Engine specific impulse, seconds. Uses documented project default when omitted.")

    @model_validator(mode="after")
    def valid_orbit(self) -> "SimulationRequest":
        if self.satellite.altitude_km < 120:
            raise ValueError("altitude_km must be at least 120 km for this circular-orbit disposal model")
        return self


class SimulationSummary(BaseModel):
    reference_reentry_delta_v_m_s: float
    reference_reentry_fuel_kg: float
    specific_impulse_s: float
    assumptions: list[str]


class Recommendation(BaseModel):
    method: DisposalMethod | None
    reason: str


class SimulationResponse(BaseModel):
    satellite: Satellite
    simulation: SimulationSummary
    disposal_options: list[DisposalOption]
    recommendation: Recommendation


class ErrorBody(BaseModel):
    code: str
    message: str
    details: dict[str, object] = {}


class ErrorResponse(BaseModel):
    error: ErrorBody
