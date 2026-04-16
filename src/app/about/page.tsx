import { WhyProtoGrid } from "@/components/home/WhyProtoGrid";
import { Contact } from "@/components/home/Contact";
import { Footer } from "@/components/home/Footer";
import { getFounderProfile } from "@/app/actions/founderActions";
import Image from "next/image";

export const metadata = {
  title: "About — ProtoGrid",
  description: "What ProtoGrid is, how we work, and why we exist.",
};

const facts = [
  { label: "Founded",        value: "2024" },
  { label: "Location",       value: "Workshop-based, local & national shipping" },
  { label: "Specialization", value: "CNC fabrication · Prototyping · Small-batch" },
  { label: "Minimum order",  value: "1 unit" },
];

const DEFAULT_SHORT_BIO =
  "ProtoGrid was founded by Andrii Ustymenko to turn rough ideas, broken parts, and practical engineering needs into buildable solutions, prototypes, and functional components. With hands-on experience in CNC operation, production environments, quality control, and technical problem-solving, he approaches fabrication as a practical process focused on real-world results.";

const DEFAULT_LONG_TEXT = `ProtoGrid is built around a simple idea: practical engineering should lead to practical results. The studio was founded by Andrii Ustymenko, whose background combines CNC operation, manufacturing, technical diagnostics, and hands-on production work.

His experience includes CNC machining, machine setup, quality control, technical adjustment, and work in demanding industrial environments where reliability and precision matter. That practical production mindset is combined with an aviation engineering background, which shaped a structured approach to systems, diagnostics, and functional problem-solving.

ProtoGrid exists to help turn sketches, broken parts, custom requirements, and early concepts into something buildable and useful — whether that means a one-off part, a redesigned component, a prototype, or a small-batch production result.

The focus is not on design for its own sake. The focus is on clarity, feasibility, iteration, and a final result that solves a real problem.`;

export default async function AboutPage() {
  const profile = await getFounderProfile().catch(() => null);

  const founderName    = profile?.name     ?? "Andrii Ustymenko";
  const founderTitle   = profile?.title    ?? "Founder · ProtoGrid";
  const founderLong    = profile?.longText ?? DEFAULT_LONG_TEXT;
  const founderImage   = profile?.imageUrl ?? null;

  return (
    <main className="flex flex-col pt-16">
      {/* Page header */}
      <section className="py-12 lg:py-24 border-b border-iris-dusk/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4">
            About
          </p>
          <h1 className="font-display font-bold text-[clamp(36px,5vw,64px)] leading-[1.05] tracking-[-0.02em] text-cold-pearl mb-6 max-w-[20ch]">
            Engineering studio. No fluff.
          </h1>
          <p className="font-sans text-[clamp(15px,1.1vw,17px)] leading-[1.68] text-lavender-smoke max-w-[52ch]">
            ProtoGrid exists to close the gap between an idea and a working
            physical object. We take tasks — not specs — and deliver results.
          </p>
        </div>
      </section>

      {/* What we are */}
      <section className="py-12 lg:py-24 border-b border-iris-dusk/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <p className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-6">
                What we are
              </p>
              <div className="space-y-5">
                <p className="font-sans text-[16px] leading-[1.7] text-lavender-smoke">
                  ProtoGrid is a hands-on fabrication studio. We work with
                  individuals, small businesses, product designers, and engineers
                  who need physical results — not consulting, not a quote that
                  goes nowhere.
                </p>
                <p className="font-sans text-[16px] leading-[1.7] text-lavender-smoke">
                  The model is simple: you send us a task, we review it, build
                  it, and deliver it. One point of contact, clear scope, no
                  factory minimums.
                </p>
                <p className="font-sans text-[16px] leading-[1.7] text-lavender-smoke">
                  We started by doing custom one-off work. The plan is to keep
                  doing that — and over time, identify repeatable solutions from
                  the most common requests and offer them as products.
                </p>
              </div>
            </div>

            {/* Facts */}
            <div>
              <p className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-6">
                Quick facts
              </p>
              <div className="space-y-0 divide-y divide-iris-dusk/20">
                {facts.map(({ label, value }) => (
                  <div key={label} className="py-4 grid grid-cols-[1fr_2fr] gap-4">
                    <p className="font-technical text-[11px] tracking-[0.1em] uppercase text-iris-dusk">
                      {label}
                    </p>
                    <p className="font-sans text-[14px] text-lavender-smoke">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder section */}
      <section className="py-12 lg:py-24 border-b border-iris-dusk/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-10">
            Founder
          </p>

          <div className="grid lg:grid-cols-[280px_1fr] gap-12 lg:gap-20">

            {/* Left: identity */}
            <div className="flex flex-col gap-5">
              <div className="w-28 h-28 lg:w-40 lg:h-40 rounded-sm overflow-hidden border border-iris-dusk/30 bg-iris-dusk/10 shrink-0">
                {founderImage ? (
                  <Image
                    src={founderImage}
                    alt={founderName}
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-display font-bold text-[32px] text-iris-dusk/40">
                      {founderName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="font-display font-semibold text-[18px] text-cold-pearl leading-[1.2] mb-1">
                  {founderName}
                </p>
                <p className="font-technical text-[11px] tracking-[0.06em] text-iris-dusk">
                  {founderTitle}
                </p>
              </div>
            </div>

            {/* Right: text */}
            <div className="space-y-5">
              {founderLong.split("\n\n").filter(Boolean).map((paragraph, i) => (
                <p key={i} className="font-sans text-[15px] leading-[1.72] text-lavender-smoke">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <WhyProtoGrid />
      <Contact />
      <Footer />
    </main>
  );
}
