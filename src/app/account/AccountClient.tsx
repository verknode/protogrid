"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { signOut, authClient } from "@/lib/auth-client";
import { deleteAccount } from "@/app/actions/deleteAccount";
import { AlertCircle, LogOut, ChevronRight, Paperclip, Send, Trash2, CheckCircle2, MessageSquare, Pencil } from "lucide-react";
import Link from "next/link";
import { PilotBadge } from "@/components/PilotBadge";

const STATUS_LABEL: Record<string, string> = {
  NEW:       "New",
  IN_REVIEW: "In Review",
  QUOTED:    "Quoted",
  ACCEPTED:  "Accepted",
  REJECTED:  "Rejected",
  DONE:      "Done",
};

type SessionUser = { name: string; email: string; role: string };
type FileInfo    = { id: string; name: string; url: string };
type RequestRow  = { id: string; title: string | null; message: string; status: string; createdAt: Date; files: FileInfo[]; messageCount: number };
type Props       = { user: SessionUser | null; requests: RequestRow[]; dbUnavailable: boolean };

const inputClass =
  "w-full h-11 px-4 bg-transparent border border-iris-dusk/40 rounded-sm text-[13px] text-cold-pearl placeholder:text-lavender-smoke/40 focus:outline-none focus:border-lavender-smoke transition-colors duration-150";

// ─── Password change form ────────────────────────────────────────

