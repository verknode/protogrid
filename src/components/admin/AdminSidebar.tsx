"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Inbox, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/requests", label: "Requests", icon: Inbox },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="w-56 shrink-0 border-r border-iris-dusk/20 flex flex-col py-8 px-4">
      {/* Logo */}
      <Link
        href="/"
        className="font-technical text-[13px] tracking-[0.2em] text-cold-pearl px-2 mb-10 hover:text-white transition-colors duration-150"
      >
        PROTOGRID
      </Link>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 h-10 px-2 rounded-sm font-technical text-[12px] tracking-[0.06em] transition-colors duration-150 ${
                active
                  ? "text-cold-pearl bg-iris-dusk/15"
                  : "text-lavender-smoke hover:text-cold-pearl hover:bg-iris-dusk/10"
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 h-10 px-2 rounded-sm font-technical text-[12px] tracking-[0.06em] text-lavender-smoke hover:text-cold-pearl transition-colors duration-150 w-full"
      >
        <LogOut size={15} />
        Sign out
      </button>
    </aside>
  );
}
