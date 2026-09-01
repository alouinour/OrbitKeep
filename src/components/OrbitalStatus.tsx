import { motion } from "framer-motion";
import { orbitalStatusMetrics } from "../data/mockData";
import { useCountUp } from "../hooks/useCountUp";

const statusColor = {
  success: "bg-success",
  neutral: "bg-brand-neutral",
  warning: "bg-warning",
} as const;

function MetricRow({ metric, index }: { metric: (typeof orbitalStatusMetrics)[number]; index: number }) {
  const { ref, display } = useCountUp(metric.value);
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.07 }}
      className="flex items-center justify-between border-b border-white/[0.06] py-4 last:border-0"
    >
      <div className="flex items-center gap-2.5">
        <span className={`h-1.5 w-1.5 rounded-full ${statusColor[metric.status]} animate-pulse-soft`} />
        <span className="text-sm text-text-secondary">{metric.label}</span>
      </div>
      <span ref={ref} className="text-lg font-semibold tracking-tight text-text-primary tabular-nums">
        {display}
      </span>
    </motion.div>
  );
}

function RadarGraphic() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[240px]">
      <svg viewBox="0 0 240 240" className="h-full w-full">
        {[100, 70, 40].map((r) => (
          <circle key={r} cx="120" cy="120" r={r} fill="none" stroke="var(--color-brand-neutral)" strokeOpacity="0.14" strokeWidth="1" />
        ))}
        <line x1="120" y1="10" x2="120" y2="230" stroke="var(--color-brand-neutral)" strokeOpacity="0.1" strokeWidth="1" />
        <line x1="10" y1="120" x2="230" y2="120" stroke="var(--color-brand-neutral)" strokeOpacity="0.1" strokeWidth="1" />

        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "120px 120px" }}
        >
          <path
            d="M120 120 L120 10 A110 110 0 0 1 197.8 42.2 Z"
            fill="var(--color-brand-secondary)"
            fillOpacity="0.14"
          />
          <line x1="120" y1="120" x2="120" y2="10" stroke="var(--color-brand-secondary)" strokeOpacity="0.5" strokeWidth="1" />
        </motion.g>

        <circle cx="150" cy="80" r="2.4" fill="var(--color-brand-neutral)" />
        <circle cx="90" cy="150" r="2.4" fill="var(--color-brand-neutral)" />
        <circle cx="165" cy="150" r="2.6" fill="var(--color-warning)" />
        <circle cx="120" cy="120" r="3" fill="var(--color-text-primary)" />
      </svg>
    </div>
  );
}

export function OrbitalStatus() {
  return (
    <section className="px-4 sm:px-6" aria-labelledby="orbital-status-heading">
      <div className="mx-auto max-w-6xl">
        <div className="glass-panel grid grid-cols-1 gap-8 rounded-2xl p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div>
            <span className="label-tech">Real-Time Feed</span>
            <h2 id="orbital-status-heading" className="mt-2 text-xl font-semibold tracking-tight text-text-primary">
              Live Orbital Status
            </h2>
            <div className="mt-2">
              {orbitalStatusMetrics.map((metric, i) => (
                <MetricRow key={metric.id} metric={metric} index={i} />
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center border-t border-white/[0.06] pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <RadarGraphic />
          </div>
        </div>
      </div>
    </section>
  );
}
