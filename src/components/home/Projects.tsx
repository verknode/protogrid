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

const projects = [
  {
    tag: "Part Redesign",
    title: "Gearbox housing — no drawing available",
    task: "Original housing cracked. No technical drawing existed — only the damaged part.",
    solution: "Reverse-engineered from physical sample, redesigned with 40% thicker walls at the failure point.",
    result: "6 units produced. All installed and running without issue.",
  },
  {
    tag: "Prototyping",
    title: "Electronics enclosure for dev board",
    task: "Product designer needed a testable housing for a custom PCB before committing to injection moulding.",
    solution: "CNC-machined aluminum enclosure from the provided CAD file. Threaded inserts, removable lid.",
    result: "Prototype delivered in 4 days. Design signed off for tooling.",
  },
  {
    tag: "Small-Batch",
    title: "Custom mounting brackets — qty 30",
    task: "45° angled brackets for a workshop shelving system. Off-the-shelf options didn't fit the load spec.",
    solution: "Plasma-cut 4mm steel, deburred, bent to angle, powder-coated matte black.",
    result: "Full batch in 5 working days. Installed and load-tested by client.",
  },
];

export function Projects() {
  return (
    <section className="py-12 lg:py-24 border-t border-iris-dusk/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.p
          {...fadeIn(0)}
          className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4"
        >
          Projects
        </motion.p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
          <motion.h2
            {...fadeIn(0.08)}
            className="font-display font-bold text-[clamp(24px,3vw,40px)] leading-[1.1] tracking-[-0.01em] text-cold-pearl"
          >
            Recent work
          </motion.h2>
          <motion.p
            {...fadeIn(0.14)}
            className="font-technical text-[11px] tracking-[0.1em] text-lavender-smoke"
          >
            Task · Solution · Result
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid lg:grid-cols-3 gap-4">
          {projects.map(({ tag, title, task, solution, result }, i) => (
            <motion.div
              key={title}
              {...fadeIn(0.07 * i)}
              className="bg-surface border border-iris-dusk/40 rounded-sm p-6 flex flex-col gap-5 hover:border-iris-dusk/50 transition-colors duration-200"
            >
              <div>
                <span className="inline-block font-technical text-[10px] tracking-[0.14em] uppercase text-iris-dusk border border-iris-dusk/40 rounded-full px-2.5 py-0.5 mb-4">
                  {tag}
                </span>
                <p className="font-display font-bold text-[17px] leading-[1.25] text-cold-pearl">
                  {title}
                </p>
              </div>

              <div className="space-y-3 flex-1">
                <div>
                  <p className="font-technical text-[10px] tracking-[0.12em] uppercase text-iris-dusk mb-1">
                    Task
                  </p>
                  <p className="font-sans text-[13px] leading-[1.6] text-lavender-smoke">
                    {task}
                  </p>
                </div>
                <div>
                  <p className="font-technical text-[10px] tracking-[0.12em] uppercase text-iris-dusk mb-1">
                    Solution
                  </p>
                  <p className="font-sans text-[13px] leading-[1.6] text-lavender-smoke">
                    {solution}
                  </p>
                </div>
                <div>
                  <p className="font-technical text-[10px] tracking-[0.12em] uppercase text-iris-dusk mb-1">
                    Result
                  </p>
                  <p className="font-sans text-[13px] leading-[1.6] text-cold-pearl">
                    {result}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* All projects link */}
        <motion.div {...fadeIn(0.2)} className="mt-8 flex justify-center">
          <Link
            href="/projects"
            className="group flex items-center gap-2 font-technical text-[12px] tracking-[0.08em] text-lavender-smoke hover:text-cold-pearl transition-colors duration-150"
          >
            View all projects
            <ArrowRight
              size={13}
              className="transition-transform duration-150 group-hover:translate-x-[3px]"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
