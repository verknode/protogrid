import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Navbar } from "@/components/navbar/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProtoGrid — Engineering & Fabrication Studio",
  description:
    "ProtoGrid turns ideas, sketches, broken parts, and custom requirements into prototypes, functional components, and small-batch production.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Navbar />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
