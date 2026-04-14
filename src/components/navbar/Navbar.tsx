"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { NavAuthButton } from "./NavAuthButton";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Process", href: "/process" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
            {NAV_LINKS.map(({ label, href }) => (
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
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA group */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <NavAuthButton />
            <Link
              href="/contact"
              className="inline-flex items-center h-10 px-5 bg-cold-pearl text-ink-shadow text-[12px] font-technical tracking-[0.06em] rounded-sm hover:bg-[#D8D9DC] transition-colors duration-150 whitespace-nowrap"
            >
              Request a Quote
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden ml-auto flex items-center justify-center w-8 h-8 text-cold-pearl -mr-1"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X size={20} strokeWidth={1.5} />
            ) : (
              <Menu size={20} strokeWidth={1.5} />
            )}
          </button>

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
            <nav
              aria-label="Mobile navigation"
              className="max-w-7xl mx-auto px-6"
            >
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "flex items-center h-12 font-technical text-[12px] tracking-[0.08em]",
                    "border-b border-iris-dusk/15 last:border-0",
                    "transition-colors duration-150",
                    pathname === href
                      ? "text-cold-pearl"
                      : "text-lavender-smoke hover:text-cold-pearl",
                  ].join(" ")}
                >
                  {label}
                </Link>
              ))}

              <div className="py-4">
                <Link
                  href="/contact"
                  className="flex items-center justify-center h-12 w-full bg-cold-pearl text-ink-shadow text-[12px] font-technical tracking-[0.06em] rounded-sm hover:bg-[#D8D9DC] transition-colors duration-150"
                >
                  Request a Quote
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
