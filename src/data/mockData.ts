// Mock data for the OrbitKeep dashboard.
// Replace with live feeds (e.g. CelesTrak, Space-Track) once the backend exists.

export type RiskLevel = "high" | "medium" | "low";

export interface OrbitalStat {
  id: string;
  value: string;
  label: string;
}

export const orbitalStats: OrbitalStat[] = [
  { id: "tracked-objects", value: "34,000+", label: "Tracked Objects" },
  { id: "velocity", value: "28,000 km/h", label: "Avg. Orbital Velocity" },
  { id: "active-satellites", value: "1,200+", label: "Active Satellites" },
  { id: "debris-events", value: "7,500+", label: "Debris Events" },
];

export interface ToolCardData {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  accent: "primary" | "secondary" | "danger";
}

export const toolCards: ToolCardData[] = [
  {
    id: "simulate",
    eyebrow: "SIMULATE",
    title: "Disposal Calculator",
    description:
      "Calculate the \u0394v required to dispose of a satellite and compare sustainable disposal strategies.",
    cta: "OPEN SIMULATOR",
    href: "/simulate",
    accent: "primary",
  },
  {
    id: "awareness",
    eyebrow: "AWARENESS",
    title: "Live Debris Map",
    description:
      "Explore real orbital objects and understand the distribution of satellites and debris around Earth.",
    cta: "EXPLORE MAP",
    href: "/debris-map",
    accent: "secondary",
  },
  {
    id: "risk",
    eyebrow: "COLLISION RISK",
    title: "Danger Notifier",
    description:
      "Monitor close approaches and identify satellites facing potential collision risks.",
    cta: "VIEW RISKS",
    href: "/risk-monitor",
    accent: "danger",
  },
];

export interface OrbitalStatusMetric {
  id: string;
  label: string;
  value: string;
  status: "success" | "neutral" | "warning";
}

export const orbitalStatusMetrics: OrbitalStatusMetric[] = [
  { id: "active-satellites", label: "Active Satellites", value: "12,482", status: "success" },
  { id: "tracked-debris", label: "Tracked Debris", value: "34,821", status: "neutral" },
  { id: "objects-monitored", label: "Objects Monitored", value: "47,303", status: "neutral" },
  { id: "potential-risks", label: "Potential Risks", value: "23", status: "warning" },
];

export interface RiskEvent {
  id: string;
  level: RiskLevel;
  primaryObject: string;
  secondaryObject: string;
  tca: string;
  missDistanceKm: string;
}

export const riskEvents: RiskEvent[] = [
  {
    id: "evt-1",
    level: "high",
    primaryObject: "SAT-2048",
    secondaryObject: "DEB-8831",
    tca: "14 min",
    missDistanceKm: "0.42 km",
  },
  {
    id: "evt-2",
    level: "medium",
    primaryObject: "SAT-1182",
    secondaryObject: "DEB-2910",
    tca: "2h 41m",
    missDistanceKm: "1.8 km",
  },
  {
    id: "evt-3",
    level: "low",
    primaryObject: "SAT-0914",
    secondaryObject: "DEB-4412",
    tca: "8h 12m",
    missDistanceKm: "5.2 km",
  },
];

export const navLinks = [
  { label: "Dashboard", href: "/", active: true },
  { label: "Simulate", href: "/simulate", active: false },
  { label: "Debris Map", href: "/debris-map", active: false },
  { label: "Risk Monitor", href: "/risk-monitor", active: false },
  { label: "Research", href: "/research", active: false },
];

export const footerLinks = [
  { label: "About", href: "#" },
  { label: "Research", href: "#" },
  { label: "Data", href: "#" },
  { label: "GitHub", href: "#" },
  { label: "Contact", href: "#" },
];
