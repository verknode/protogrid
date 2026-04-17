import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n.ts");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost", "100.74.198.125"],
};

export default withNextIntl(nextConfig);
