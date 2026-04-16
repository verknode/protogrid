"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

const ease = [0.16, 1, 0.3, 1] as const;

export function HomeCtaBanner() {
  const t = useTranslations("cta");
  return (
    <section className="py-10 lg:py-20 border-t border-iris-dusk/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="bg-surface border border-iris-dusk/40 rounded-sm px-8 py-12 lg:px-16 lg:py-16 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease }}
              className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-3"
            >
              {t("eyebrow")}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: 0.08, ease }}
              className="font-display font-bold text-[clamp(22px,2.8vw,38px)] leading-[1.1] tracking-[-0.01em] text-cold-pearl"
            >
              {t("heading1")}
              <br />
              {t("heading2")}
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.14, ease }}
            className="shrink-0"
          >
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 h-12 px-6 bg-cold-pearl text-ink-shadow text-[13px] font-technical tracking-[0.06em] rounded-sm hover:bg-[#D8D9DC] transition-colors duration-200 whitespace-nowrap"
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
