"use client";

import { motion } from "framer-motion";
import { Hammer, Building2, PenTool, Cpu, Settings, Scissors } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

function fadeIn(delay = 0) {
  return {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.5, delay, ease },
  } as const;
}

const clients = [
  {
    icon: Hammer,
    title: "Makers & Hobbyists",
    body: "Custom brackets, enclosures, jigs, one-off parts. No minimum order, no judgement on batch size.",
  },
  {
    icon: Building2,
    title: "Small Businesses",
    body: "Replacement parts, branded components, tooling fixtures — things the catalog doesn't carry.",
  },
  {
    icon: PenTool,
    title: "Product Designers",
    body: "Turn your CAD into a real, holdable prototype before any tooling investment.",
  },
  {
    icon: Cpu,
    title: "Engineers",
    body: "Fast hardware iteration, dev kit housings, test fixtures. Built to your spec, not adapted from stock.",
  },
  {
    icon: Settings,
    title: "Repair Shops",
    body: "Discontinued parts, custom replacements, hard-to-source components. If you can describe it, we can make it.",
  },
  {
    icon: Scissors,
    title: "Artists & Fabricators",
    body: "Structural elements, weld fixtures, custom mechanical details. Precise enough for production, flexible enough for art.",
  },
];

export function WhoItsFor() {
  return (
    <section className="py-12 lg:py-24 border-t border-iris-dusk/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.p
          {...fadeIn(0)}
          className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4"
        >
          Who it's for
        </motion.p>
        <motion.h2
          {...fadeIn(0.08)}
          className="font-display font-bold text-[clamp(24px,3vw,40px)] leading-[1.1] tracking-[-0.01em] text-cold-pearl mb-4"
        >
          Find yourself here
        </motion.h2>
        <motion.p
          {...fadeIn(0.14)}
          className="font-sans text-[15px] leading-[1.65] text-lavender-smoke mb-16 max-w-[52ch]"
        >
          ProtoGrid works with people who build, make, and repair things — from a
          single part to a short production run.
        </motion.p>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map(({ icon: Icon, title, body }, i) => (
            <motion.div
              key={title}
              {...fadeIn(0.05 * i)}
              className="border border-iris-dusk/25 rounded-sm p-6 hover:border-iris-dusk/50 transition-colors duration-200"
            >
              <div className="flex items-center gap-3 mb-4">
                <Icon size={15} className="text-iris-dusk shrink-0" />
                <p className="font-display font-bold text-[16px] text-cold-pearl">
                  {title}
                </p>
              </div>
              <p className="font-sans text-[14px] leading-[1.65] text-lavender-smoke">
                {body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
