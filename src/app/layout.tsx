import type { Metadata } from "next";
import { Navbar } from "@/components/navbar/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProtoGrid — Engineering & Fabrication Studio",
  description:
    "ProtoGrid turns ideas, sketches, broken parts, and custom requirements into prototypes, functional components, and small-batch production.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
