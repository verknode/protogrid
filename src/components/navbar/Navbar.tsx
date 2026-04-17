"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { NavAuthButton } from "./NavAuthButton";
import { LanguageToggle } from "./LanguageToggle";
import { useSession } from "@/lib/auth-client";
import { PilotBadge } from "@/components/PilotBadge";

const NAV_HREFS = [
  { key: "home",     href: "/" },
  { key: "services", href: "/services" },
  { key: "process",  href: "/process" },
  { key: "projects", href: "/projects" },
  { key: "about",    href: "/about" },
  { key: "contact",  href: "/contact" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session } = useSession();
  const t = useTranslations("nav");

  // Admin has its own layout with AdminSidebar — no site Navbar needed
  if (pathname.startsWith("/admin")) return null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={[
        "sticky top-0 z-50 border-b transition-all duration-200",
        scrolled
          ? "bg-ink-shadow/95 backdrop-blur-sm border-iris-dusk/35"
          : "bg-ink-shadow/80 border-iris-dusk/20",
      ].join(" ")}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center h-[72px]">

          {/* Wordmark */}
          <Link
            href="/"
            className="font-technical text-[13px] tracking-[0.2em] text-cold-pearl uppercase shrink-0"
          >
            PROTOGRID
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden lg:flex flex-1 items-center justify-center gap-8"
            aria-label="Main navigation"
          >
            {NAV_HREFS.map(({ key, href }) => (
              <Link
                key={href}
                href={href}
                className={[
                  "font-technical text-[12px] tracking-[0.08em] transition-colors duration-150",
                  pathname === href
                    ? "text-cold-pearl"
                    : "text-lavender-smoke hover:text-cold-pearl",
                ].join(" ")}
              >
                {t(key)}
              </Link>
            ))}
          </nav>

          {/* Desktop right: language + auth + CTA */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <LanguageToggle />
            <NavAuthButton />
            <Link
              href="/contact"
              className="inline-flex items-center h-10 px-5 bg-cold-pearl text-ink-shadow text-[12px] font-technical tracking-[0.06em] rounded-sm hover:bg-[#D8D9DC] transition-colors duration-150 whitespace-nowrap"
            >
              {t("requestQuote")}
            </Link>
          </div>

          {/* Mobile: language toggle + hamburger */}
          <div className="lg:hidden ml-auto flex items-center gap-3">
            <LanguageToggle />
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center justify-center w-8 h-8 text-cold-pearl -mr-1"
              aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden bg-ink-shadow border-t border-iris-dusk/20"
          >
            <nav aria-label="Mobile navigation" className="max-w-7xl mx-auto px-6">
              {/* Public links */}
              {NAV_HREFS.map(({ key, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "flex items-center h-12 font-technical text-[12px] tracking-[0.08em]",
                    "border-b border-iris-dusk/15",
                    "transition-colors duration-150",
                    pathname === href ? "text-cold-pearl" : "text-lavender-smoke hover:text-cold-pearl",
                  ].join(" ")}
                >
                  {t(key)}
                </Link>
              ))}

              {/* Auth links */}
              {session ? (
                <>
                  <Link
                    href="/account"
                    className="flex items-center h-12 font-technical text-[12px] tracking-[0.08em] border-b border-iris-dusk/15 text-lavender-smoke hover:text-cold-pearl transition-colors duration-150"
                  >
                    {t("account")}
                  </Link>
                  {session.user.role === "admin" && (
                    <Link
                      href="/admin/dashboard"
                      className="flex items-center h-12 font-technical text-[12px] tracking-[0.08em] border-b border-iris-dusk/15 text-lavender-smoke hover:text-cold-pearl transition-colors duration-150"
                    >
                      {t("admin")}
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center h-12 font-technical text-[12px] tracking-[0.08em] border-b border-iris-dusk/15 text-lavender-smoke hover:text-cold-pearl transition-colors duration-150"
                  >
                    {t("signIn")}
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center h-12 font-technical text-[12px] tracking-[0.08em] border-b border-iris-dusk/15 text-lavender-smoke hover:text-cold-pearl transition-colors duration-150"
                  >
                    {t("register")}
                  </Link>
                </>
              )}

              {/* Early access */}
              <div className="py-3 border-t border-iris-dusk/15">
                <PilotBadge variant="line" />
              </div>

              {/* Primary CTA */}
              <div className="pb-4">
                <Link
                  href="/contact"
                  className="flex items-center justify-center h-12 w-full bg-cold-pearl text-ink-shadow text-[12px] font-technical tracking-[0.06em] rounded-sm hover:bg-[#D8D9DC] transition-colors duration-150"
                >
                  {t("requestQuote")}
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
