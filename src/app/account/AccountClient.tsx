"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { Footer } from "@/components/home/Footer";
import { LogOut, User, Inbox } from "lucide-react";

type Props = {
  user: { name: string; email: string; role: string };
};

export function AccountClient({ user }: Props) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <section className="py-24 lg:py-32 border-b border-iris-dusk/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4">
            Account
          </p>
          <h1 className="font-display font-bold text-[clamp(28px,4vw,52px)] leading-[1.08] tracking-[-0.02em] text-cold-pearl mb-2">
            {user.name}
          </h1>
          <p className="font-sans text-[15px] text-lavender-smoke">{user.email}</p>
        </div>
      </section>

      <section className="py-16 lg:py-20 flex-1">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-[280px_1fr] gap-10 lg:gap-16 items-start">
          {/* Sidebar */}
          <div className="space-y-1">
            <p className="font-technical text-[10px] tracking-[0.16em] uppercase text-iris-dusk mb-4">
              Navigation
            </p>
            {[
              { icon: User, label: "Profile", active: true },
              { icon: Inbox, label: "My Requests", active: false },
            ].map(({ icon: Icon, label, active }) => (
              <button
                key={label}
                className={`flex items-center gap-3 w-full h-10 px-3 rounded-sm font-technical text-[12px] tracking-[0.06em] transition-colors duration-150 ${
                  active
                    ? "bg-iris-dusk/15 text-cold-pearl"
                    : "text-lavender-smoke hover:text-cold-pearl hover:bg-iris-dusk/10"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
            <div className="pt-4 border-t border-iris-dusk/20 mt-4">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full h-10 px-3 rounded-sm font-technical text-[12px] tracking-[0.06em] text-lavender-smoke hover:text-cold-pearl transition-colors duration-150"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Profile info */}
            <div className="border border-iris-dusk/25 rounded-sm">
              <div className="px-6 py-4 border-b border-iris-dusk/20">
                <p className="font-technical text-[11px] tracking-[0.12em] uppercase text-lavender-smoke">
                  Profile
                </p>
              </div>
              <div className="p-6 space-y-0 divide-y divide-iris-dusk/15">
                {[
                  { label: "Name", value: user.name },
                  { label: "Email", value: user.email },
                  { label: "Role", value: user.role },
                ].map(({ label, value }) => (
                  <div key={label} className="py-4 first:pt-0 last:pb-0 grid grid-cols-[120px_1fr] gap-4">
                    <p className="font-technical text-[11px] tracking-[0.1em] uppercase text-iris-dusk">
                      {label}
                    </p>
                    <p className="font-sans text-[14px] text-lavender-smoke">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Submitted requests */}
            <div className="border border-iris-dusk/25 rounded-sm">
              <div className="px-6 py-4 border-b border-iris-dusk/20">
                <p className="font-technical text-[11px] tracking-[0.12em] uppercase text-lavender-smoke">
                  Submitted Requests
                </p>
              </div>
              <div className="px-6 py-12 text-center">
                <p className="font-sans text-[14px] text-lavender-smoke">
                  No requests yet.{" "}
                  <a href="/contact" className="text-cold-pearl hover:text-white transition-colors duration-150">
                    Send your first task →
                  </a>
                </p>
              </div>
            </div>

            {user.role === "admin" && (
              <div className="border border-iris-dusk/25 rounded-sm px-6 py-5 flex items-center justify-between">
                <p className="font-sans text-[14px] text-lavender-smoke">
                  You have admin access.
                </p>
                <a
                  href="/admin/dashboard"
                  className="font-technical text-[12px] tracking-[0.06em] text-cold-pearl hover:text-white transition-colors duration-150"
                >
                  Go to Admin →
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
