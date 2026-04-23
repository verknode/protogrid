import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Requests — ProtoGrid Admin" };

const STATUSES = ["NEW", "IN_REVIEW", "QUOTED", "ACCEPTED", "REJECTED", "DONE"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_LABEL: Record<string, string> = {
  NEW:       "New",
  IN_REVIEW: "In Review",
  QUOTED:    "Quoted",
  ACCEPTED:  "Accepted",
  REJECTED:  "Rejected",
  DONE:      "Done",
};

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; sort?: string }>;
}) {
  const { status: rawStatus, q, sort } = await searchParams;

  const activeStatus =
    rawStatus && STATUSES.includes(rawStatus as Status)
      ? (rawStatus as Status)
      : null;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") redirect("/account");

  let dbUnavailable = false;
  let requests: Array<{
    id: string;
    title: string | null;
    name: string;
    email: string;
    message: string;
    dimensions: string | null;
    deadline: string | null;
    status: string;
    createdAt: Date;
    files: { id: string }[];
  }> = [];

  try {
    requests = await db.request.findMany({
      where: {
        ...(activeStatus ? { status: activeStatus } : {}),
        ...(q && q.trim()
          ? {
              OR: [
                { title:   { contains: q, mode: "insensitive" } },
                { name:    { contains: q, mode: "insensitive" } },
                { email:   { contains: q, mode: "insensitive" } },
                { message: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: sort === "oldest" ? "asc" : "desc" },
      take: 100,
      select: {
        id: true, title: true, name: true, email: true, message: true,
        dimensions: true, deadline: true, status: true, createdAt: true,
        files: { select: { id: true } },
      },
    });
  } catch {
    dbUnavailable = true;
  }

  // Build filter URL helper
  function filterUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { status: activeStatus ?? undefined, q: q ?? undefined, sort: sort ?? undefined, ...overrides };
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v); });
    const s = params.toString();
    return `/admin/requests${s ? "?" + s : ""}`;
  }

  const statusFilters = [
    { label: "All",  href: filterUrl({ status: undefined }) },
    ...STATUSES.map((s) => ({ label: STATUS_LABEL[s], href: filterUrl({ status: s }) })),
  ];

  return (
    <div>
      <p className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4">Admin</p>
      <h1 className="font-display font-bold text-[clamp(24px,3vw,40px)] leading-[1.1] tracking-[-0.01em] text-cold-pearl mb-8">
        Requests
      </h1>

      {dbUnavailable && (
        <div className="border border-iris-dusk/40 rounded-sm px-5 py-4 flex items-start gap-3 mb-6">
          <AlertCircle size={15} className="text-lavender-smoke shrink-0 mt-0.5" />
          <p className="font-sans text-[13px] leading-[1.6] text-iris-dusk">
            Database not connected. Set{" "}
            <code className="font-technical text-lavender-smoke">DATABASE_URL</code> to load requests.
          </p>
        </div>
      )}

      {/* Search */}
      <form action="/admin/requests" method="GET" className="flex gap-2 mb-5">
        {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
        {sort && <input type="hidden" name="sort" value={sort} />}
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search name, email, task…"
          className="flex-1 h-9 px-3 bg-transparent border border-iris-dusk/40 rounded-sm font-sans text-[13px] text-cold-pearl placeholder:text-lavender-smoke/50 focus:outline-none focus:border-lavender-smoke transition-colors duration-150"
        />
        <button
          type="submit"
          className="h-9 px-4 border border-iris-dusk/40 rounded-sm font-technical text-[11px] tracking-[0.08em] text-lavender-smoke hover:border-iris-dusk/60 hover:text-cold-pearl transition-colors duration-150"
        >
          Search
        </button>
        {q && (
          <Link
            href={filterUrl({ q: undefined })}
            className="h-9 px-3 flex items-center font-technical text-[11px] tracking-[0.06em] text-iris-dusk hover:text-lavender-smoke transition-colors duration-150"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Status filters + sort */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex flex-wrap gap-1.5">
          {statusFilters.map(({ label, href }) => {
            const active = label === "All" ? !activeStatus : activeStatus === STATUSES.find(s => STATUS_LABEL[s] === label);
            return (
              <Link
                key={label}
                href={href}
                className={`h-7 px-3 font-technical text-[11px] tracking-[0.08em] rounded-sm border transition-colors duration-150 ${
                  active
                    ? "border-lavender-smoke/60 text-cold-pearl"
                    : "border-iris-dusk/25 text-lavender-smoke hover:border-iris-dusk/50 hover:text-cold-pearl"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
        <div className="flex gap-1.5">
          {[
            { label: "Newest", value: undefined },
            { label: "Oldest", value: "oldest" },
          ].map(({ label, value }) => (
            <Link
              key={label}
              href={filterUrl({ sort: value })}
              className={`h-7 px-3 font-technical text-[11px] tracking-[0.08em] rounded-sm border transition-colors duration-150 ${
                (sort === value || (!sort && !value))
                  ? "border-lavender-smoke/60 text-cold-pearl"
                  : "border-iris-dusk/25 text-lavender-smoke hover:border-iris-dusk/50 hover:text-cold-pearl"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-iris-dusk/40 rounded-sm overflow-hidden">
        {/* Desktop column headers */}
        <div className="hidden lg:grid grid-cols-[1fr_2fr_80px_80px_120px] gap-4 px-5 py-3 border-b border-iris-dusk/20 bg-iris-dusk/5">
          {["Sender", "Task", "Files", "Date", "Status"].map((h) => (
            <p key={h} className="font-technical text-[10px] tracking-[0.14em] uppercase text-iris-dusk">{h}</p>
          ))}
        </div>

        {requests.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="font-sans text-[14px] text-lavender-smoke">
              {dbUnavailable
                ? "Connect database to load requests."
                : q
                ? `No results for "${q}".`
                : activeStatus
                ? `No requests with status "${STATUS_LABEL[activeStatus]}".`
                : "No requests yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-iris-dusk/15">
            {requests.map((req) => (
              <Link
                key={req.id}
                href={`/admin/requests/${req.id}`}
                className="flex flex-col gap-2 px-5 py-4 lg:grid lg:grid-cols-[1fr_2fr_80px_80px_120px] lg:gap-4 lg:items-center hover:bg-iris-dusk/5 transition-colors duration-150"
              >
                <div>
                  <p className="font-sans text-[13px] text-cold-pearl">{req.name}</p>
                  <p className="font-technical text-[11px] tracking-[0.04em] text-iris-dusk truncate">{req.email}</p>
                </div>
                <div>
                  {req.title && (
                    <p className="font-sans text-[13px] text-cold-pearl truncate mb-0.5">{req.title}</p>
                  )}
                  <p className="font-sans text-[13px] text-lavender-smoke line-clamp-1">{req.message}</p>
                  {(req.dimensions || req.deadline) && (
                    <p className="font-technical text-[10px] tracking-[0.06em] text-iris-dusk mt-0.5">
                      {[req.dimensions && `dim: ${req.dimensions}`, req.deadline && `by: ${req.deadline}`]
                        .filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
                <p className="font-technical text-[11px] tracking-[0.06em] text-lavender-smoke">
                  {req.files.length > 0 ? req.files.length : "—"}
                </p>
                <p className="font-technical text-[11px] tracking-[0.06em] text-lavender-smoke">
                  {req.createdAt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </p>
                <span className="inline-flex font-technical text-[10px] tracking-[0.1em] uppercase text-iris-dusk border border-iris-dusk/40 rounded-full px-2 py-0.5 w-fit">
                  {STATUS_LABEL[req.status] ?? req.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {requests.length > 0 && (
        <p className="font-technical text-[11px] tracking-[0.06em] text-iris-dusk mt-4">
          {requests.length} request{requests.length !== 1 ? "s" : ""}
          {activeStatus ? ` · ${STATUS_LABEL[activeStatus]}` : ""}
          {q ? ` · matching "${q}"` : ""}
        </p>
      )}
    </div>
  );
}
