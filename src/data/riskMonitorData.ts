import type { RiskLevel } from "../types/riskMonitor";

export const riskMonitorCopy = {
  eyebrow: "ORBITAL SAFETY / LIVE SCREENING",
  title: "Risk Monitor",
  description:
    "Monitor active satellite–debris conjunctions, inspect current risk levels, and track orbital objects from the OrbitKeep screening service.",
  labels: {
    monitoredSatellites: "Monitored satellites",
    monitoredObjects: "Tracked objects",
    activeThreats: "Active threats",
    unreadAlerts: "Unread alerts",
    recentAlerts: "Recent alerts",
    orbitalMap: "Orbital object map",
    threatQueue: "Threat queue",
  },
  refreshIntervalMs: 30000,
} as const;

export const riskLabels: Record<RiskLevel, string> = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
};

export const riskClass: Record<RiskLevel, string> = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
};