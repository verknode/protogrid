import type { Metadata } from "next";
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
