from enum import Enum
from pydantic import BaseModel, Field


class DisposalMethod(str, Enum):
    atmospheric_reentry = "atmospheric_reentry"
    ocean_fall = "ocean_fall"
    moon_impact = "moon_impact"
    graveyard_orbit = "graveyard_orbit"


class PollutionCost(BaseModel):
    value: float = Field(ge=0)
    unit: str = "project_score"
    label: str
    source: str


class DisposalOption(BaseModel):
    method: DisposalMethod
    description: str
    status: str
    delta_v_m_s: float | None
    fuel_required_kg: float | None
    pollution: PollutionCost
    suitability_score: float = Field(ge=0, le=100)
    explanation: str
