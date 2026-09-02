import { motion } from "framer-motion";

/**
 * CSS/SVG-based placeholder for Earth-from-orbit. Structured so the <Globe>
 * group can be swapped for a real WebGL/3D globe later without touching the
 * surrounding orbital-path and debris-point markup.
 */
export function EarthVisualization() {
  const debris = [
    { cx: 340, cy: 110, r: 2.4, delay: 0 },
    { cx: 90, cy: 260, r: 1.8, delay: 0.4 },
    { cx: 400, cy: 300, r: 2, delay: 0.8 },
    { cx: 60, cy: 130, r: 1.6, delay: 1.2 },
    { cx: 300, cy: 380, r: 2.2, delay: 1.6 },
    { cx: 420, cy: 190, r: 1.8, delay: 0.2 },
  ];

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px]" role="img" aria-label="Visualization of Earth from orbit with satellite and debris tracking paths">
      {/* Ambient glow */}
      <div className="absolute inset-8 rounded-full bg-brand-secondary/10 blur-3xl" />

      {/* Orbital rings */}
      <div className="absolute inset-0 animate-orbit-slow [animation-duration:120s]">
        <svg viewBox="0 0 480 480" className="h-full w-full">
          <ellipse
            cx="240"
            cy="240"
            rx="220"
            ry="150"
            stroke="var(--color-brand-neutral)"
            strokeOpacity="0.16"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>
      <div className="absolute inset-0 animate-orbit-slower [animation-duration:150s]">
        <svg viewBox="0 0 480 480" className="h-full w-full">
          <ellipse
            cx="240"
            cy="240"
            rx="200"
            ry="230"
            stroke="var(--color-brand-secondary)"
            strokeOpacity="0.18"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>

      {/* Debris / satellite points */}
      <svg viewBox="0 0 480 480" className="absolute inset-0 h-full w-full">
        {debris.map((d, i) => (
          <motion.circle
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill={i === 2 ? "var(--color-warning)" : "var(--color-brand-neutral)"}
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 3.4, repeat: Infinity, delay: d.delay, ease: "easeInOut" }}
          />
        ))}
      </svg>

      {/* Earth body */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, ease: "easeOut" }}
        className="absolute inset-[16%] overflow-hidden rounded-full ring-1 ring-white/10"
        style={{ boxShadow: "0 0 90px rgba(75,73,163,0.28), inset -18px -18px 60px rgba(0,0,0,0.65)" }}
      >
        <img src="/assets/earth.jpg" alt="" className="h-full w-full scale-[1.42] object-cover object-[48%_45%]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_28%,transparent_30%,rgba(3,5,12,0.2)_67%,rgba(3,5,12,0.78)_100%)]" />
      </motion.div>

      {/* Orbiting satellite marker */}
      <div className="absolute inset-0 animate-orbit-slow [animation-duration:22s]">
        <div className="absolute left-1/2 top-[9%] h-2 w-2 -translate-x-1/2 rounded-full bg-success shadow-[0_0_10px_2px_rgba(63,166,107,0.6)]" />
      </div>
    </div>
  );
}
