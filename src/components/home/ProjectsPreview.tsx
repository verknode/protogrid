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
    task: "Original housing cracked. No technical drawing existed.",
    result: "6 units produced and installed.",
  },
  {
    tag: "Prototyping",
    title: "Electronics enclosure for dev board",
    task: "Testable housing for a custom PCB, before tooling investment.",
    result: "Prototype in 4 days. Design signed off.",
  },
];

export function ProjectsPreview() {
  return (
    <section className="py-10 lg:py-20 border-t border-iris-dusk/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <motion.p {...fadeIn(0)} className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-3">
              Projects
            </motion.p>
            <motion.h2 {...fadeIn(0.06)} className="font-display font-bold text-[clamp(22px,2.5vw,36px)] leading-[1.1] tracking-[-0.01em] text-cold-pearl">
              Recent work
            </motion.h2>
          </div>
          <motion.div {...fadeIn(0.1)}>
            <Link href="/projects" className="group flex items-center gap-1.5 font-technical text-[12px] tracking-[0.08em] text-lavender-smoke hover:text-cold-pearl transition-colors duration-150">
              All projects
              <ArrowRight size={12} className="transition-transform duration-150 group-hover:translate-x-[2px]" />
            </Link>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          {projects.map(({ tag, title, task, result }, i) => (
            <motion.div key={title} {...fadeIn(0.07 * i)} className="bg-surface border border-iris-dusk/40 rounded-sm p-6 hover:border-iris-dusk/50 transition-colors duration-200">
              <span className="inline-block font-technical text-[10px] tracking-[0.14em] uppercase text-iris-dusk border border-iris-dusk/40 rounded-full px-2.5 py-0.5 mb-4">
                {tag}
              </span>
              <p className="font-display font-bold text-[16px] leading-[1.25] text-cold-pearl mb-4">{title}</p>
              <p className="font-sans text-[13px] leading-[1.6] text-lavender-smoke mb-2">{task}</p>
              <p className="font-technical text-[12px] tracking-[0.04em] text-cold-pearl">{result}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
