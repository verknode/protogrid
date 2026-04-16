import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Dashboard — ProtoGrid Admin" };

const STATUS_LABEL: Record<string, string> = {
  NEW: "New",
  IN_REVIEW: "In Review",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  DONE: "Done",
};

export default async function AdminDashboardPage() {
  let session = null;
  let dbUnavailable = false;
  let stats = { NEW: 0, IN_REVIEW: 0, ACCEPTED: 0, DONE: 0 };
  let recent: Array<{
    id: string;
    title: string | null;
    name: string;
    email: string;
    message: string;
    status: string;
    createdAt: Date;
  }> = [];

  try {
    session = await auth.api.getSession({ headers: await headers() });

    const [newCount, inReviewCount, acceptedCount, doneCount, requests] =
      await Promise.all([
        db.request.count({ where: { status: "NEW" } }),
        db.request.count({ where: { status: "IN_REVIEW" } }),
        db.request.count({ where: { status: "ACCEPTED" } }),
        db.request.count({ where: { status: "DONE" } }),
        db.request.findMany({
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            title: true,
            name: true,
            email: true,
            message: true,
            status: true,
            createdAt: true,
          },
        }),
      ]);

    stats = {
      NEW: newCount,
      IN_REVIEW: inReviewCount,
      ACCEPTED: acceptedCount,
      DONE: doneCount,
    };
    recent = requests;
  } catch {
    dbUnavailable = true;
  }

  if (session && session.user.role !== "admin") {
    redirect("/account");
  }

  const statCards = [
    { label: "New",       value: stats.NEW },
    { label: "In Review", value: stats.IN_REVIEW },
    { label: "Accepted",  value: stats.ACCEPTED },
    { label: "Done",      value: stats.DONE },
  ];

  return (
    <div>
      <p className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4">
        Overview
      </p>
      <h1 className="font-display font-bold text-[clamp(24px,3vw,40px)] leading-[1.1] tracking-[-0.01em] text-cold-pearl mb-10">
        Dashboard
      </h1>

      {dbUnavailable && (
        <div className="border border-iris-dusk/40 rounded-sm px-5 py-4 flex items-start gap-3 mb-8">
          <AlertCircle size={15} className="text-lavender-smoke shrink-0 mt-0.5" />
          <p className="font-sans text-[13px] leading-[1.6] text-iris-dusk">
            Database not connected. Set{" "}
            <code className="font-technical text-lavender-smoke">DATABASE_URL</code> to load live data.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {statCards.map(({ label, value }) => (
          <div key={label} className="bg-surface border border-iris-dusk/40 rounded-sm p-6">
            <p className="font-technical text-[11px] tracking-[0.12em] uppercase text-lavender-smoke mb-3">
              {label}
            </p>
            <p className="font-display font-bold text-[32px] leading-none text-cold-pearl">
              {dbUnavailable ? "—" : value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent requests */}
      <div className="bg-surface border border-iris-dusk/40 rounded-sm">
        <div className="px-6 py-4 border-b border-iris-dusk/20 flex items-center justify-between">
          <p className="font-technical text-[11px] tracking-[0.12em] uppercase text-lavender-smoke">
            Recent Requests
          </p>
          <Link
            href="/admin/requests"
            className="font-technical text-[11px] tracking-[0.08em] text-iris-dusk hover:text-lavender-smoke transition-colors duration-150"
          >
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="font-sans text-[14px] text-lavender-smoke">
              {dbUnavailable ? "Connect database to load requests." : "No requests yet."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop column headers */}
            <div className="hidden lg:grid grid-cols-[1fr_1fr_120px_100px] gap-6 px-6 py-3 border-b border-iris-dusk/20 bg-iris-dusk/5">
              {["Sender", "Task", "Date", "Status"].map((h) => (
                <p key={h} className="font-technical text-[10px] tracking-[0.14em] uppercase text-iris-dusk">
                  {h}
                </p>
              ))}
            </div>
            <div className="divide-y divide-iris-dusk/15">
              {recent.map((req) => (
                <Link
                  key={req.id}
                  href={`/admin/requests/${req.id}`}
                  className="px-6 py-4 flex flex-col gap-2 lg:grid lg:grid-cols-[1fr_1fr_120px_100px] lg:gap-6 lg:items-center hover:bg-iris-dusk/5 transition-colors duration-150"
                >
                  <div>
                    <p className="font-sans text-[13px] text-cold-pearl">{req.name}</p>
                    <p className="font-technical text-[11px] tracking-[0.04em] text-iris-dusk">{req.email}</p>
                  </div>
                  <div>
                    {req.title && <p className="font-sans text-[13px] text-cold-pearl truncate mb-0.5">{req.title}</p>}
                    <p className="font-sans text-[13px] text-lavender-smoke line-clamp-1">{req.message}</p>
                  </div>
                  <p className="font-technical text-[11px] tracking-[0.06em] text-lavender-smoke">
                    {req.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                  <span className="inline-flex font-technical text-[10px] tracking-[0.1em] uppercase text-iris-dusk border border-iris-dusk/40 rounded-full px-2 py-0.5 w-fit">
                    {STATUS_LABEL[req.status] ?? req.status}
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
