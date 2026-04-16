"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Wrench, Layers, RefreshCw, Package } from "lucide-react";
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

const SERVICE_ICONS = [
  { key: "customParts",      icon: Wrench },
  { key: "rapidPrototyping", icon: Layers },
  { key: "partRedesign",     icon: RefreshCw },
  { key: "smallBatch",       icon: Package },
] as const;

export function ServicesPreview() {
  const t = useTranslations("services");
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
            <Link href="/services" className="group flex items-center gap-1.5 font-technical text-[12px] tracking-[0.08em] text-lavender-smoke hover:text-cold-pearl transition-colors duration-150">
              {t("linkAll")}
              <ArrowRight size={12} className="transition-transform duration-150 group-hover:translate-x-[2px]" />
            </Link>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-iris-dusk/20">
          {SERVICE_ICONS.map(({ key, icon: Icon }, i) => (
            <motion.div key={key} {...fadeIn(0.05 * i)} className="bg-ink-shadow p-5 flex flex-col gap-4 hover:bg-iris-dusk/5 transition-colors duration-150">
              <div className="w-8 h-8 border border-iris-dusk/40 rounded-sm flex items-center justify-center shrink-0">
                <Icon size={14} className="text-lavender-smoke" />
              </div>
              <div>
                <p className="font-display font-bold text-[15px] text-cold-pearl mb-1">{t(`${key}.title`)}</p>
                <p className="font-sans text-[13px] leading-[1.6] text-lavender-smoke">{t(`${key}.line`)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
