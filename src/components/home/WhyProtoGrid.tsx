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

const REASON_KEYS = ["r1", "r2", "r3", "r4", "r5", "r6"] as const;

export function WhyProtoGrid() {
  const t = useTranslations("why");

  return (
    <section className="py-12 lg:py-24 border-t border-iris-dusk/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.p
          {...fadeIn(0)}
          className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4"
        >
          {t("eyebrow")}
        </motion.p>
        <div className="grid lg:grid-cols-[1fr_1fr] gap-12 lg:gap-24 items-start">
          <motion.h2
            {...fadeIn(0.08)}
            className="font-display font-bold text-[clamp(24px,3vw,40px)] leading-[1.1] tracking-[-0.01em] text-cold-pearl lg:sticky lg:top-32"
          >
            {t("heading1")}
            <br />
            {t("heading2")}
          </motion.h2>

          <div className="space-y-0 divide-y divide-iris-dusk/20">
            {REASON_KEYS.map((key, i) => (
              <motion.div
                key={key}
                {...fadeIn(0.05 * i)}
                className="py-6 first:pt-0"
              >
                <p className="font-display font-bold text-[16px] text-cold-pearl mb-2">
                  {t(`${key}.title`)}
                </p>
                <p className="font-sans text-[14px] leading-[1.65] text-lavender-smoke">
                  {t(`${key}.body`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
