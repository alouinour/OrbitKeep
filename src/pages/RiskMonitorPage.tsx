import { motion } from "framer-motion";
import { RefreshCw, ShieldAlert, Satellite, Radio, Check } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react"; // NOUVEAU: useMemo, useRef
import { AlertList } from "../components/AlertList";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { OrbitalMap } from "../components/OrbitalMap";
import { RiskTag } from "../components/RiskTag";
import { StatCard } from "../components/StatCard";
import { api } from "../services/riskMonitorApi";
import { connectDangerSocket } from "../services/riskMonitorWebSocket";
import { riskMonitorCopy } from "../data/riskMonitorData";
import type { AlertResponse, DashboardResponse, MapObject, RiskLevel } from "../types/riskMonitor";

const initialDashboard: DashboardResponse = {
  total_alerts: 0,
  unread_alerts: 0,
  high_risk: 0,
  medium_risk: 0,
  low_risk: 0,
  active_threats: 0,
  monitored_satellites: 0,
  monitored_objects: 0,
};

function formatDate(value: string) {
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

// NOUVEAU: "Highest priority first" n'était pas respecté (le backend trie par date croissante)
const RISK_PRIORITY: Record<RiskLevel, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

function byPriority(a: AlertResponse, b: AlertResponse) {
  return (
    RISK_PRIORITY[a.risk_level] - RISK_PRIORITY[b.risk_level] ||
    new Date(a.closest_approach_time).getTime() - new Date(b.closest_approach_time).getTime()
  );
}

export function RiskMonitorPage() {
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [mapObjects, setMapObjects] = useState<MapObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestId = useRef(0); // NOUVEAU

  const load = useCallback(async (manual = false) => {
    const id = ++requestId.current;
    if (manual) setRefreshing(true);

    // allSettled → si /map échoue (lent / 503) le dashboard et les alertes s'affichent quand même
    const [nextDashboard, nextAlerts, nextMap] = await Promise.allSettled([
      api.dashboard(),
      api.alerts(),
      api.map(),
    ]);

    // Ignore les réponses périmées — interval + websocket + bouton Refresh peuvent se chevaucher.
    // setLoading/setRefreshing sont aussi dans le guard : une requête abandonnée ne doit pas
    // réinitialiser le spinner d'une requête plus récente encore en vol.
    if (id === requestId.current) {
      if (nextDashboard.status === "fulfilled") setDashboard(nextDashboard.value);
      if (nextAlerts.status === "fulfilled") setAlerts(nextAlerts.value);
      if (nextMap.status === "fulfilled") setMapObjects(nextMap.value);

      const failure = [nextDashboard, nextAlerts, nextMap].find((r) => r.status === "rejected");
      setError(
        failure && failure.status === "rejected"
          ? (failure.reason instanceof Error ? failure.reason.message : "Unable to load monitor data.")
          : null,
      );

      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(), riskMonitorCopy.refreshIntervalMs);
    // FIX: debounce — un cycle de monitoring peut émettre des dizaines de NEW_ALERT d'affilée,
    // chacun relançait 3 requêtes (dont /map, la plus lourde).
    let debounce: number | undefined;
    const socket = connectDangerSocket(() => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(() => void load(), 1000);
    });
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(debounce);
      socket.close();
    };
  }, [load]);

  // NOUVEAU: la file "active" triée par priorité, utilisée par la liste ET le tableau
  const activeAlerts = useMemo(
    () => alerts.filter((a) => a.status === "ACTIVE").sort(byPriority),
    [alerts],
  );

  const markRead = async (id: string) => {
    // FIX: sans ce garde, marquer une alerte déjà lue décrémentait quand même "Unread alerts"
    const target = alerts.find((alert) => alert.id === id);
    if (!target || target.is_read) return;
    try {
      await api.markRead(id);
      setAlerts((current) => current.map((alert) => alert.id === id ? { ...alert, is_read: true } : alert));
      setDashboard((current) => ({ ...current, unread_alerts: Math.max(0, current.unread_alerts - 1) }));
    } catch {
      // FIX: l'échec n'était plus silencieux
      setError("Unable to mark the alert as read.");
    }
  };

  const markAllRead = async () => {
    try {
      await api.markAllRead();
      setAlerts((current) => current.map((alert) => ({ ...alert, is_read: true })));
      setDashboard((current) => ({ ...current, unread_alerts: 0 }));
    } catch {
      setError("Unable to mark all alerts as read."); // FIX: l'échec n'était plus silencieux
    }
  };

  return (
    <div className="app-shell">
      <Navbar />
      <main className="page">
        <motion.section
          className="hero"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .35 }}
        >
          <div>
            <div className="eyebrow label-tech">{riskMonitorCopy.eyebrow}</div>
            <h1>{riskMonitorCopy.title}</h1>
            <p className="hero-copy">{riskMonitorCopy.description}</p>
          </div>
          <div className="hero-actions">
            <button type="button" className="btn" onClick={() => void load(true)} disabled={refreshing}>
              <RefreshCw size={13} style={{ verticalAlign: "middle", marginRight: 7 }} />
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
            <button type="button" className="btn btn-primary" onClick={() => void markAllRead()} disabled={dashboard.unread_alerts === 0}>
              <Check size={13} style={{ verticalAlign: "middle", marginRight: 7 }} />
              Mark all read
            </button>
          </div>
        </motion.section>

        {error && <div className="error">{error}</div>} {/* FIX: le suffixe "Make sure the FastAPI backend…" est maintenant dans load() (évite le doublon) */}

        <motion.section
          className="status-strip"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .08, duration: .3 }}
        >
          <StatCard label={riskMonitorCopy.labels.monitoredSatellites} value={dashboard.monitored_satellites} note="Active satellite catalog" icon={<Satellite size={14} />} />
          <StatCard label={riskMonitorCopy.labels.monitoredObjects} value={dashboard.monitored_objects} note="Objects stored by monitor" icon={<Radio size={14} />} />
          <StatCard label={riskMonitorCopy.labels.activeThreats} value={dashboard.active_threats} note="Current active conjunctions" icon={<ShieldAlert size={14} />} />
          <StatCard label={riskMonitorCopy.labels.unreadAlerts} value={dashboard.unread_alerts} note="Alerts awaiting review" />
        </motion.section>

        <section className="grid-main">
          <motion.article
            className="panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: .12, duration: .3 }}
          >
            <div className="panel-head">
              <div>
                <div className="panel-title">{riskMonitorCopy.labels.orbitalMap}</div>
                <div className="panel-subtitle">Current positions calculated from stored TLE data</div>
              </div>
              <span className="label-tech">{loading ? "LOADING" : error ? "UNAVAILABLE" : "LIVE DATA"}</span>
            </div>
            <OrbitalMap objects={mapObjects} total={dashboard.monitored_objects} /> {/* NOUVEAU: total réel pour le compteur */}
          </motion.article>

          <motion.aside
            className="side-stack"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: .16, duration: .3 }}
          >
            <div className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">{riskMonitorCopy.labels.recentAlerts}</div>
                  <div className="panel-subtitle">Highest priority first</div>
                </div>
                <span className="mono label-tech">{activeAlerts.length}</span>
              </div>
              <AlertList alerts={activeAlerts} onRead={(id) => void markRead(id)} />
            </div>

            <div className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Risk distribution</div>
                  <div className="panel-subtitle">Persisted alerts by classification</div>
                </div>
              </div>
              <div style={{ padding: 16, display: "grid", gap: 10 }}>
                {(["HIGH", "MEDIUM", "LOW"] as const).map((level) => (
                  <div key={level} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <RiskTag level={level} />
                    <strong className="mono">{dashboard[level === "HIGH" ? "high_risk" : level === "MEDIUM" ? "medium_risk" : "low_risk"]}</strong>
                  </div>
                ))}
              </div>
            </div>
          </motion.aside>
        </section>

        <motion.section
          className="panel table-panel"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .2, duration: .3 }}
        >
          <div className="panel-head">
            <div>
              <div className="panel-title">{riskMonitorCopy.labels.threatQueue}</div>
              <div className="panel-subtitle">Active conjunctions returned by the backend screening service</div>
            </div>
            <span className="label-tech">ACTIVE ONLY</span>
          </div>
          <div className="table-wrap">
            {activeAlerts.length ? (
              <table>
                <thead>
                  <tr>
                    <th>Risk</th>
                    <th>Satellite</th>
                    <th>Object</th>
                    <th>Distance</th>
                    <th>Closest approach</th>
                    <th>Review</th>
                  </tr>
                </thead>
                <tbody>
                  {activeAlerts.slice(0, 20).map((alert) => (
                    <tr key={alert.id}>
                      <td><RiskTag level={alert.risk_level} /></td>
                      <td><strong>{alert.satellite_name}</strong></td>
                      <td>{alert.debris_name}</td>
                      <td className="mono">{alert.distance_km.toFixed(2)} km</td>
                      <td className="mono">{formatDate(alert.closest_approach_time)}</td>
                      <td>
                        {alert.is_read ? (
                          <span className="table-read-badge">Read</span>
                        ) : (
                          <button
                            type="button"
                            className="table-read-btn"
                            onClick={() => void markRead(alert.id)}
                          >
                            Mark read
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty">No active threats returned by the API.</div>
            )}
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
}