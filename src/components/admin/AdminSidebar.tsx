"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Inbox, User, LogOut, ArrowLeft } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { PilotBadge } from "@/components/PilotBadge";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/requests",  label: "Requests",  icon: Inbox },
  { href: "/admin/founder",   label: "Founder",   icon: User },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      {/* Mobile top bar */}
      <header className="lg:hidden shrink-0 border-b border-iris-dusk/20 h-14 flex items-center justify-between px-4">
        {/* Wordmark */}
        <Link
          href="/"
          className="font-technical text-[12px] tracking-[0.18em] text-cold-pearl hover:text-white transition-colors duration-150 shrink-0"
        >
          PROTOGRID
          <span className="ml-2 font-technical text-[10px] tracking-[0.12em] uppercase text-iris-dusk">
            Admin
          </span>
        </Link>

        {/* Icon-only nav — fits any phone width */}
        <nav className="flex items-center gap-0.5">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              title={label}
              aria-label={label}
              className={`flex items-center justify-center w-9 h-9 rounded-sm transition-colors duration-150 ${
                isActive(href)
                  ? "text-cold-pearl bg-iris-dusk/15"
                  : "text-lavender-smoke hover:text-cold-pearl hover:bg-iris-dusk/10"
              }`}
            >
              <Icon size={16} />
            </Link>
          ))}

          <div className="w-px h-5 bg-iris-dusk/20 mx-1" />

          <Link
            href="/account"
            title="My account"
            aria-label="My account"
            className="flex items-center justify-center w-9 h-9 rounded-sm text-lavender-smoke hover:text-cold-pearl transition-colors duration-150"
          >
            <ArrowLeft size={16} />
          </Link>
          <button
            onClick={handleSignOut}
            title="Sign out"
            aria-label="Sign out"
            className="flex items-center justify-center w-9 h-9 rounded-sm text-lavender-smoke hover:text-cold-pearl transition-colors duration-150"
          >
            <LogOut size={16} />
          </button>
        </nav>
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-52 shrink-0 border-r border-iris-dusk/20 flex-col py-8 px-4 min-h-screen sticky top-0">
        <Link
          href="/"
          className="font-technical text-[12px] tracking-[0.18em] text-cold-pearl px-2 mb-2 hover:text-white transition-colors duration-150"
        >
          PROTOGRID
        </Link>
        <p className="font-technical text-[10px] tracking-[0.12em] uppercase text-iris-dusk px-2 mb-8">
          Admin
        </p>

        <nav className="flex-1 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 h-9 px-2 rounded-sm font-technical text-[11px] tracking-[0.06em] transition-colors duration-150 ${
                isActive(href)
                  ? "text-cold-pearl bg-iris-dusk/15"
                  : "text-lavender-smoke hover:text-cold-pearl hover:bg-iris-dusk/10"
              }`}
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="space-y-0.5 border-t border-iris-dusk/20 pt-4">
          <div className="px-2 pb-3">
            <PilotBadge variant="line" />
          </div>
          <Link
            href="/account"
            className="flex items-center gap-3 h-9 px-2 rounded-sm font-technical text-[11px] tracking-[0.06em] text-lavender-smoke hover:text-cold-pearl transition-colors duration-150"
          >
            <ArrowLeft size={14} />
            My account
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 h-9 px-2 w-full rounded-sm font-technical text-[11px] tracking-[0.06em] text-lavender-smoke hover:text-cold-pearl transition-colors duration-150"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
