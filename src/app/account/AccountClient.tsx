"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signOut } from "@/lib/auth-client";
import { deleteAccount } from "@/app/actions/deleteAccount";
import { Footer } from "@/components/home/Footer";
import { AlertCircle, LogOut, ChevronRight, Paperclip, Send, Trash2 } from "lucide-react";
import Link from "next/link";
import { PilotBadge } from "@/components/PilotBadge";

const STATUS_LABEL: Record<string, string> = {
  NEW:       "New",
  IN_REVIEW: "In Review",
  ACCEPTED:  "Accepted",
  REJECTED:  "Rejected",
  DONE:      "Done",
};

type SessionUser = { name: string; email: string; role: string };
type FileInfo    = { id: string; name: string; url: string };
type RequestRow  = { id: string; title: string | null; message: string; status: string; createdAt: Date; files: FileInfo[] };
type Props       = { user: SessionUser | null; requests: RequestRow[]; dbUnavailable: boolean };

export function AccountClient({ user, requests, dbUnavailable }: Props) {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError]     = useState<string | null>(null);
  const [isPending, startTransition]      = useTransition();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  function handleDeleteClick() {
    setDeleteError(null);
    setConfirmDelete(true);
  }

  function handleDeleteCancel() {
    setConfirmDelete(false);
    setDeleteError(null);
  }

  function handleDeleteConfirm() {
    startTransition(async () => {
      const result = await deleteAccount();
      if (result.error) {
        setDeleteError(result.error);
        setConfirmDelete(false);
        return;
      }
      await signOut();
      router.push("/");
      router.refresh();
    });
  }

  const isAdmin = user?.role === "admin";

  return (
    <>
      {/* Header */}
      <section className="py-8 lg:py-14 border-b border-iris-dusk/20">
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

      <section className="py-6 lg:py-10 flex-1">
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
                className="flex items-center justify-between px-5 py-4 bg-surface border border-iris-dusk/45 rounded-sm hover:border-iris-dusk/60 transition-colors duration-150 group"
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
            <div className="bg-surface border border-iris-dusk/40 rounded-sm">
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

            {/* Early access notice */}
            <div className="px-1">
              <PilotBadge variant="row" />
            </div>

            {/* Requests */}
            <div className="bg-surface border border-iris-dusk/40 rounded-sm">
              <div className="px-5 py-3 border-b border-iris-dusk/15 flex items-center justify-between">
                <p className="font-technical text-[10px] tracking-[0.14em] uppercase text-iris-dusk">
                  Submitted Requests
                </p>
                {requests.length > 0 && (
                  <span className="font-technical text-[10px] text-iris-dusk">{requests.length}</span>
                )}
              </div>

              {requests.length === 0 ? (
                <div className="px-5 py-10 flex flex-col items-center text-center">
                  {dbUnavailable ? (
                    <p className="font-sans text-[13px] text-lavender-smoke">
                      Connect database to load your requests.
                    </p>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full border border-iris-dusk/30 flex items-center justify-center mb-4">
                        <Send size={16} className="text-iris-dusk" />
                      </div>
                      <p className="font-display font-semibold text-[16px] text-cold-pearl mb-1.5">
                        No requests yet
                      </p>
                      <p className="font-sans text-[13px] text-lavender-smoke mb-5 max-w-[28ch]">
                        Send your first task and we will get back to you within 1 business day.
                      </p>
                      <Link
                        href="/contact"
                        className="h-10 px-5 bg-cold-pearl text-ink-shadow text-[13px] font-technical tracking-[0.06em] rounded-sm hover:bg-[#D8D9DC] transition-colors duration-200 inline-flex items-center"
                      >
                        Create a request
                      </Link>
                    </>
                  )}
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
                        <div className="flex-1 min-w-0">
                          {req.title && (
                            <p className="font-sans text-[13px] text-cold-pearl truncate mb-0.5">
                              {req.title}
                            </p>
                          )}
                          <p className="font-sans text-[13px] text-lavender-smoke line-clamp-1">
                            {req.message}
                          </p>
                        </div>
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

            {/* Delete account */}
            {user && !confirmDelete && (
              <div className="pt-4 border-t border-iris-dusk/15">
                {deleteError && (
                  <p className="font-technical text-[11px] text-red-400 mb-3">{deleteError}</p>
                )}
                <button
                  onClick={handleDeleteClick}
                  className="flex items-center gap-2 font-technical text-[11px] tracking-[0.08em] text-iris-dusk hover:text-red-400 transition-colors duration-150 py-1"
                >
                  <Trash2 size={13} />
                  Delete account
                </button>
              </div>
            )}

            {confirmDelete && (
              <div className="pt-4 border-t border-iris-dusk/15">
                <div className="bg-surface border border-red-400/25 rounded-sm px-5 py-4">
                  <p className="font-technical text-[10px] tracking-[0.12em] uppercase text-red-400 mb-2">
                    Permanent action
                  </p>
                  <p className="font-sans text-[13px] leading-[1.6] text-lavender-smoke mb-4">
                    Your account and all personal data will be deleted immediately. Submitted requests stay on file for operational purposes.
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleDeleteConfirm}
                      disabled={isPending}
                      className="h-9 px-4 bg-red-400/10 border border-red-400/40 text-red-400 font-technical text-[11px] tracking-[0.08em] rounded-sm hover:bg-red-400/20 transition-colors duration-150 disabled:opacity-50"
                    >
                      {isPending ? "Deleting…" : "Yes, delete my account"}
                    </button>
                    <button
                      onClick={handleDeleteCancel}
                      disabled={isPending}
                      className="font-technical text-[11px] tracking-[0.08em] text-iris-dusk hover:text-lavender-smoke transition-colors duration-150"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
