"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { Footer } from "@/components/home/Footer";
import { LogOut, User, Inbox, AlertCircle } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  NEW:       "New",
  IN_REVIEW: "In Review",
  ACCEPTED:  "Accepted",
  REJECTED:  "Rejected",
  DONE:      "Done",
};

type SessionUser = { name: string; email: string; role: string };

type RequestRow = {
  id: string;
  message: string;
  status: string;
  createdAt: Date;
};

type Props = {
  user: SessionUser | null;
  requests: RequestRow[];
  dbUnavailable: boolean;
};

export function AccountClient({ user, requests, dbUnavailable }: Props) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* Header */}
      <section className="py-24 lg:py-32 border-b border-iris-dusk/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4">
            Account
          </p>
          <h1 className="font-display font-bold text-[clamp(28px,4vw,52px)] leading-[1.08] tracking-[-0.02em] text-cold-pearl mb-2">
            {user?.name ?? "Your account"}
          </h1>
          {user?.email && (
            <p className="font-sans text-[15px] text-lavender-smoke">{user.email}</p>
          )}
        </div>
      </section>

      <section className="py-16 lg:py-20 flex-1">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-[260px_1fr] gap-10 lg:gap-16 items-start">

          {/* Sidebar */}
          <div className="space-y-0.5">
            <p className="font-technical text-[10px] tracking-[0.16em] uppercase text-iris-dusk mb-4 px-3">
              Navigation
            </p>
            {[
              { icon: User,  label: "Profile",     i: 0 },
              { icon: Inbox, label: "My Requests",  i: 1 },
            ].map(({ icon: Icon, label, i }) => (
              <button
                key={label}
                className={`flex items-center gap-3 w-full h-10 px-3 rounded-sm font-technical text-[12px] tracking-[0.06em] transition-colors duration-150 ${
                  i === 0
                    ? "bg-iris-dusk/15 text-cold-pearl"
                    : "text-lavender-smoke hover:text-cold-pearl hover:bg-iris-dusk/10"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
            <div className="pt-4 mt-3 border-t border-iris-dusk/20 space-y-0.5">
              {user?.role === "admin" && (
                <a
                  href="/admin/dashboard"
                  className="flex items-center gap-3 h-10 px-3 rounded-sm font-technical text-[12px] tracking-[0.06em] text-lavender-smoke hover:text-cold-pearl hover:bg-iris-dusk/10 transition-colors duration-150"
                >
                  Admin panel →
                </a>
              )}
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
          <div className="space-y-6">
            {dbUnavailable && (
              <div className="border border-iris-dusk/40 rounded-sm px-5 py-4 flex items-start gap-3">
                <AlertCircle size={15} className="text-lavender-smoke shrink-0 mt-0.5" />
                <div>
                  <p className="font-technical text-[11px] tracking-[0.08em] uppercase text-lavender-smoke mb-1">
                    Database not connected
                  </p>
                  <p className="font-sans text-[13px] leading-[1.6] text-iris-dusk">
                    Set <code className="font-technical text-lavender-smoke">DATABASE_URL</code> in your{" "}
                    <code className="font-technical text-lavender-smoke">.env</code> and restart.
                  </p>
                </div>
              </div>
            )}

            {/* Profile */}
            <div className="border border-iris-dusk/25 rounded-sm">
              <div className="px-6 py-4 border-b border-iris-dusk/20">
                <p className="font-technical text-[11px] tracking-[0.12em] uppercase text-lavender-smoke">
                  Profile
                </p>
              </div>
              {user ? (
                <div className="divide-y divide-iris-dusk/15">
                  {[
                    { label: "Name",  value: user.name },
                    { label: "Email", value: user.email },
                    { label: "Role",  value: user.role },
                  ].map(({ label, value }) => (
                    <div key={label} className="px-6 py-4 grid grid-cols-[110px_1fr] gap-4">
                      <p className="font-technical text-[11px] tracking-[0.1em] uppercase text-iris-dusk">
                        {label}
                      </p>
                      <p className="font-sans text-[14px] text-lavender-smoke">{value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-10 text-center">
                  <p className="font-sans text-[14px] text-lavender-smoke">
                    Profile unavailable — database not connected.
                  </p>
                </div>
              )}
            </div>

            {/* Submitted requests */}
            <div className="border border-iris-dusk/25 rounded-sm">
              <div className="px-6 py-4 border-b border-iris-dusk/20 flex items-center justify-between">
                <p className="font-technical text-[11px] tracking-[0.12em] uppercase text-lavender-smoke">
                  Submitted Requests
                </p>
                {requests.length > 0 && (
                  <span className="font-technical text-[11px] tracking-[0.06em] text-iris-dusk">
                    {requests.length}
                  </span>
                )}
              </div>

              {requests.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <p className="font-sans text-[14px] text-lavender-smoke">
                    {dbUnavailable
                      ? "Connect database to load your requests."
                      : <>No requests yet.{" "}
                          <a href="/contact" className="text-cold-pearl hover:text-white transition-colors duration-150">
                            Send your first task →
                          </a>
                        </>}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-iris-dusk/15">
                  {requests.map((req) => (
                    <div key={req.id} className="px-6 py-4 flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-sans text-[13px] text-lavender-smoke line-clamp-2 mb-1">
                          {req.message}
                        </p>
                        <p className="font-technical text-[10px] tracking-[0.06em] text-iris-dusk">
                          {new Date(req.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span className="shrink-0 font-technical text-[10px] tracking-[0.1em] uppercase text-iris-dusk border border-iris-dusk/40 rounded-full px-2 py-0.5">
                        {STATUS_LABEL[req.status] ?? req.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