function PasswordSettings() {
  const [current,  setCurrent]  = useState("");
  const [next,     setNext]     = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [success,  setSuccess]  = useState(false);
  const [isPending, start]      = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (next.length < 8)          { setError("New password must be at least 8 characters."); return; }
    if (next !== confirm)          { setError("Passwords do not match."); return; }

    start(async () => {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: next, revokeOtherSessions: false }),
      });

      if (res.ok) {
        setSuccess(true);
        setCurrent(""); setNext(""); setConfirm("");
        return;
      }

      const data = await res.json().catch(() => ({})) as { message?: string };
      setError(data.message ?? "Failed to change password. Check your current password.");
    });
  }

  return (
    <div className="bg-surface border border-iris-dusk/40 rounded-sm">
      <div className="px-5 py-3 border-b border-iris-dusk/15">
        <p className="font-technical text-[10px] tracking-[0.14em] uppercase text-iris-dusk">Change password</p>
      </div>
      <form onSubmit={handleSubmit} className="px-5 py-5 flex flex-col gap-4">
        <div>
          <label className="block font-technical text-[10px] tracking-[0.1em] uppercase text-iris-dusk mb-2">
            Current password
          </label>
          <input
            type="password"
            value={current}
            onChange={e => setCurrent(e.target.value)}
            autoComplete="current-password"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="block font-technical text-[10px] tracking-[0.1em] uppercase text-iris-dusk mb-2">
            New password
          </label>
          <input
            type="password"
            value={next}
            onChange={e => setNext(e.target.value)}
            autoComplete="new-password"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className="block font-technical text-[10px] tracking-[0.1em] uppercase text-iris-dusk mb-2">
            Confirm new password
          </label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
            className={inputClass}
          />
        </div>

        {error && (
          <p className="font-technical text-[11px] text-red-400">{error}</p>
        )}
        {success && (
          <p className="flex items-center gap-1.5 font-technical text-[11px] text-cold-pearl">
            <CheckCircle2 size={12} className="text-iris-dusk" />
            Password updated.
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="h-10 px-5 bg-cold-pearl text-ink-shadow font-technical text-[12px] tracking-[0.06em] rounded-sm hover:bg-[#D8D9DC] transition-colors duration-150 disabled:opacity-50 self-start"
        >
          {isPending ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}

// ─── Name edit form ─────────────────────────────────────────────

function NameSettings({ initialName }: { initialName: string }) {
  const router = useRouter();
  const [editing,   setEditing]   = useState(false);
  const [name,      setName]      = useState(initialName);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState(false);
  const [isPending, start]        = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const trimmed = name.trim();
    if (!trimmed) { setError("Name cannot be empty."); return; }
    if (trimmed === initialName) { setEditing(false); return; }

    start(async () => {
      const res = await authClient.updateUser({ name: trimmed });
      if (res.error) {
        setError(res.error.message ?? "Failed to update name.");
        return;
      }
      setSuccess(true);
      setEditing(false);
      router.refresh();
    });
  }

  return (
    <div className="px-5 py-3 flex items-center justify-between gap-6 border-b border-iris-dusk/10">
      <p className="font-technical text-[10px] tracking-[0.1em] uppercase text-iris-dusk shrink-0">Name</p>
      {editing ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-1 justify-end">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            className="h-8 px-3 bg-transparent border border-iris-dusk/40 rounded-sm text-[13px] text-cold-pearl focus:outline-none focus:border-lavender-smoke transition-colors duration-150 w-full max-w-[200px]"
          />
          <button
            type="submit"
            disabled={isPending}
            className="h-8 px-3 bg-cold-pearl text-ink-shadow font-technical text-[11px] tracking-[0.06em] rounded-sm hover:bg-[#D8D9DC] transition-colors duration-150 disabled:opacity-50 shrink-0"
          >
            {isPending ? "…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => { setEditing(false); setName(initialName); setError(null); }}
            className="font-technical text-[11px] text-iris-dusk hover:text-lavender-smoke transition-colors duration-150 shrink-0"
          >
            Cancel
          </button>
          {error && <p className="font-technical text-[10px] text-red-400 shrink-0">{error}</p>}
        </form>
      ) : (
        <div className="flex items-center gap-2 justify-end">
          <p className="font-sans text-[13px] text-lavender-smoke">
            {success ? name : initialName}
          </p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-iris-dusk hover:text-lavender-smoke transition-colors duration-150"
            title="Edit name"
          >
            <Pencil size={11} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────

export function AccountClient({ user, requests, dbUnavailable }: Props) {
  const router = useRouter();
  const [tab,           setTab]           = useState<"requests" | "settings">("requests");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError,   setDeleteError]   = useState<string | null>(null);
  const [isPending,     startTransition]  = useTransition();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  function handleDeleteConfirm() {
    startTransition(async () => {
      const result = await deleteAccount();
      if (result.error) { setDeleteError(result.error); setConfirmDelete(false); return; }
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
            <p className="font-sans text-[14px] text-lavender-smoke mb-6">{user.email}</p>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-0 border border-iris-dusk/30 rounded-sm w-fit overflow-hidden">
            {(["requests", "settings"] as const).map((t, i) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={[
                  "px-4 h-9 font-technical text-[11px] tracking-[0.1em] uppercase transition-colors duration-150",
                  i > 0 ? "border-l border-iris-dusk/30" : "",
                  tab === t
                    ? "bg-iris-dusk/15 text-cold-pearl"
                    : "text-lavender-smoke/60 hover:text-lavender-smoke",
                ].join(" ")}
              >
                {t === "requests" ? `Requests${requests.length > 0 ? ` (${requests.length})` : ""}` : "Settings"}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 lg:py-24 flex-1">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl space-y-4">

            {/* ── Requests tab ── */}
            {tab === "requests" && (
              <>
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

                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="flex items-center justify-between px-5 py-4 bg-surface border border-iris-dusk/45 rounded-sm hover:border-iris-dusk/60 transition-colors duration-150 group"
                  >
                    <div>
                      <p className="font-technical text-[10px] tracking-[0.14em] uppercase text-lavender-smoke mb-0.5">Admin</p>
                      <p className="font-sans text-[13px] text-cold-pearl">Open admin panel</p>
                    </div>
                    <ChevronRight size={14} className="text-iris-dusk group-hover:text-lavender-smoke transition-colors duration-150" />
                  </Link>
                )}

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
                        <p className="font-sans text-[13px] text-lavender-smoke">Connect database to load your requests.</p>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-full border border-iris-dusk/30 flex items-center justify-center mb-4">
                            <Send size={16} className="text-iris-dusk" />
                          </div>
                          <p className="font-display font-semibold text-[16px] text-cold-pearl mb-1.5">No requests yet</p>
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
                                <p className="font-sans text-[13px] text-cold-pearl truncate mb-0.5">{req.title}</p>
                              )}
                              <p className="font-sans text-[13px] text-lavender-smoke line-clamp-1">{req.message}</p>
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
                            {req.messageCount > 0 && (
                              <span className="flex items-center gap-1 font-technical text-[10px] tracking-[0.04em] text-lavender-smoke">
                                <MessageSquare size={10} />
                                {req.messageCount}
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
              </>
            )}

            {/* ── Settings tab ── */}
            {tab === "settings" && (
              <>
                {/* Profile */}
                <div className="bg-surface border border-iris-dusk/40 rounded-sm">
                  <div className="px-5 py-3 border-b border-iris-dusk/15">
                    <p className="font-technical text-[10px] tracking-[0.14em] uppercase text-iris-dusk">Profile</p>
                  </div>
                  {user ? (
                    <div className="divide-y divide-iris-dusk/10">
                      <NameSettings initialName={user.name} />
                      <div className="px-5 py-3 flex items-center justify-between gap-6">
                        <p className="font-technical text-[10px] tracking-[0.1em] uppercase text-iris-dusk shrink-0">Email</p>
                        <p className="font-sans text-[13px] text-lavender-smoke text-right truncate">{user.email}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="px-5 py-8">
                      <p className="font-sans text-[13px] text-lavender-smoke">Profile unavailable.</p>
                    </div>
                  )}
                </div>

                {/* Password */}
                <PasswordSettings />

                {/* Early access */}
                <div className="px-1">
                  <PilotBadge variant="row" />
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
                      onClick={() => { setDeleteError(null); setConfirmDelete(true); }}
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
                          onClick={() => { setConfirmDelete(false); setDeleteError(null); }}
                          disabled={isPending}
                          className="font-technical text-[11px] tracking-[0.08em] text-iris-dusk hover:text-lavender-smoke transition-colors duration-150"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </section>
    </>
  );
}
