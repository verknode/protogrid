"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

function fadeIn(delay = 0) {
  return {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.5, delay, ease },
  } as const;
}

const inputs = [
  ".STEP, .DXF, .STL, .IGES, .F3D files",
  "PDF drawings with dimensions",
  "Sketches — hand-drawn or digital",
  "Photos of broken or reference parts",
  "Physical samples shipped to us",
  "Written description with measurements",
];

const outputs = [
  "CNC-milled aluminum, steel, brass parts",
  "Plasma- and laser-cut flat components",
  "Enclosures, housings, brackets",
  "Threaded, tapped, and press-fit assemblies",
  "Prototype assemblies with hardware",
  "Small-batch runs — 1 to 200 units",
];

function List({ items, delay = 0 }: { items: string[]; delay?: number }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <motion.li
          key={item}
          {...fadeIn(delay + 0.04 * i)}
          className="flex items-start gap-3"
        >
          <Check size={13} className="text-iris-dusk mt-[3px] shrink-0" />
          <span className="font-sans text-[14px] leading-[1.6] text-lavender-smoke">
            {item}
          </span>
        </motion.li>
      ))}
    </ul>
  );
}

export function Capabilities() {
  return (
    <section className="py-12 lg:py-24 border-t border-iris-dusk/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.p
          {...fadeIn(0)}
          className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4"
        >
          Capabilities
        </motion.p>
        <motion.h2
          {...fadeIn(0.08)}
          className="font-display font-bold text-[clamp(24px,3vw,40px)] leading-[1.1] tracking-[-0.01em] text-cold-pearl mb-16"
        >
          What we work with
        </motion.h2>

        {/* Two-column list */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <motion.p
              {...fadeIn(0.1)}
              className="font-technical text-[11px] tracking-[0.14em] uppercase text-cold-pearl mb-6 pb-4 border-b border-iris-dusk/25"
            >
              What you can send us
            </motion.p>
            <List items={inputs} delay={0.14} />
          </div>
          <div>
            <motion.p
              {...fadeIn(0.1)}
              className="font-technical text-[11px] tracking-[0.14em] uppercase text-cold-pearl mb-6 pb-4 border-b border-iris-dusk/25"
            >
              What we can deliver
            </motion.p>
            <List items={outputs} delay={0.14} />
          </div>
        </div>
      </div>
    </section>
  );
}
