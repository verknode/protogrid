"use client";

import { motion } from "framer-motion";
import { Wrench, Layers, RefreshCw, Package } from "lucide-react";
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

const SERVICE_ICONS = [
  { key: "customParts",      icon: Wrench },
  { key: "rapidPrototyping", icon: Layers },
  { key: "partRedesign",     icon: RefreshCw },
  { key: "smallBatch",       icon: Package },
] as const;

export function WhatWeDo() {
  const t = useTranslations("whatwedo");

  return (
    <section className="py-12 lg:py-24 border-t border-iris-dusk/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.p
          {...fadeIn(0)}
          className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4"
        >
          {t("eyebrow")}
        </motion.p>
        <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-end mb-16">
          <motion.h2
            {...fadeIn(0.08)}
            className="font-display font-bold text-[clamp(24px,3vw,40px)] leading-[1.1] tracking-[-0.01em] text-cold-pearl"
          >
            {t("heading")}
          </motion.h2>
          <motion.p
            {...fadeIn(0.14)}
            className="font-sans text-[15px] leading-[1.65] text-lavender-smoke max-w-[48ch] lg:text-right"
          >
            {t("subtext")}
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-iris-dusk/20">
          {SERVICE_ICONS.map(({ key, icon: Icon }, i) => (
            <motion.div
              key={key}
              {...fadeIn(0.06 * i)}
              className="bg-surface p-6 flex flex-col gap-5 hover:bg-iris-dusk/10 transition-colors duration-200"
            >
              <div className="w-9 h-9 border border-iris-dusk/40 rounded-sm flex items-center justify-center shrink-0">
                <Icon size={16} className="text-lavender-smoke" />
              </div>
              <div>
                <p className="font-display font-bold text-[17px] text-cold-pearl mb-2">
                  {t(`${key}.title`)}
                </p>
                <p className="font-sans text-[14px] leading-[1.65] text-lavender-smoke">
                  {t(`${key}.body`)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
