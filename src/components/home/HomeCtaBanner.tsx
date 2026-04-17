"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const ease = [0.16, 1, 0.3, 1] as const;

export function HomeCtaBanner() {
  const t = useTranslations("cta");
  return (
    <section className="py-24 lg:py-40 border-t border-iris-dusk/20 relative overflow-hidden">

      {/* Giant ghost wordmark */}
      <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <span className="font-display font-bold select-none whitespace-nowrap leading-none tracking-[-0.02em] text-iris-dusk/[0.045]" style={{ fontSize: "clamp(80px, 14vw, 200px)" }}>
          PROTOGRID
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease }}
          className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-6"
        >
          {t("eyebrow")}
        </motion.p>

        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10 lg:gap-16">
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.08, ease }}
            className="font-display font-bold leading-[1.04] tracking-[-0.02em] text-cold-pearl max-w-[14ch]"
            style={{ fontSize: "clamp(36px, 5.5vw, 76px)" }}
          >
            {t("heading1")}
            <br />
            {t("heading2")}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.2, ease }}
            className="shrink-0"
          >
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2.5 h-14 px-8 bg-cold-pearl text-ink-shadow text-[13px] font-technical tracking-[0.06em] rounded-sm hover:bg-[#D8D9DC] transition-colors duration-200 whitespace-nowrap"
            >
              {t("button")}
              <ArrowRight size={14} className="transition-transform duration-150 group-hover:translate-x-[3px]" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
