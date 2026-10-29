import { motion } from "framer-motion";
import { ArrowRight, Map } from "lucide-react";
import { EarthVisualization } from "./EarthVisualization";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-32 sm:px-6 sm:pt-40 lg:pt-44">
      {/* Background grid + vignette */}
      <div className="grid-overlay pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_20%,black,transparent)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[800px] -translate-x-1/2 rounded-full bg-brand-primary/20 blur-[120px]" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
        {/* Left: copy */}
        <div className="order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-success/25 bg-success/[0.07] px-3 py-1.5"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            <span className="label-tech text-success">System Status — Nominal</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-[2.75rem] font-semibold leading-[1.04] tracking-tight text-text-primary sm:text-6xl lg:text-[4rem]"
          >
            Protect.
            <br />
            Understand.
            <br />
            <span className="bg-gradient-to-r from-brand-neutral to-text-secondary bg-clip-text text-transparent">
              Sustain.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.32 }}
            className="mt-6 max-w-md text-[15px] leading-relaxed text-text-secondary"
          >
            Explore Earth's orbital environment, understand the growing threat
            of space debris, and make smarter decisions for a sustainable
            future in space.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.44 }}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <a
              href="/simulate"
              className="group inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-[13px] font-semibold tracking-tight text-text-primary ring-1 ring-inset ring-white/10 transition-all hover:bg-brand-secondary"
            >
              Explore Orbit
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="/debris-map"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-[13px] font-semibold tracking-tight text-text-primary transition-colors hover:bg-white/[0.07]"
            >
              <Map className="h-4 w-4 text-text-secondary" />
              View Debris Map
            </a>
          </motion.div>
        </div>

        {/* Right: Earth visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15 }}
          className="relative order-1 lg:order-2"
        >
          <EarthVisualization />
          <motion.img
            src="/assets/astronaut-flying.png"
            alt="Astronaut floating above Earth"
            initial={{ opacity: 0, x: 16, y: 16 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.8, delay: 0.65 }}
            className="pointer-events-none absolute right-[-7%] top-[4%] z-10 w-[31%] rotate-[12deg] drop-shadow-[0_22px_24px_rgba(0,0,0,0.42)] sm:right-[-2%]"
          />
        </motion.div>
      </div>
    </section>
  );
}
