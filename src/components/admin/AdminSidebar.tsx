"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Inbox, LogOut, ArrowLeft } from "lucide-react";
import { signOut } from "@/lib/auth-client";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/requests",  label: "Requests",  icon: Inbox },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="w-52 shrink-0 border-r border-iris-dusk/20 flex flex-col py-8 px-4 min-h-screen sticky top-0">
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 font-technical text-[12px] tracking-[0.18em] text-cold-pearl px-2 mb-2 hover:text-white transition-colors duration-150"
      >
        PROTOGRID
      </Link>
      <p className="font-technical text-[10px] tracking-[0.12em] uppercase text-iris-dusk px-2 mb-8">
        Admin
      </p>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 h-9 px-2 rounded-sm font-technical text-[11px] tracking-[0.06em] transition-colors duration-150 ${
                active
                  ? "text-cold-pearl bg-iris-dusk/15"
                  : "text-lavender-smoke hover:text-cold-pearl hover:bg-iris-dusk/10"
              }`}
            >
              <Icon size={14} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="space-y-0.5 border-t border-iris-dusk/20 pt-4">
        <Link
          href="/account"
          className="flex items-center gap-3 h-9 px-2 rounded-sm font-technical text-[11px] tracking-[0.06em] text-lavender-smoke hover:text-cold-pearl transition-colors duration-150"
        >
          <ArrowLeft size={14} />
          My account
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 h-9 px-2 rounded-sm font-technical text-[11px] tracking-[0.06em] text-lavender-smoke hover:text-cold-pearl transition-colors duration-150 w-full"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
