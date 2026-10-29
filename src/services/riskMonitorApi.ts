import type {
  AlertResponse,
  DashboardResponse,
  MapObject,
  MarkReadResponse, // NOUVEAU
} from "../types/riskMonitor";

const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(
      `Risk Monitor API error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}

export const api = {
  dashboard: () =>
    request<DashboardResponse>("/api/danger/dashboard"),

  alerts: () =>
    // FIX: status=ACTIVE côté serveur — les alertes RESOLVED (maintenant gérées par le backend) ne doivent pas
    // occuper les 100 places de la requête
    request<AlertResponse[]>("/api/danger/alerts?status=ACTIVE&limit=100"),

  threats: () =>
    request<AlertResponse[]>("/api/danger/threats"),

  map: () =>
    request<MapObject[]>("/api/danger/map"),

  markRead: (id: string) =>
    request<MarkReadResponse>(`/api/danger/alerts/${id}/read`, {
      method: "PATCH",
    }),

  markAllRead: () =>
    request<MarkReadResponse>("/api/danger/alerts/read-all", {
      method: "PATCH",
    }),
};