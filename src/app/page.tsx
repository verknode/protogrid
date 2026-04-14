import { Hero } from "@/components/hero/Hero";
import { WhatWeDo } from "@/components/home/WhatWeDo";
import { WhoItsFor } from "@/components/home/WhoItsFor";
import { Process } from "@/components/home/Process";
import { WhyProtoGrid } from "@/components/home/WhyProtoGrid";
import { Projects } from "@/components/home/Projects";
import { Capabilities } from "@/components/home/Capabilities";
import { FAQ } from "@/components/home/FAQ";
import { Contact } from "@/components/home/Contact";
import { Footer } from "@/components/home/Footer";

export default function Home() {
  return (
    <main className="flex flex-col">
      <Hero />
      <WhatWeDo />
      <WhoItsFor />
      <Process />
      <WhyProtoGrid />
      <Projects />
      <Capabilities />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}
