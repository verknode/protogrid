import Link from "next/link";
import { PilotBadge } from "@/components/PilotBadge";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Process", href: "/process" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "#contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-iris-dusk/20 py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto] gap-10 lg:gap-16 mb-16">
          {/* Brand */}
          <div>
            <p className="font-technical text-[13px] tracking-[0.2em] text-cold-pearl mb-3">
              PROTOGRID
            </p>
            <p className="font-sans text-[14px] leading-[1.65] text-lavender-smoke max-w-[32ch]">
              Engineering &amp; fabrication studio. From concept to functional
              product.
            </p>
          </div>

          {/* Nav */}
          <div>
            <p className="font-technical text-[11px] tracking-[0.14em] uppercase text-iris-dusk mb-4">
              Pages
            </p>
            <nav className="flex flex-col gap-2">
              {navLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="font-sans text-[14px] text-lavender-smoke hover:text-cold-pearl transition-colors duration-150"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="font-technical text-[11px] tracking-[0.14em] uppercase text-iris-dusk mb-4">
              Contact
            </p>
            <a
              href="mailto:hello@protogrid.com"
              className="font-sans text-[14px] text-lavender-smoke hover:text-cold-pearl transition-colors duration-150"
            >
              hello@protogrid.com
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-iris-dusk/20 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-col gap-2">
            <p className="font-technical text-[11px] tracking-[0.06em] text-iris-dusk">
              © 2025 ProtoGrid. All rights reserved.
            </p>
            <PilotBadge variant="line" />
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/terms"
              className="font-technical text-[11px] tracking-[0.06em] text-iris-dusk hover:text-lavender-smoke transition-colors duration-150"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="font-technical text-[11px] tracking-[0.06em] text-iris-dusk hover:text-lavender-smoke transition-colors duration-150"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
