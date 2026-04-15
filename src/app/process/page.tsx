import { Process } from "@/components/home/Process";
import { FAQ } from "@/components/home/FAQ";
import { Contact } from "@/components/home/Contact";
import { Footer } from "@/components/home/Footer";

export const metadata = {
  title: "Process — ProtoGrid",
  description: "How ProtoGrid takes a task from first contact to delivered parts.",
};

export default function ProcessPage() {
  return (
    <main className="flex flex-col pt-16">
      {/* Page header */}
      <section className="py-12 lg:py-24 border-b border-iris-dusk/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4">
            Process
          </p>
          <h1 className="font-display font-bold text-[clamp(36px,5vw,64px)] leading-[1.05] tracking-[-0.02em] text-cold-pearl mb-6 max-w-[20ch]">
            From task to delivered parts
          </h1>
          <p className="font-sans text-[clamp(15px,1.1vw,17px)] leading-[1.68] text-lavender-smoke max-w-[48ch]">
            No black box. Every order follows the same five steps — transparent
            scope, clear timeline, no surprises at invoice.
          </p>
        </div>
      </section>

      <Process />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}
