import { WhyProtoGrid } from "@/components/home/WhyProtoGrid";
import { Contact } from "@/components/home/Contact";
import { Footer } from "@/components/home/Footer";

export const metadata = {
  title: "About — ProtoGrid",
  description: "What ProtoGrid is, how we work, and why we exist.",
};

const facts = [
  { label: "Founded", value: "2024" },
  { label: "Location", value: "Workshop-based, local & national shipping" },
  { label: "Specialization", value: "CNC fabrication · Prototyping · Small-batch" },
  { label: "Minimum order", value: "1 unit" },
];

export default function AboutPage() {
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

      <WhyProtoGrid />
      <Contact />
      <Footer />
    </main>
  );
}
