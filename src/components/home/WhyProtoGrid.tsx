"use client";

import { motion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

function fadeIn(delay = 0) {
  return {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.5, delay, ease },
  } as const;
}

const reasons = [
  {
    title: "Physical results, not consultancy",
    body: "We build the thing. Not a report about the thing, not a recommendation. A real object you can hold.",
  },
  {
    title: "No CAD file required",
    body: "A sketch, a broken part, or a written description is enough to start. We figure out the rest.",
  },
  {
    title: "No factory minimums",
    body: "One unit or two hundred — same process, same care, no MOQ pressure.",
  },
  {
    title: "Fast iteration",
    body: "A working prototype in days, not weeks. Catch problems before production, not during it.",
  },
  {
    title: "One point of contact",
    body: "The person who quotes the job is the person who builds it. No handoffs, no translation errors.",
  },
  {
    title: "Transparent scope",
    body: "You get a clear breakdown before we touch anything. The final invoice matches the quote.",
  },
];

export function WhyProtoGrid() {
  return (
    <section className="py-24 lg:py-32 border-t border-iris-dusk/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.p
          {...fadeIn(0)}
          className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4"
        >
          Why ProtoGrid
        </motion.p>
        <div className="grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-24 items-start">
          <motion.h2
            {...fadeIn(0.08)}
            className="font-display font-bold text-[clamp(24px,3vw,40px)] leading-[1.1] tracking-[-0.01em] text-cold-pearl lg:sticky lg:top-32"
          >
            No fluff.
            <br />
            Just reasons.
          </motion.h2>

          {/* Reasons list */}
          <div className="space-y-0 divide-y divide-iris-dusk/20">
            {reasons.map(({ title, body }, i) => (
              <motion.div
                key={title}
                {...fadeIn(0.05 * i)}
                className="py-6 first:pt-0"
              >
                <p className="font-display font-bold text-[16px] text-cold-pearl mb-2">
                  {title}
                </p>
                <p className="font-sans text-[14px] leading-[1.65] text-lavender-smoke">
                  {body}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
