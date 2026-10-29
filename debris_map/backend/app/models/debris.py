from typing import Literal, Optional
from pydantic import BaseModel

DebrisType = Literal["satellite", "debris"]

class DebrisObject(BaseModel):
    id: str
    nom: str
    type: DebrisType
    lat: float
    lon: float
    altitude: Optional[float] = None