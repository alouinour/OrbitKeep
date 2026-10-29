export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

export type AlertStatus = "ACTIVE" | "RESOLVED";

export interface DashboardResponse {
  total_alerts: number;
  unread_alerts: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  active_threats: number;
  monitored_satellites: number;
  monitored_objects: number;
}

export interface AlertResponse {
  id: string;
  satellite_name: string;
  debris_name: string;
  risk_level: RiskLevel;
  distance_km: number;
  closest_approach_time: string;
  status: AlertStatus;
  is_read: boolean;
}

export interface MapObject {
  id: string;
  name: string;
  object_type: string;
  latitude: number;
  longitude: number;
  altitude_km: number;
  risk_level?: RiskLevel | null;
}

// NOUVEAU: le backend renvoie { updated: n } pour les PATCH read / read-all
export interface MarkReadResponse {
  updated: number;
}