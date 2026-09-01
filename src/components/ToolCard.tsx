import { motion } from "framer-motion";
import { ArrowUpRight, Calculator, Globe2, Radar } from "lucide-react";
import type { ToolCardData } from "../data/mockData";

const accentMap = {
  primary: {
    ring: "group-hover:ring-brand-secondary/30",
    icon: "text-brand-neutral bg-white/[0.04]",
    dot: "bg-brand-secondary",
  },
  secondary: {
    ring: "group-hover:ring-brand-secondary/30",
    icon: "text-brand-neutral bg-white/[0.04]",
    dot: "bg-success",
  },
  danger: {
    ring: "group-hover:ring-danger/30",
    icon: "text-brand-neutral bg-white/[0.04]",
    dot: "bg-danger",
  },
} as const;

const iconMap = {
  simulate: Calculator,
  awareness: Globe2,
  risk: Radar,
} as const;

function TrajectoryVisual() {
  return (
    <svg viewBox="0 0 200 90" className="h-full w-full">
      <path
        d="M10 70 C 60 10, 140 10, 190 70"
        stroke="var(--color-brand-secondary)"
        strokeOpacity="0.5"
        strokeWidth="1.2"
        fill="none"
        strokeDasharray="3 4"
      />
      <path
        d="M10 78 C 55 30, 145 30, 190 78"
        stroke="var(--color-brand-neutral)"
        strokeOpacity="0.25"
        strokeWidth="1"
        fill="none"
      />
      <circle cx="10" cy="70" r="2.5" fill="var(--color-brand-neutral)" />
      <circle cx="190" cy="70" r="2.5" fill="var(--color-success)" />
    </svg>
  );
}

function GlobeVisual() {
  return (
    <svg viewBox="0 0 200 90" className="h-full w-full">
      <circle cx="100" cy="45" r="30" fill="none" stroke="var(--color-brand-neutral)" strokeOpacity="0.3" strokeWidth="1" />
      <ellipse cx="100" cy="45" rx="30" ry="11" fill="none" stroke="var(--color-brand-neutral)" strokeOpacity="0.22" strokeWidth="0.8" />
      <ellipse cx="100" cy="45" rx="11" ry="30" fill="none" stroke="var(--color-brand-neutral)" strokeOpacity="0.22" strokeWidth="0.8" />
      <ellipse cx="100" cy="45" rx="46" ry="17" fill="none" stroke="var(--color-brand-secondary)" strokeOpacity="0.45" strokeWidth="1" />
      <circle cx="146" cy="35" r="1.8" fill="var(--color-success)" />
      <circle cx="60" cy="60" r="1.4" fill="var(--color-brand-neutral)" />
      <circle cx="120" cy="20" r="1.4" fill="var(--color-brand-neutral)" />
    </svg>
  );
}

function RadarVisual() {
  return (
    <svg viewBox="0 0 200 90" className="h-full w-full">
      <circle cx="100" cy="45" r="36" fill="none" stroke="var(--color-brand-neutral)" strokeOpacity="0.18" strokeWidth="1" />
      <circle cx="100" cy="45" r="24" fill="none" stroke="var(--color-brand-neutral)" strokeOpacity="0.18" strokeWidth="1" />
      <circle cx="100" cy="45" r="12" fill="none" stroke="var(--color-brand-neutral)" strokeOpacity="0.18" strokeWidth="1" />
      <line x1="100" y1="9" x2="100" y2="81" stroke="var(--color-brand-neutral)" strokeOpacity="0.14" strokeWidth="1" />
      <line x1="64" y1="45" x2="136" y2="45" stroke="var(--color-brand-neutral)" strokeOpacity="0.14" strokeWidth="1" />
      <circle cx="118" cy="30" r="2.6" fill="var(--color-danger)" />
      <circle cx="118" cy="30" r="6" fill="var(--color-danger)" fillOpacity="0.18" />
    </svg>
  );
}

const visualMap = {
  simulate: TrajectoryVisual,
  awareness: GlobeVisual,
  risk: RadarVisual,
};

interface ToolCardProps {
  data: ToolCardData;
  index: number;
}

export function ToolCard({ data, index }: ToolCardProps) {
  const accent = accentMap[data.accent];
  const Icon = iconMap[data.id as keyof typeof iconMap];
  const Visual = visualMap[data.id as keyof typeof visualMap];

  return (
    <motion.a
      href={data.href}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-panel/60 p-6 ring-1 ring-transparent transition-all duration-300 ${accent.ring}`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent.icon}`}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-text-secondary transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-text-primary" />
      </div>

      <div className="mt-6">
        <span className="label-tech flex items-center gap-1.5">
          <span className={`h-1 w-1 rounded-full ${accent.dot}`} />
          {data.eyebrow}
        </span>
        <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-text-primary">{data.title}</h3>
        <p className="mt-2.5 text-sm leading-relaxed text-text-secondary">{data.description}</p>
      </div>

      <div className="mt-6 h-20 opacity-80 transition-opacity duration-300 group-hover:opacity-100">
        <Visual />
      </div>

      <div className="mt-5 flex items-center gap-1.5 text-[12px] font-semibold tracking-wide text-text-primary">
        {data.cta}
        <ArrowUpRight className="h-3.5 w-3.5" />
      </div>
    </motion.a>
  );
}
