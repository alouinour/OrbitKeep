import { riskClass, riskLabels } from "../data/riskMonitorData";
import type { RiskLevel } from "../types/riskMonitor";

export function RiskTag({ level }: { level: RiskLevel }) {
  return <span className={`risk-tag ${riskClass[level]}`}>{riskLabels[level]}</span>;
}