import { WhatWeDo } from "@/components/home/WhatWeDo";
import { Capabilities } from "@/components/home/Capabilities";
import { Contact } from "@/components/home/Contact";
import { Footer } from "@/components/home/Footer";

export const metadata = {
  title: "Services — ProtoGrid",
  description: "Custom parts, rapid prototyping, part redesign, and small-batch production.",
};

export default function ServicesPage() {
  return (
    <main className="flex flex-col pt-16">
      {/* Page header */}
      <section className="py-24 lg:py-32 border-b border-iris-dusk/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4">
            Services
          </p>
          <h1 className="font-display font-bold text-[clamp(36px,5vw,64px)] leading-[1.05] tracking-[-0.02em] text-cold-pearl mb-6 max-w-[18ch]">
            Four ways we can help
          </h1>
          <p className="font-sans text-[clamp(15px,1.1vw,17px)] leading-[1.68] text-lavender-smoke max-w-[48ch]">
            Custom fabrication, prototyping, part redesign, and small-batch
            production — handled end to end by one team.
          </p>
        </div>
      </section>

      <WhatWeDo />
      <Capabilities />
      <Contact />
      <Footer />
    </main>
  );
}
