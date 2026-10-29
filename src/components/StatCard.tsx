import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: number;
  note: string;
  icon?: ReactNode;
}

export function StatCard({ label, value, note, icon }: StatCardProps) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span className="label-tech">{label}</span>
        {icon}
      </div>
      <div className="stat-value mono">{value.toLocaleString()}</div>
      <div className="stat-note">{note}</div>
    </article>
  );
}