"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { Footer } from "@/components/home/Footer";
import { AlertCircle, LogOut, ChevronRight, Paperclip } from "lucide-react";
import Link from "next/link";

const STATUS_LABEL: Record<string, string> = {
  NEW:       "New",
  IN_REVIEW: "In Review",
  ACCEPTED:  "Accepted",
  REJECTED:  "Rejected",
  DONE:      "Done",
};

type SessionUser = { name: string; email: string; role: string };
type FileInfo    = { id: string; name: string; url: string };
type RequestRow  = { id: string; message: string; status: string; createdAt: Date; files: FileInfo[] };
type Props       = { user: SessionUser | null; requests: RequestRow[]; dbUnavailable: boolean };

export function AccountClient({ user, requests, dbUnavailable }: Props) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  const isAdmin = user?.role === "admin";

  return (
    <>
      {/* Header */}
      <section className="py-16 lg:py-24 border-b border-iris-dusk/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-3">
            Account
          </p>
          <h1 className="font-display font-bold text-[clamp(26px,4vw,40px)] leading-[1.08] tracking-[-0.02em] text-cold-pearl mb-1">
            {user?.name ?? "Your account"}
          </h1>
          {user?.email && (
            <p className="font-sans text-[14px] text-lavender-smoke">{user.email}</p>
          )}
        </div>
      </section>

      <section className="py-10 lg:py-14 flex-1">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-xl space-y-4">

            {/* DB warning */}
            {dbUnavailable && (
              <div className="border border-iris-dusk/40 rounded-sm px-5 py-4 flex items-start gap-3">
                <AlertCircle size={14} className="text-lavender-smoke shrink-0 mt-0.5" />
                <div>
                  <p className="font-technical text-[10px] tracking-[0.1em] uppercase text-lavender-smoke mb-1">
                    Database not connected
                  </p>
                  <p className="font-sans text-[13px] leading-[1.6] text-iris-dusk">
                    Set <code className="font-technical text-lavender-smoke">DATABASE_URL</code> and restart.
                  </p>
                </div>
              </div>
            )}

            {/* Admin entry point */}
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="flex items-center justify-between px-5 py-4 border border-iris-dusk/35 rounded-sm hover:border-iris-dusk/60 transition-colors duration-150 group"
              >
                <div>
                  <p className="font-technical text-[10px] tracking-[0.14em] uppercase text-lavender-smoke mb-0.5">
                    Admin
                  </p>
                  <p className="font-sans text-[13px] text-cold-pearl">Open admin panel</p>
                </div>
                <ChevronRight size={14} className="text-iris-dusk group-hover:text-lavender-smoke transition-colors duration-150" />
              </Link>
            )}

            {/* Profile */}
            <div className="border border-iris-dusk/25 rounded-sm">
              <div className="px-5 py-3 border-b border-iris-dusk/15">
                <p className="font-technical text-[10px] tracking-[0.14em] uppercase text-iris-dusk">Profile</p>
              </div>
              {user ? (
                <div className="divide-y divide-iris-dusk/10">
                  {[
                    { label: "Name",  value: user.name },
                    { label: "Email", value: user.email },
                  ].map(({ label, value }) => (
                    <div key={label} className="px-5 py-3 flex items-center justify-between gap-6">
                      <p className="font-technical text-[10px] tracking-[0.1em] uppercase text-iris-dusk shrink-0">{label}</p>
                      <p className="font-sans text-[13px] text-lavender-smoke text-right truncate">{value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-8">
                  <p className="font-sans text-[13px] text-lavender-smoke">Profile unavailable.</p>
                </div>
              )}
            </div>

            {/* Requests */}
            <div className="border border-iris-dusk/25 rounded-sm">
              <div className="px-5 py-3 border-b border-iris-dusk/15 flex items-center justify-between">
                <p className="font-technical text-[10px] tracking-[0.14em] uppercase text-iris-dusk">
                  Submitted Requests
                </p>
                {requests.length > 0 && (
                  <span className="font-technical text-[10px] text-iris-dusk">{requests.length}</span>
                )}
              </div>

              {requests.length === 0 ? (
                <div className="px-5 py-8">
                  <p className="font-sans text-[13px] text-lavender-smoke">
                    {dbUnavailable
                      ? "Connect database to load your requests."
                      : (
                        <>No requests yet.{" "}
                          <Link href="/contact" className="text-cold-pearl hover:text-white transition-colors duration-150">
                            Send your first task →
                          </Link>
                        </>
                      )}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-iris-dusk/10">
                  {requests.map((req) => (
                    <Link
                      key={req.id}
                      href={`/account/requests/${req.id}`}
                      className="block px-5 py-4 hover:bg-iris-dusk/5 transition-colors duration-150 group"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <p className="font-sans text-[13px] text-lavender-smoke line-clamp-2 flex-1">
                          {req.message}
                        </p>
                        <span className="shrink-0 font-technical text-[10px] tracking-[0.08em] uppercase text-iris-dusk border border-iris-dusk/35 rounded-full px-2 py-0.5">
                          {STATUS_LABEL[req.status] ?? req.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-technical text-[10px] tracking-[0.06em] text-iris-dusk">
                          {new Date(req.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </p>
                        {req.files.length > 0 && (
                          <span className="flex items-center gap-1 font-technical text-[10px] tracking-[0.04em] text-iris-dusk">
                            <Paperclip size={10} />
                            {req.files.length}
                          </span>
                        )}
                        <span className="font-technical text-[10px] text-iris-dusk group-hover:text-lavender-smoke transition-colors duration-150 ml-auto">
                          View →
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 font-technical text-[11px] tracking-[0.08em] text-lavender-smoke hover:text-cold-pearl transition-colors duration-150 py-1"
            >
              <LogOut size={13} />
              Sign out
            </button>

          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
