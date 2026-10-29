from app.core.config import danger_settings
from app.schemas.danger import RiskLevel


def classify_risk(distance_km: float) -> RiskLevel:
    if distance_km < 0: raise ValueError("distance_km cannot be negative")
    if distance_km < danger_settings.high_risk_distance_km: return RiskLevel.HIGH
    if distance_km < danger_settings.medium_risk_distance_km: return RiskLevel.MEDIUM
    return RiskLevel.LOW
