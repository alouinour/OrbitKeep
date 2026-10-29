export interface NewAlertEvent {
  type: "NEW_ALERT";
  alert: unknown;
}

const MAX_RETRY_DELAY_MS = 30_000;

export function connectDangerSocket(onMessage: (event: NewAlertEvent) => void) {
  const url =
    import.meta.env.VITE_WS_URL ??
    `${(import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/^http/, "ws")}/api/danger/ws`;

  let socket: WebSocket | null = null;
  let closed = false;
  let attempt = 0;
  let retryTimer: number | undefined;

  const open = () => {
    const current = new WebSocket(url);
    socket = current;

    current.onopen = () => {
      attempt = 0;
    };
    current.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data) as NewAlertEvent;
        if (data.type === "NEW_ALERT") onMessage(data);
      } catch {
        // Ignore malformed socket messages.
      }
    };
    // FIX: reconnexion automatique (avant, une coupure = plus jamais de temps réel)
    current.onclose = () => {
      if (closed) return;
      attempt += 1;
      retryTimer = window.setTimeout(open, Math.min(1000 * 2 ** attempt, MAX_RETRY_DELAY_MS));
    };
    current.onerror = () => current.close();
  };

  open();

  return {
    close() {
      closed = true;
      window.clearTimeout(retryTimer);
      if (!socket) return;
      const current = socket;
      current.onmessage = null;
      current.onclose = null;
      current.onerror = null;
      // FIX: React StrictMode monte/démonte l'effet → on ne ferme pas un socket encore en CONNECTING
      // (sinon erreur console "WebSocket is closed before the connection is established").
      if (current.readyState === WebSocket.CONNECTING) {
        current.onopen = () => current.close();
      } else {
        current.close();
      }
    },
  };
}