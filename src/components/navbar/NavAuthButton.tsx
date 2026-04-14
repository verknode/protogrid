"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { User } from "lucide-react";

export function NavAuthButton() {
  const { data: session, isPending } = useSession();

  if (isPending) return null;

  if (session) {
    return (
      <Link
        href="/account"
        className="hidden lg:flex items-center gap-1.5 h-10 px-4 border border-iris-dusk/40 text-lavender-smoke text-[12px] font-technical tracking-[0.06em] rounded-sm hover:border-iris-dusk/70 hover:text-cold-pearl transition-colors duration-150 whitespace-nowrap shrink-0"
      >
        <User size={13} />
        Account
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="hidden lg:flex items-center h-10 px-4 border border-iris-dusk/40 text-lavender-smoke text-[12px] font-technical tracking-[0.06em] rounded-sm hover:border-iris-dusk/70 hover:text-cold-pearl transition-colors duration-150 whitespace-nowrap shrink-0"
    >
      Sign in
    </Link>
  );
}
