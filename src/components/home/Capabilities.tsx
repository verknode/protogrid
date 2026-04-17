"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
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

function List({ items, delay = 0 }: { items: string[]; delay?: number }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <motion.li
          key={i}
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
  const t = useTranslations("capabilities");
  const inputs  = t.raw("inputs")  as string[];
  const outputs = t.raw("outputs") as string[];

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

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <motion.p
              {...fadeIn(0.1)}
              className="font-technical text-[11px] tracking-[0.14em] uppercase text-cold-pearl mb-6 pb-4 border-b border-iris-dusk/25"
            >
              {t("inputsTitle")}
            </motion.p>
            <List items={inputs} delay={0.14} />
          </div>
          <div>
            <motion.p
              {...fadeIn(0.1)}
              className="font-technical text-[11px] tracking-[0.14em] uppercase text-cold-pearl mb-6 pb-4 border-b border-iris-dusk/25"
            >
              {t("outputsTitle")}
            </motion.p>
            <List items={outputs} delay={0.14} />
          </div>
        </div>
      </div>
    </section>
  );
}
