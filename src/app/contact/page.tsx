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
      <Contact />
      <FAQ />
      <Footer />
    </main>
  );
}
