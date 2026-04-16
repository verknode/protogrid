import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Footer } from "@/components/home/Footer";
import { ArrowLeft, Paperclip, Download } from "lucide-react";
import Link from "next/link";
import { MessageThread } from "@/components/admin/MessageThread";

export const metadata = { title: "Request — ProtoGrid" };

const STATUS_LABEL: Record<string, string> = {
  NEW:       "New",
  IN_REVIEW: "In Review",
  ACCEPTED:  "Accepted",
  REJECTED:  "Rejected",
  DONE:      "Done",
};

const STATUS_DESC: Record<string, string> = {
  NEW:       "Your request has been received. We'll review it soon.",
  IN_REVIEW: "We're reviewing your request and will get back to you shortly.",
  ACCEPTED:  "Your request has been accepted. We'll be in touch about next steps.",
  REJECTED:  "We weren't able to take on this request. Contact us to discuss alternatives.",
  DONE:      "This request has been completed.",
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default async function AccountRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const request = await db.request.findFirst({
    where: {
      id,
      OR: [
        { userId: session.user.id },
        { email: session.user.email },
      ],
    },
    include: {
      files:    { orderBy: { createdAt: "asc" } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!request) redirect("/account");

  return (
    <main className="flex flex-col pt-16 min-h-screen">
      {/* Header */}
      <section className="py-6 lg:py-10 border-b border-iris-dusk/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 font-technical text-[11px] tracking-[0.08em] text-iris-dusk hover:text-lavender-smoke transition-colors duration-150 mb-6"
          >
            <ArrowLeft size={12} />
            Account
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-2">
                Request
              </p>
              {request.title && (
                <p className="font-sans text-[15px] text-cold-pearl mb-1">{request.title}</p>
              )}
              <p className="font-technical text-[11px] tracking-[0.06em] text-iris-dusk">
                {new Date(request.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit", month: "short", year: "numeric",
                })}
              </p>
            </div>
            <span className="font-technical text-[10px] tracking-[0.1em] uppercase text-iris-dusk border border-iris-dusk/40 rounded-full px-3 py-1">
              {STATUS_LABEL[request.status] ?? request.status}
            </span>
          </div>
        </div>
      </section>

      <section className="py-6 lg:py-10 flex-1">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl space-y-8">

            {/* Task description */}
            <div>
              <p className="font-technical text-[10px] tracking-[0.14em] uppercase text-iris-dusk mb-3">
                Task description
              </p>
              <p className="font-sans text-[15px] leading-[1.68] text-lavender-smoke whitespace-pre-wrap">
                {request.message}
              </p>
            </div>

            {/* Details */}
            {(request.dimensions || request.deadline) && (
              <div className="grid sm:grid-cols-2 gap-6 border-t border-iris-dusk/15 pt-6">
                {request.dimensions && (
                  <div>
                    <p className="font-technical text-[10px] tracking-[0.14em] uppercase text-iris-dusk mb-1">
                      Dimensions
                    </p>
                    <p className="font-sans text-[14px] text-lavender-smoke">{request.dimensions}</p>
                  </div>
                )}
                {request.deadline && (
                  <div>
                    <p className="font-technical text-[10px] tracking-[0.14em] uppercase text-iris-dusk mb-1">
                      Deadline
                    </p>
                    <p className="font-sans text-[14px] text-lavender-smoke">{request.deadline}</p>
                  </div>
                )}
              </div>
            )}

            {/* Files */}
            {request.files.length > 0 && (
              <div className="border-t border-iris-dusk/15 pt-6">
                <p className="font-technical text-[10px] tracking-[0.14em] uppercase text-iris-dusk mb-3">
                  Attached files
                  <span className="ml-2 text-iris-dusk/60">{request.files.length}</span>
                </p>
                <div className="space-y-2">
                  {request.files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between gap-4 py-2 border-b border-iris-dusk/10 last:border-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <Paperclip size={12} className="text-iris-dusk shrink-0" />
                        <span className="font-technical text-[11px] tracking-[0.04em] text-lavender-smoke truncate">
                          {file.name}
                        </span>
                        <span className="font-technical text-[10px] text-iris-dusk shrink-0">
                          {formatBytes(file.size)}
                        </span>
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

            {/* Status info */}
            <div className="bg-surface border border-iris-dusk/40 rounded-sm px-5 py-4">
              <p className="font-technical text-[10px] tracking-[0.14em] uppercase text-iris-dusk mb-2">
                Status — {STATUS_LABEL[request.status]}
              </p>
              <p className="font-sans text-[13px] leading-[1.6] text-lavender-smoke">
                {STATUS_DESC[request.status] ?? "Status information unavailable."}
              </p>
            </div>

            {/* Chat */}
            <div className="bg-surface border border-iris-dusk/40 rounded-sm">
              <div className="px-5 py-3 border-b border-iris-dusk/15 flex items-center justify-between">
                <p className="font-technical text-[10px] tracking-[0.14em] uppercase text-iris-dusk">Messages</p>
                {request.messages.length > 0 && (
                  <span className="font-technical text-[10px] text-iris-dusk">{request.messages.length}</span>
                )}
              </div>
              <MessageThread
                requestId={request.id}
                messages={request.messages}
                isAdmin={false}
              />
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
