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

const PROJECT_KEYS = ["p1", "p2", "p3"] as const;

export function Projects() {
  const t = useTranslations("projectsList");

  return (
    <section className="py-12 lg:py-24 border-t border-iris-dusk/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.p
          {...fadeIn(0)}
          className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4"
        >
          {t("eyebrow")}
        </motion.p>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-16">
          <motion.h2
            {...fadeIn(0.08)}
            className="font-display font-bold text-[clamp(24px,3vw,40px)] leading-[1.1] tracking-[-0.01em] text-cold-pearl"
          >
            {t("heading")}
          </motion.h2>
          <motion.p
            {...fadeIn(0.14)}
            className="font-technical text-[11px] tracking-[0.1em] text-lavender-smoke"
          >
            {t("label")}
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          {PROJECT_KEYS.map((key, i) => (
            <motion.div
              key={key}
              {...fadeIn(0.07 * i)}
              className="bg-surface border border-iris-dusk/40 rounded-sm p-6 flex flex-col gap-5 hover:border-iris-dusk/50 transition-colors duration-200"
            >
              <div>
                <span className="inline-block font-technical text-[10px] tracking-[0.14em] uppercase text-iris-dusk border border-iris-dusk/40 rounded-full px-2.5 py-0.5 mb-4">
                  {t(`${key}.tag`)}
                </span>
                <p className="font-display font-bold text-[17px] leading-[1.25] text-cold-pearl">
                  {t(`${key}.title`)}
                </p>
              </div>

              <div className="space-y-3 flex-1">
                {(["taskLabel", "solutionLabel", "resultLabel"] as const).map((labelKey, j) => (
                  <div key={labelKey}>
                    <p className="font-technical text-[10px] tracking-[0.12em] uppercase text-iris-dusk mb-1">
                      {t(labelKey)}
                    </p>
                    <p className={`font-sans text-[13px] leading-[1.6] ${j === 2 ? "text-cold-pearl" : "text-lavender-smoke"}`}>
                      {t(`${key}.${["task", "solution", "result"][j]}`)}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div {...fadeIn(0.2)} className="mt-8 flex justify-center">
          <Link
            href="/projects"
            className="group flex items-center gap-2 font-technical text-[12px] tracking-[0.08em] text-lavender-smoke hover:text-cold-pearl transition-colors duration-150"
          >
            {t("linkAll")}
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
