"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { TechnicalGraphic } from "./TechnicalGraphic";

const ease = [0.16, 1, 0.3, 1] as const;

function fadeUp(delay: number, duration = 0.55) {
  return {
    initial: { y: 16 },
    animate: { y: 0 },
    transition: { duration, delay, ease },
  } as const;
}

export function Hero() {
  return (
    <section className="relative bg-ink-shadow lg:min-h-screen flex items-start lg:items-center pt-16 pb-24 lg:py-32">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-[55fr_45fr] items-center">

          {/* Content column */}
          <div>
            <motion.p
              {...fadeUp(0)}
              className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4"
            >
              ENGINEERING STUDIO · PROTOTYPING · FABRICATION
            </motion.p>

            <motion.h1
              {...fadeUp(0.1)}
              className="font-display font-bold text-[clamp(42px,6vw,72px)] leading-[1.05] tracking-[-0.02em] text-cold-pearl mb-6"
            >
              From concept to
              <br />
              functional product
            </motion.h1>

            <motion.p
              {...fadeUp(0.25)}
              className="font-sans text-[clamp(15px,1.1vw,17px)] leading-[1.68] text-lavender-smoke mb-10 max-w-[48ch]"
            >
              ProtoGrid helps turn ideas, sketches, broken parts, and custom
              requirements into prototypes, functional components, and
              small-batch production.
            </motion.p>

            <motion.div
              {...fadeUp(0.4)}
              className="flex flex-col sm:flex-row gap-3"
            >
              <button className="h-12 px-6 bg-cold-pearl text-ink-shadow text-[13px] font-technical tracking-[0.06em] rounded-sm hover:bg-[#D8D9DC] transition-colors duration-200 w-full sm:w-auto whitespace-nowrap cursor-pointer">
                Request a Quote
              </button>

              <button className="group h-12 px-6 border border-iris-dusk text-lavender-smoke text-[13px] font-technical tracking-[0.06em] rounded-sm hover:border-lavender-smoke hover:text-cold-pearl transition-colors duration-200 flex items-center justify-center gap-[6px] w-full sm:w-auto whitespace-nowrap cursor-pointer">
                See How It Works
                <ArrowRight
                  size={14}
                  className="transition-transform duration-200 group-hover:translate-x-[3px]"
                />
              </button>
            </motion.div>
          </div>

          {/* Graphic column */}
          <div className="mt-16 lg:mt-0 lg:pl-16 flex items-center justify-center">
            <div className="w-full max-w-[260px] lg:max-w-[440px]">
              <TechnicalGraphic />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
