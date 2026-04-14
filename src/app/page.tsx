import { Hero } from "@/components/hero/Hero";
import { ServicesPreview } from "@/components/home/ServicesPreview";
import { ProcessPreview } from "@/components/home/ProcessPreview";
import { ProjectsPreview } from "@/components/home/ProjectsPreview";
import { HomeCtaBanner } from "@/components/home/HomeCtaBanner";
import { Footer } from "@/components/home/Footer";

export default function Home() {
  return (
    <main className="flex flex-col">
      <Hero />
      <ServicesPreview />
      <ProcessPreview />
      <ProjectsPreview />
      <HomeCtaBanner />
      <Footer />
    </main>
  );
}
