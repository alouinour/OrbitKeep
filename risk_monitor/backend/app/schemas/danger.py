from datetime import datetime
from enum import StrEnum
from pydantic import BaseModel, Field
class ObjectType(StrEnum): ACTIVE_SATELLITE="ACTIVE_SATELLITE"; DEBRIS="DEBRIS"; ROCKET_BODY="ROCKET_BODY"; UNKNOWN="UNKNOWN"
class RiskLevel(StrEnum): LOW="LOW"; MEDIUM="MEDIUM"; HIGH="HIGH"
class AlertStatus(StrEnum): ACTIVE="ACTIVE"; RESOLVED="RESOLVED"
class OrbitalObject(BaseModel): id:str; name:str; norad_id:int; object_type:ObjectType; tle_line1:str; tle_line2:str; is_active:bool
class AlertResponse(BaseModel): id:str; satellite_id:str; satellite_name:str; debris_id:str; debris_name:str; distance_km:float; closest_approach_time:datetime; risk_level:RiskLevel; detected_at:datetime; is_read:bool; status:AlertStatus
class UnreadCount(BaseModel): unread:int
class DashboardResponse(BaseModel): total_alerts:int; unread_alerts:int; high_risk:int; medium_risk:int; low_risk:int; active_threats:int; monitored_satellites:int; monitored_objects:int
class MapObject(BaseModel): id:str; name:str; norad_id:int; object_type:ObjectType; latitude:float; longitude:float; altitude_km:float; risk_level:RiskLevel|None=None
class MarkReadResponse(BaseModel): updated:int=Field(ge=0)