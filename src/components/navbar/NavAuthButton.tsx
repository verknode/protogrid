"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { User, LayoutDashboard } from "lucide-react";

export function NavAuthButton() {
  const { data: session, isPending } = useSession();

  if (isPending) return null;

  if (session) {
    return (
      <div className="hidden lg:flex items-center gap-2">
        {session.user.role === "admin" && (
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1.5 h-10 px-3 border border-iris-dusk/40 text-lavender-smoke text-[12px] font-technical tracking-[0.06em] rounded-sm hover:border-iris-dusk/70 hover:text-cold-pearl transition-colors duration-150 whitespace-nowrap"
          >
            <LayoutDashboard size={12} />
            Admin
          </Link>
        )}
        <Link
          href="/account"
          className="flex items-center gap-1.5 h-10 px-4 border border-iris-dusk/40 text-lavender-smoke text-[12px] font-technical tracking-[0.06em] rounded-sm hover:border-iris-dusk/70 hover:text-cold-pearl transition-colors duration-150 whitespace-nowrap"
        >
          <User size={12} />
          Account
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex items-center gap-2">
      <Link
        href="/register"
        className="flex items-center h-10 px-4 border border-iris-dusk/40 text-lavender-smoke text-[12px] font-technical tracking-[0.06em] rounded-sm hover:border-iris-dusk/70 hover:text-cold-pearl transition-colors duration-150 whitespace-nowrap"
      >
        Register
      </Link>
      <Link
        href="/login"
        className="flex items-center h-10 px-4 border border-iris-dusk/40 text-lavender-smoke text-[12px] font-technical tracking-[0.06em] rounded-sm hover:border-iris-dusk/70 hover:text-cold-pearl transition-colors duration-150 whitespace-nowrap"
      >
        Sign in
      </Link>
    </div>
  );
}
