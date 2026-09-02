import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { riskEvents, type RiskLevel } from "../data/mockData";

const levelConfig: Record<RiskLevel, { label: string; text: string; bg: string; ring: string }> = {
  high: { label: "High Risk", text: "text-danger", bg: "bg-danger/10", ring: "ring-danger/25" },
  medium: { label: "Medium Risk", text: "text-warning", bg: "bg-warning/10", ring: "ring-warning/25" },
  low: { label: "Low Risk", text: "text-success", bg: "bg-success/10", ring: "ring-success/25" },
};

export function RiskEvents() {
  return (
    <section className="px-4 py-24 sm:px-6" aria-labelledby="risk-events-heading">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="label-tech">Collision Advisory</span>
            <h2 id="risk-events-heading" className="mt-2 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
              Recent Risk Events
            </h2>
          </div>
          <a
            href="/risk-monitor"
            className="hidden shrink-0 items-center gap-1.5 text-[13px] font-medium text-text-secondary transition-colors hover:text-text-primary sm:flex"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="glass-panel divide-y divide-white/[0.06] overflow-hidden rounded-2xl">
          {riskEvents.map((event, i) => {
            const cfg = levelConfig[event.level];
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${cfg.bg} ring-1 ${cfg.ring}`}
                  >
                    <AlertTriangle className={`h-4 w-4 ${cfg.text}`} />
                  </span>
                  <div>
                    <span className={`label-tech ${cfg.text}`}>{cfg.label}</span>
                    <p className="mt-1 text-sm font-medium text-text-primary">
                      {event.primaryObject}
                      <span className="mx-2 text-text-secondary">→</span>
                      <span className="text-text-secondary">Close approach with {event.secondaryObject}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 pl-13 sm:pl-0">
                  <div className="text-right">
                    <span className="label-tech">TCA</span>
                    <p className="text-sm font-semibold tabular-nums text-text-primary">{event.tca}</p>
                  </div>
                  <div className="text-right">
                    <span className="label-tech">Miss Distance</span>
                    <p className="text-sm font-semibold tabular-nums text-text-primary">{event.missDistanceKm}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
