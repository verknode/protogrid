"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Wrench, Layers, RefreshCw, Package } from "lucide-react";
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

const services = [
  { icon: Wrench,    title: "Custom Parts",       line: "Fabricated to spec — one-off or repeat." },
  { icon: Layers,    title: "Rapid Prototyping",   line: "Sketch to physical prototype, fast." },
  { icon: RefreshCw, title: "Part Redesign",        line: "Reverse-engineer and improve broken parts." },
  { icon: Package,   title: "Small-Batch",          line: "5–200 units, no factory minimums." },
];

export function ServicesPreview() {
  return (
    <section className="py-20 lg:py-24 border-t border-iris-dusk/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <motion.p {...fadeIn(0)} className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-3">
              Services
            </motion.p>
            <motion.h2 {...fadeIn(0.06)} className="font-display font-bold text-[clamp(22px,2.5vw,36px)] leading-[1.1] tracking-[-0.01em] text-cold-pearl">
              What we do
            </motion.h2>
          </div>
          <motion.div {...fadeIn(0.1)}>
            <Link href="/services" className="group flex items-center gap-1.5 font-technical text-[12px] tracking-[0.08em] text-lavender-smoke hover:text-cold-pearl transition-colors duration-150">
              All services
              <ArrowRight size={12} className="transition-transform duration-150 group-hover:translate-x-[2px]" />
            </Link>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-iris-dusk/20">
          {services.map(({ icon: Icon, title, line }, i) => (
            <motion.div key={title} {...fadeIn(0.05 * i)} className="bg-ink-shadow p-5 flex flex-col gap-4 hover:bg-iris-dusk/5 transition-colors duration-150">
              <div className="w-8 h-8 border border-iris-dusk/40 rounded-sm flex items-center justify-center shrink-0">
                <Icon size={14} className="text-lavender-smoke" />
              </div>
              <div>
                <p className="font-display font-bold text-[15px] text-cold-pearl mb-1">{title}</p>
                <p className="font-sans text-[13px] leading-[1.6] text-lavender-smoke">{line}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
