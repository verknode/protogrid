import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PilotBadge } from "@/components/PilotBadge";

const NAV_HREFS = [
  { key: "home",     href: "/" },
  { key: "services", href: "/services" },
  { key: "process",  href: "/process" },
  { key: "projects", href: "/projects" },
  { key: "about",    href: "/about" },
  { key: "contact",  href: "/contact" },
] as const;

export async function Footer() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");

  return (
    <footer className="border-t border-iris-dusk/20 py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto] gap-10 lg:gap-16 mb-16">
          {/* Brand */}
          <div>
            <p className="font-technical text-[13px] tracking-[0.2em] text-cold-pearl mb-3">
              PROTOGRID
            </p>
            <p className="font-sans text-[14px] leading-[1.65] text-lavender-smoke max-w-[32ch]">
              {t("tagline")}
            </p>
          </div>

          {/* Nav */}
          <div>
            <p className="font-technical text-[11px] tracking-[0.14em] uppercase text-iris-dusk mb-4">
              {t("pages")}
            </p>
            <nav className="flex flex-col gap-2">
              {NAV_HREFS.map(({ key, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="font-sans text-[14px] text-lavender-smoke hover:text-cold-pearl transition-colors duration-150"
                >
                  {nav(key)}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="font-technical text-[11px] tracking-[0.14em] uppercase text-iris-dusk mb-4">
              {t("contact")}
            </p>
            <a
              href="mailto:protogrid.studio@gmail.com"
              className="font-sans text-[14px] text-lavender-smoke hover:text-cold-pearl transition-colors duration-150"
            >
              protogrid.studio@gmail.com
            </a>
          </div>

          {/* Address */}
          <div>
            <p className="font-technical text-[11px] tracking-[0.14em] uppercase text-iris-dusk mb-4">
              {t("studio")}
            </p>
            <address className="not-italic font-sans text-[14px] leading-[1.65] text-lavender-smoke">
              Bekkegata 27<br />
              2317 Hamar<br />
              Norway
            </address>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-iris-dusk/20 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-col gap-2">
            <p className="font-technical text-[11px] tracking-[0.06em] text-iris-dusk">
              {t("copyright")}
            </p>
            <PilotBadge variant="line" />
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/terms"
              className="font-technical text-[11px] tracking-[0.06em] text-iris-dusk hover:text-lavender-smoke transition-colors duration-150"
            >
              {t("terms")}
            </Link>
            <Link
              href="/privacy"
              className="font-technical text-[11px] tracking-[0.06em] text-iris-dusk hover:text-lavender-smoke transition-colors duration-150"
            >
              {t("privacy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
