"use client";

import { motion } from "framer-motion";
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

const STEP_KEYS = ["s01", "s02", "s03", "s04", "s05"] as const;

export function Process() {
  const t = useTranslations("processSteps");

  return (
    <section className="py-12 lg:py-24 border-t border-iris-dusk/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.p
          {...fadeIn(0)}
          className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4"
        >
          {t("eyebrow")}
        </motion.p>
        <motion.h2
          {...fadeIn(0.08)}
          className="font-display font-bold text-[clamp(24px,3vw,40px)] leading-[1.1] tracking-[-0.01em] text-cold-pearl mb-16"
        >
          {t("heading")}
        </motion.h2>

        <div className="grid lg:grid-cols-5 gap-px bg-iris-dusk/20">
          {STEP_KEYS.map((key, i) => (
            <motion.div
              key={key}
              {...fadeIn(0.07 * i)}
              className="bg-surface p-6 flex flex-col gap-4"
            >
              <span className="font-technical text-[11px] tracking-[0.14em] text-iris-dusk">
                {key.replace("s", "")}
              </span>
              <p className="font-display font-bold text-[16px] text-cold-pearl leading-[1.2]">
                {t(`${key}.title`)}
              </p>
              <p className="font-sans text-[14px] leading-[1.65] text-lavender-smoke">
                {t(`${key}.body`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
