"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
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

const FAQ_KEYS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"] as const;

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      {...fadeIn(0.04 * index)}
      className="border-b border-iris-dusk/20 last:border-b-0"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start justify-between gap-6 py-5 text-left group"
      >
        <span className="font-sans text-[15px] leading-[1.5] text-cold-pearl group-hover:text-white transition-colors duration-150">
          {q}
        </span>
        <span className="shrink-0 mt-0.5 text-lavender-smoke">
          {open ? <Minus size={15} /> : <Plus size={15} />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <p className="font-sans text-[14px] leading-[1.7] text-lavender-smoke pb-5">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ() {
  const t = useTranslations("faq");

  return (
    <section className="py-12 lg:py-24 border-t border-iris-dusk/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-[2fr_3fr] gap-16 lg:gap-24">
          <div className="lg:sticky lg:top-32 self-start">
            <motion.p
              {...fadeIn(0)}
              className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4"
            >
              {t("eyebrow")}
            </motion.p>
            <motion.h2
              {...fadeIn(0.08)}
              className="font-display font-bold text-[clamp(24px,3vw,40px)] leading-[1.1] tracking-[-0.01em] text-cold-pearl mb-4"
            >
              {t("heading")}
            </motion.h2>
            <motion.p
              {...fadeIn(0.14)}
              className="font-sans text-[14px] leading-[1.65] text-lavender-smoke"
            >
              {t("subtext")}
            </motion.p>
          </div>

          <div className="border-t border-iris-dusk/20">
            {FAQ_KEYS.map((key, i) => (
              <FAQItem key={key} q={t(`${key}.q`)} a={t(`${key}.a`)} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
