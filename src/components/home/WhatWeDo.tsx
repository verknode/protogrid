"use client";

import { motion } from "framer-motion";
import { Wrench, Layers, RefreshCw, Package } from "lucide-react";

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
  {
    icon: Wrench,
    title: "Custom Parts",
    body: "You have a design file or a part that needs to exist. We mill, cut, or fabricate it to spec — one-off or repeat.",
  },
  {
    icon: Layers,
    title: "Rapid Prototyping",
    body: "Turn a sketch or concept into a working physical prototype, fast. Test before you commit to tooling or production cost.",
  },
  {
    icon: RefreshCw,
    title: "Part Redesign",
    body: "Broken original, no drawing, outdated component. We reverse-engineer from the physical sample and improve where needed.",
  },
  {
    icon: Package,
    title: "Small-Batch Production",
    body: "5 to 200 units with no factory minimums. Consistent quality across the run, delivered as a single shipment.",
  },
];

export function WhatWeDo() {
  return (
    <section className="py-24 lg:py-32 border-t border-iris-dusk/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.p
          {...fadeIn(0)}
          className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4"
        >
          Services
        </motion.p>
        <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-end mb-16">
          <motion.h2
            {...fadeIn(0.08)}
            className="font-display font-bold text-[clamp(24px,3vw,40px)] leading-[1.1] tracking-[-0.01em] text-cold-pearl"
          >
            What we do
          </motion.h2>
          <motion.p
            {...fadeIn(0.14)}
            className="font-sans text-[15px] leading-[1.65] text-lavender-smoke max-w-[48ch] lg:text-right"
          >
            Four core capabilities. One team from first cut to final delivery.
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-iris-dusk/20">
          {services.map(({ icon: Icon, title, body }, i) => (
            <motion.div
              key={title}
              {...fadeIn(0.06 * i)}
              className="bg-ink-shadow p-6 flex flex-col gap-5 hover:bg-iris-dusk/5 transition-colors duration-200"
            >
              <div className="w-9 h-9 border border-iris-dusk/40 rounded-sm flex items-center justify-center shrink-0">
                <Icon size={16} className="text-lavender-smoke" />
              </div>
              <div>
                <p className="font-display font-bold text-[17px] text-cold-pearl mb-2">
                  {title}
                </p>
                <p className="font-sans text-[14px] leading-[1.65] text-lavender-smoke">
                  {body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
