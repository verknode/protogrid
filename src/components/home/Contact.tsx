"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const ease = [0.16, 1, 0.3, 1] as const;

function fadeIn(delay = 0) {
  return {
    initial: { opacity: 0, y: 12 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.5, delay, ease },
  } as const;
}

const schema = z.object({
  name: z.string().min(2, "Required"),
  email: z.string().email("Invalid email"),
  message: z.string().min(10, "Please describe your task"),
  dimensions: z.string().optional(),
  deadline: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const inputClass =
  "w-full h-12 px-4 bg-transparent border border-iris-dusk/40 rounded-sm text-[14px] text-cold-pearl placeholder:text-lavender-smoke/50 focus:outline-none focus:border-lavender-smoke transition-colors duration-150";

const labelClass =
  "block font-technical text-[11px] tracking-[0.12em] uppercase text-lavender-smoke mb-2";

export function Contact() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(_data: FormData) {
    // TODO: wire to /api/contact or a server action when email service is configured
    await new Promise((r) => setTimeout(r, 600));
    setSent(true);
  }

  return (
    <section
      id="contact"
      className="py-24 lg:py-32 border-t border-iris-dusk/20"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-[2fr_3fr] gap-16 lg:gap-24">
          {/* Left: header */}
          <div className="lg:sticky lg:top-32 self-start">
            <motion.p
              {...fadeIn(0)}
              className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4"
            >
              Contact
            </motion.p>
            <motion.h2
              {...fadeIn(0.08)}
              className="font-display font-bold text-[clamp(24px,3vw,40px)] leading-[1.1] tracking-[-0.01em] text-cold-pearl mb-4"
            >
              Send your task
            </motion.h2>
            <motion.p
              {...fadeIn(0.14)}
              className="font-sans text-[15px] leading-[1.68] text-lavender-smoke mb-6"
            >
              Describe what you need. No need to have everything figured out —
              that is what the review step is for.
            </motion.p>
            <motion.p
              {...fadeIn(0.2)}
              className="font-technical text-[12px] tracking-[0.06em] text-iris-dusk"
            >
              Response within 1 business day.
            </motion.p>
          </div>

          {/* Right: form */}
          <motion.div {...fadeIn(0.1)}>
            {sent ? (
              <div className="border border-iris-dusk/25 rounded-sm p-8 text-center">
                <p className="font-display font-bold text-[20px] text-cold-pearl mb-2">
                  Request received.
                </p>
                <p className="font-sans text-[14px] text-lavender-smoke">
                  We will review it and get back to you within 1 business day.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                className="space-y-5"
              >
                {/* Name + Email */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>Name</label>
                    <input
                      {...register("name")}
                      type="text"
                      placeholder="Your name"
                      className={inputClass}
                    />
                    {errors.name && (
                      <p className="mt-1.5 font-technical text-[11px] text-red-400">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                    {errors.email && (
                      <p className="mt-1.5 font-technical text-[11px] text-red-400">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Task description */}
                <div>
                  <label className={labelClass}>Task description</label>
                  <textarea
                    {...register("message")}
                    rows={5}
                    placeholder="Describe what you need. Include material, quantity, and any context that helps."
                    className="w-full px-4 py-3 bg-transparent border border-iris-dusk/40 rounded-sm text-[14px] text-cold-pearl placeholder:text-lavender-smoke/50 focus:outline-none focus:border-lavender-smoke transition-colors duration-150 resize-none"
                  />
                  {errors.message && (
                    <p className="mt-1.5 font-technical text-[11px] text-red-400">
                      {errors.message.message}
                    </p>
                  )}
                </div>

                {/* Dimensions + Deadline */}
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>
                      Dimensions{" "}
                      <span className="text-iris-dusk normal-case tracking-normal">
                        optional
                      </span>
                    </label>
                    <input
                      {...register("dimensions")}
                      type="text"
                      placeholder="e.g. 120 × 80 × 40 mm"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      Deadline{" "}
                      <span className="text-iris-dusk normal-case tracking-normal">
                        optional
                      </span>
                    </label>
                    <input
                      {...register("deadline")}
                      type="text"
                      placeholder="e.g. end of May, no rush"
                      className={inputClass}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 px-6 bg-cold-pearl text-ink-shadow text-[13px] font-technical tracking-[0.06em] rounded-sm hover:bg-[#D8D9DC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 w-full sm:w-auto"
                >
                  {isSubmitting ? "Sending..." : "Send request"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
