import type { AlertResponse } from "../types/riskMonitor";
import { RiskTag } from "./RiskTag";

function formatTime(value: string) {
  const date = new Date(value);
  // FIX: une date invalide faisait planter Intl.DateTimeFormat (RangeError) → page blanche
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function AlertList({
  alerts,
  onRead,
}: {
  alerts: AlertResponse[];
  onRead: (id: string) => void;
}) {
  if (!alerts.length) return <div className="empty">No active alerts in the current queue.</div>;

  const visible = alerts.slice(0, 10);
  const overflow = alerts.length - visible.length;

  return (
    <div className="alert-list">
      {visible.map((alert) => (
        <button
          type="button"
          className={`alert-row${alert.is_read ? " read" : ""}`}
          key={alert.id}
          onClick={() => onRead(alert.id)}
          disabled={alert.is_read}
          title={alert.is_read ? "Alert already read" : "Mark alert as read"}
        >
          <span className={`risk-bar ${alert.risk_level.toLowerCase()}`} />
          <span className="alert-main">
            <span className="alert-name">{alert.satellite_name} × {alert.debris_name}</span>
            <span className="alert-meta">
              {alert.distance_km.toFixed(2)} km · {formatTime(alert.closest_approach_time)}
            </span>
          </span>
          <RiskTag level={alert.risk_level} />
        </button>
      ))}
      {overflow > 0 && (
        <div className="alert-overflow">
          +{overflow} more active alert{overflow > 1 ? "s" : ""} — see threat queue below
        </div>
      )}
    </div>
  );
}