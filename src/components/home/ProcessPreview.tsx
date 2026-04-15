"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const ease = [0.16, 1, 0.3, 1] as const;
function fadeIn(delay = 0) {
  return {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.5, delay, ease },
  } as const;
}

const steps = [
  { n: "01", label: "Send task" },
  { n: "02", label: "Review & quote" },
  { n: "03", label: "Prototype" },
  { n: "04", label: "Production" },
  { n: "05", label: "Delivery" },
];

export function ProcessPreview() {
  return (
    <section className="py-10 lg:py-20 border-t border-iris-dusk/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <motion.p {...fadeIn(0)} className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-3">
              Process
            </motion.p>
            <motion.h2 {...fadeIn(0.06)} className="font-display font-bold text-[clamp(22px,2.5vw,36px)] leading-[1.1] tracking-[-0.01em] text-cold-pearl">
              How it works
            </motion.h2>
          </div>
          <motion.div {...fadeIn(0.1)}>
            <Link href="/process" className="group flex items-center gap-1.5 font-technical text-[12px] tracking-[0.08em] text-lavender-smoke hover:text-cold-pearl transition-colors duration-150">
              Full process
              <ArrowRight size={12} className="transition-transform duration-150 group-hover:translate-x-[2px]" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-5 gap-px bg-iris-dusk/20">
          {steps.map(({ n, label }, i) => (
            <motion.div key={n} {...fadeIn(0.06 * i)} className="bg-ink-shadow px-4 py-5 flex flex-col gap-2">
              <span className="font-technical text-[10px] tracking-[0.14em] text-iris-dusk">{n}</span>
              <p className="font-technical text-[12px] tracking-[0.04em] text-cold-pearl leading-[1.3]">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
