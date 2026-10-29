import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../services/riskMonitorApi";
import { connectDangerSocket } from "../services/riskMonitorWebSocket";
import type { AlertResponse } from "../types/riskMonitor";

const POLL_INTERVAL_MS = 60_000; // 1 min — léger, la navbar n'a pas besoin du temps réel strict
const MAX_NOTIFICATIONS = 5;

export interface NavbarAlertsState {
  alerts: AlertResponse[];
  unreadCount: number;
  loading: boolean;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export function useNavbarAlerts(): NavbarAlertsState {
  const [alerts, setAlerts] = useState<AlertResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    try {
      // On récupère les 5 alertes actives les plus récentes (backend trie HIGH → MEDIUM → LOW puis par date)
      const data = await api.alerts();
      if (id !== requestId.current) return;
      const active = data.slice(0, MAX_NOTIFICATIONS);
      setAlerts(active);
      // Compte les non-lus sur la liste complète (pas seulement les 5 visibles)
      // pour que le badge reflète la réalité — mais on utilise l'endpoint dédié
      // pour éviter la divergence badge/panel quand il y a >MAX_NOTIFICATIONS alertes non lues.
      setUnreadCount(data.filter((a) => !a.is_read).length);
    } catch {
      // Silencieux : la navbar ne bloque pas si le backend est indisponible
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(), POLL_INTERVAL_MS);

    // WebSocket : nouvelle alerte → on recharge immédiatement
    let debounce: number | undefined;
    const socket = connectDangerSocket(() => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(() => void load(), 800);
    });

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(debounce);
      socket.close();
    };
  }, [load]);

  const markRead = useCallback(async (id: string) => {
    const target = alerts.find((a) => a.id === id);
    if (!target || target.is_read) return;
    try {
      await api.markRead(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_read: true } : a)));
      setUnreadCount((n) => Math.max(0, n - 1));
    } catch {
      // ignore
    }
  }, [alerts]);

  const markAllRead = useCallback(async () => {
    try {
      await api.markAllRead();
      setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  }, []);

  return { alerts, unreadCount, loading, markRead, markAllRead };
}
