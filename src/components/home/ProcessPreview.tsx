"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const ease = [0.16, 1, 0.3, 1] as const;
function fadeIn(delay = 0) {
  return {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.5, delay, ease },
  } as const;
}

const STEPS = ["01", "02", "03", "04", "05"] as const;

export function ProcessPreview() {
  const t = useTranslations("process");
  return (
    <section className="py-10 lg:py-20 border-t border-iris-dusk/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <motion.p {...fadeIn(0)} className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-3">
              {t("eyebrow")}
            </motion.p>
            <motion.h2 {...fadeIn(0.06)} className="font-display font-bold text-[clamp(22px,2.5vw,36px)] leading-[1.1] tracking-[-0.01em] text-cold-pearl">
              {t("heading")}
            </motion.h2>
          </div>
          <motion.div {...fadeIn(0.1)}>
            <Link href="/process" className="group flex items-center gap-1.5 font-technical text-[12px] tracking-[0.08em] text-lavender-smoke hover:text-cold-pearl transition-colors duration-150">
              {t("linkFull")}
              <ArrowRight size={12} className="transition-transform duration-150 group-hover:translate-x-[2px]" />
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-px bg-iris-dusk/20">
          {STEPS.map((n, i) => (
            <motion.div
              key={n}
              {...fadeIn(0.06 * i)}
              className="bg-surface px-5 py-7 sm:py-9 flex sm:flex-col items-center sm:items-start gap-4 sm:gap-3 relative overflow-hidden"
            >
              <span
                aria-hidden="true"
                className="absolute -bottom-4 -right-1 font-technical leading-none select-none pointer-events-none text-[80px] text-iris-dusk/[0.07]"
              >
                {n}
              </span>
              <span className="font-technical text-[11px] tracking-[0.1em] text-accent shrink-0">/{n}</span>
              <p className="font-technical text-[12px] tracking-[0.04em] text-cold-pearl leading-[1.45] relative z-10">
                {t(`s${n}`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
