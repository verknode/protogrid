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

const steps = [
  {
    n: "01",
    title: "Send your task",
    body: "Describe what you need. A sketch, photo, broken part, or a plain text description — whatever you have is a valid starting point.",
  },
  {
    n: "02",
    title: "We review",
    body: "We analyze the request, ask clarifying questions if needed, and send back a clear scope and quote within 1 business day.",
  },
  {
    n: "03",
    title: "Prototype",
    body: "We build the first version. You receive the actual object — see it, test it, fit it — before committing to a production run.",
  },
  {
    n: "04",
    title: "Production",
    body: "Prototype approved. We run the full order — single unit or small batch — with the same setup and quality.",
  },
  {
    n: "05",
    title: "Delivery",
    body: "Finished parts shipped or available for local pickup. Documentation included when needed.",
  },
];

export function Process() {
  return (
    <section className="py-24 lg:py-32 border-t border-iris-dusk/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.p
          {...fadeIn(0)}
          className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4"
        >
          How it works
        </motion.p>
        <motion.h2
          {...fadeIn(0.08)}
          className="font-display font-bold text-[clamp(24px,3vw,40px)] leading-[1.1] tracking-[-0.01em] text-cold-pearl mb-16"
        >
          Five steps from task to result
        </motion.h2>

        {/* Steps */}
        <div className="grid lg:grid-cols-5 gap-px bg-iris-dusk/20">
          {steps.map(({ n, title, body }, i) => (
            <motion.div
              key={n}
              {...fadeIn(0.07 * i)}
              className="bg-ink-shadow p-6 flex flex-col gap-4"
            >
              <span className="font-technical text-[11px] tracking-[0.14em] text-iris-dusk">
                {n}
              </span>
              <p className="font-display font-bold text-[16px] text-cold-pearl leading-[1.2]">
                {title}
              </p>
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
