import { motion } from "framer-motion";
import { Orbit, Gauge, Satellite, AlertTriangle } from "lucide-react";
import { orbitalStats } from "../data/mockData";
import { useCountUp } from "../hooks/useCountUp";

const icons = [Orbit, Gauge, Satellite, AlertTriangle];

function StatItem({ value, label, Icon, index }: { value: string; label: string; Icon: typeof Orbit; index: number }) {
  const { ref, display } = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="flex items-center gap-3.5 px-1 py-3 sm:flex-col sm:items-start sm:gap-2 sm:px-0"
    >
      <Icon className="h-4 w-4 shrink-0 text-brand-neutral/70" />
      <div>
        <span ref={ref} className="block text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
          {display}
        </span>
        <span className="label-tech mt-0.5 block">{label}</span>
      </div>
    </motion.div>
  );
}

export function OrbitalStats() {
  return (
    <section className="px-4 sm:px-6" aria-label="Orbital statistics">
      <div className="mx-auto max-w-6xl">
        <div className="glass-panel grid grid-cols-2 divide-y divide-white/[0.06] rounded-2xl px-5 sm:grid-cols-4 sm:divide-x sm:divide-y-0 sm:px-2">
          {orbitalStats.map((stat, i) => (
            <div key={stat.id} className="sm:px-6 sm:py-6">
              <StatItem value={stat.value} label={stat.label} Icon={icons[i]} index={i} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
