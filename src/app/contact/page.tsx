import { Contact } from "@/components/home/Contact";
import { FAQ } from "@/components/home/FAQ";
import { Footer } from "@/components/home/Footer";

export const metadata = {
  title: "Contact — ProtoGrid",
  description: "Send your task to ProtoGrid. Response within 1 business day.",
};

export default function ContactPage() {
  return (
    <main className="flex flex-col pt-16">
      {/* Page header */}
      <section className="py-24 lg:py-32 border-b border-iris-dusk/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4">
            Contact
          </p>
          <h1 className="font-display font-bold text-[clamp(36px,5vw,64px)] leading-[1.05] tracking-[-0.02em] text-cold-pearl mb-6 max-w-[18ch]">
            Send your task
          </h1>
          <p className="font-sans text-[clamp(15px,1.1vw,17px)] leading-[1.68] text-lavender-smoke max-w-[48ch]">
            Describe what you need. No spec required — we'll figure out the
            details together. Response within 1 business day.
          </p>
        </div>
      </section>

      <Contact />
      <FAQ />
      <Footer />
    </main>
  );
}
