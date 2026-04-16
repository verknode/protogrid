import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, Paperclip, Download } from "lucide-react";
import Link from "next/link";
import { StatusSelector } from "@/components/admin/StatusSelector";
import { NoteEditor } from "@/components/admin/NoteEditor";
import { MessageThread } from "@/components/admin/MessageThread";

const STATUS_LABEL: Record<string, string> = {
  NEW:       "New",
  IN_REVIEW: "In Review",
  ACCEPTED:  "Accepted",
  REJECTED:  "Rejected",
  DONE:      "Done",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") redirect("/account");

  const request = await db.request.findUnique({
    where: { id },
    include: {
      files:    { orderBy: { createdAt: "asc" } },
      messages: { orderBy: { createdAt: "asc" } },
      user:     { select: { id: true } },
    },
  });

  if (!request) redirect("/admin/requests");

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/requests"
        className="inline-flex items-center gap-1.5 font-technical text-[11px] tracking-[0.08em] text-iris-dusk hover:text-lavender-smoke transition-colors duration-150 mb-8"
      >
        <ArrowLeft size={12} />
        All requests
      </Link>

      {/* Identity + status */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
        <div>
          {request.title && (
            <p className="font-technical text-[10px] tracking-[0.12em] uppercase text-lavender-smoke mb-1">
              {request.title}
            </p>
          )}
          <h1 className="font-display font-bold text-[clamp(20px,2.5vw,28px)] leading-[1.1] text-cold-pearl mb-1">
            {request.name}
          </h1>
          <p className="font-technical text-[11px] tracking-[0.06em] text-iris-dusk">
            {request.email}
          </p>
          <p className="font-technical text-[11px] tracking-[0.06em] text-iris-dusk mt-0.5">
            {new Date(request.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit", month: "short", year: "numeric",
            })}{" "}
            {new Date(request.createdAt).toLocaleTimeString("en-GB", {
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
        <span className="font-technical text-[10px] tracking-[0.1em] uppercase text-iris-dusk border border-iris-dusk/40 rounded-full px-3 py-1">
          {STATUS_LABEL[request.status] ?? request.status}
        </span>
      </div>

      <div className="space-y-8">

        {/* Task */}
        <div className="bg-surface border border-iris-dusk/40 rounded-sm">
          <div className="px-5 py-3 border-b border-iris-dusk/15">
            <p className="font-technical text-[10px] tracking-[0.14em] uppercase text-iris-dusk">Task</p>
          </div>
          <div className="px-5 py-4">
            <p className="font-sans text-[14px] leading-[1.68] text-lavender-smoke whitespace-pre-wrap">
              {request.message}
            </p>
          </div>
          {(request.dimensions || request.deadline) && (
            <div className="px-5 pb-4 grid sm:grid-cols-2 gap-4 border-t border-iris-dusk/10 pt-4">
              {request.dimensions && (
                <div>
                  <p className="font-technical text-[10px] tracking-[0.12em] uppercase text-iris-dusk mb-1">Dimensions</p>
                  <p className="font-sans text-[13px] text-lavender-smoke">{request.dimensions}</p>
                </div>
              )}
              {request.deadline && (
                <div>
                  <p className="font-technical text-[10px] tracking-[0.12em] uppercase text-iris-dusk mb-1">Deadline</p>
                  <p className="font-sans text-[13px] text-lavender-smoke">{request.deadline}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Files */}
        {request.files.length > 0 && (
          <div className="bg-surface border border-iris-dusk/40 rounded-sm">
            <div className="px-5 py-3 border-b border-iris-dusk/15 flex items-center justify-between">
              <p className="font-technical text-[10px] tracking-[0.14em] uppercase text-iris-dusk">Files</p>
              <span className="font-technical text-[10px] text-iris-dusk">{request.files.length}</span>
            </div>
            <div className="divide-y divide-iris-dusk/10">
              {request.files.map((file) => (
                <div key={file.id} className="px-5 py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 min-w-0">
                    <Paperclip size={12} className="text-iris-dusk shrink-0" />
                    <div className="min-w-0">
                      <p className="font-technical text-[11px] tracking-[0.04em] text-lavender-smoke truncate">
                        {file.name}
                      </p>
                      <p className="font-technical text-[10px] text-iris-dusk">{formatBytes(file.size)}</p>
                    </div>
                  </div>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 font-technical text-[11px] tracking-[0.06em] text-iris-dusk hover:text-lavender-smoke transition-colors duration-150 shrink-0"
                  >
                    <Download size={12} />
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status change */}
        <div className="bg-surface border border-iris-dusk/40 rounded-sm">
          <div className="px-5 py-3 border-b border-iris-dusk/15">
            <p className="font-technical text-[10px] tracking-[0.14em] uppercase text-iris-dusk">Change status</p>
          </div>
          <div className="px-5 py-4">
            <StatusSelector requestId={request.id} current={request.status} />
          </div>
        </div>

        {/* Chat */}
        <div className="bg-surface border border-iris-dusk/40 rounded-sm">
          <div className="px-5 py-3 border-b border-iris-dusk/15 flex items-center justify-between">
            <p className="font-technical text-[10px] tracking-[0.14em] uppercase text-iris-dusk">Chat with client</p>
            {request.messages.length > 0 && (
              <span className="font-technical text-[10px] text-iris-dusk">{request.messages.length}</span>
            )}
          </div>
          <MessageThread
            requestId={request.id}
            messages={request.messages}
            isAdmin={true}
          />
        </div>

        {/* Admin note */}
        <div className="bg-surface border border-iris-dusk/40 rounded-sm">
          <div className="px-5 py-3 border-b border-iris-dusk/15">
            <p className="font-technical text-[10px] tracking-[0.14em] uppercase text-iris-dusk">Admin note</p>
          </div>
          <div className="px-5 py-4">
            <NoteEditor requestId={request.id} initialNote={request.adminNote} />
          </div>
        </div>

      </div>
    </div>
  );
}
