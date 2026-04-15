"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

function fadeIn(delay = 0) {
  return {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.5, delay, ease },
  } as const;
}

const faqs = [
  {
    q: "Do I need a CAD file to place an order?",
    a: "No. A sketch, photo, or written description is enough to get started. We will ask for what we need after reviewing your request.",
  },
  {
    q: "What is the minimum order quantity?",
    a: "One. We accept single-unit requests as readily as batch orders. There are no minimums.",
  },
  {
    q: "How long does a typical order take?",
    a: "Simple parts: 2–5 working days. Prototypes with design iteration: 1–2 weeks. We give you a clear timeline in the quote, before any work starts.",
  },
  {
    q: "What materials do you work with?",
    a: "Primarily aluminum, steel, and brass for machined and cut parts. If you have specific material requirements — hardness, grade, finish — mention it in your request.",
  },
  {
    q: "Can you work from a broken part with no drawing?",
    a: "Yes. Ship or deliver the physical sample and we will measure, photograph, and reverse-engineer it into a working replacement.",
  },
  {
    q: "What file formats do you accept?",
    a: ".STEP, .DXF, .STL, .IGES, and .F3D are all supported. PDFs with clear dimensions also work. If you have something else, send it anyway — we will let you know if we need a conversion.",
  },
  {
    q: "Do you ship internationally?",
    a: "Currently local and national delivery only. Contact us with your location and we will confirm whether we can cover it.",
  },
  {
    q: "What happens after I submit a request?",
    a: "You get a reply within 1 business day. We will confirm scope, ask any open questions, and send a quote. No work starts until you approve it.",
  },
];

function FAQItem({
  q,
  a,
  index,
}: {
  q: string;
  a: string;
  index: number;
}) {
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
  return (
    <section className="py-12 lg:py-24 border-t border-iris-dusk/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-[2fr_3fr] gap-16 lg:gap-24">
          {/* Left: header */}
          <div className="lg:sticky lg:top-32 self-start">
            <motion.p
              {...fadeIn(0)}
              className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4"
            >
              FAQ
            </motion.p>
            <motion.h2
              {...fadeIn(0.08)}
              className="font-display font-bold text-[clamp(24px,3vw,40px)] leading-[1.1] tracking-[-0.01em] text-cold-pearl mb-4"
            >
              Common questions
            </motion.h2>
            <motion.p
              {...fadeIn(0.14)}
              className="font-sans text-[14px] leading-[1.65] text-lavender-smoke"
            >
              Anything not covered here — just ask in the contact form below.
            </motion.p>
          </div>

          {/* Right: accordion */}
          <div className="border-t border-iris-dusk/20">
            {faqs.map((item, i) => (
              <FAQItem key={item.q} q={item.q} a={item.a} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
