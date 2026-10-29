import { motion } from "framer-motion";
import { toolCards } from "../data/mockData";
import { ToolCard } from "./ToolCard";

export function ToolsSection() {
  return (
    <section className="px-4 py-24 sm:px-6" aria-labelledby="tools-heading">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mb-10 flex items-end justify-between gap-4"
        >
          <div>
            <span className="label-tech">Core Tools</span>
            <h2 id="tools-heading" className="mt-2 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
              One platform, three instruments
            </h2>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {toolCards.map((card, i) => (
            <ToolCard key={card.id} data={card} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
