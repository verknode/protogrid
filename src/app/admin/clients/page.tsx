import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Clients — ProtoGrid Admin" };

const STATUS_COLORS: Record<string, string> = {
  NEW:       "text-cold-pearl",
  IN_REVIEW: "text-lavender-smoke",
  ACCEPTED:  "text-emerald-400",
  REJECTED:  "text-red-400",
  DONE:      "text-iris-dusk",
};

export default async function AdminClientsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") redirect("/account");

  let dbUnavailable = false;

  type ClientRow = {
    email: string;
    name: string;
    total: number;
    lastDate: Date;
    statuses: Record<string, number>;
  };

  let clients: ClientRow[] = [];

  try {
    // Group by email — covers both registered and guest submissions
    const grouped = await db.request.groupBy({
      by: ["email"],
      _count: { id: true },
      _max:   { createdAt: true },
      orderBy: { _max: { createdAt: "desc" } },
    });

    // Fetch latest name + status breakdown per email
    const details = await Promise.all(
      grouped.map(async (g) => {
        const rows = await db.request.findMany({
          where: { email: g.email },
          select: { name: true, status: true },
        });
        const statuses: Record<string, number> = {};
        for (const r of rows) {
          statuses[r.status] = (statuses[r.status] ?? 0) + 1;
        }
        return {
          email:    g.email,
          name:     rows[0]?.name ?? g.email,
          total:    g._count.id,
          lastDate: g._max.createdAt as Date,
          statuses,
        };
      })
    );

    clients = details;
  } catch {
    dbUnavailable = true;
  }

  return (
    <div>
      <p className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4">
        Admin
      </p>
      <h1 className="font-display font-bold text-[clamp(24px,3vw,40px)] leading-[1.1] tracking-[-0.01em] text-cold-pearl mb-8">
        Clients
      </h1>

      {dbUnavailable && (
        <div className="border border-iris-dusk/40 rounded-sm px-5 py-4 flex items-start gap-3 mb-6">
          <AlertCircle size={15} className="text-lavender-smoke shrink-0 mt-0.5" />
          <p className="font-sans text-[13px] leading-[1.6] text-iris-dusk">
            Database not connected. Set{" "}
            <code className="font-technical text-lavender-smoke">DATABASE_URL</code> to load clients.
          </p>
        </div>
      )}

      <div className="bg-surface border border-iris-dusk/40 rounded-sm overflow-hidden">
        {/* Desktop header */}
        <div className="hidden lg:grid grid-cols-[1fr_1fr_80px_140px_160px] gap-4 px-5 py-3 border-b border-iris-dusk/20 bg-iris-dusk/5">
          {["Client", "Email", "Requests", "Last activity", "Statuses"].map((h) => (
            <p key={h} className="font-technical text-[10px] tracking-[0.14em] uppercase text-iris-dusk">
              {h}
            </p>
          ))}
        </div>

        {clients.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="font-sans text-[14px] text-lavender-smoke">
              {dbUnavailable ? "Connect database to load clients." : "No clients yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-iris-dusk/15">
            {clients.map((c) => (
              <Link
                key={c.email}
                href={`/admin/requests?q=${encodeURIComponent(c.email)}`}
                className="flex flex-col gap-2 px-5 py-4 lg:grid lg:grid-cols-[1fr_1fr_80px_140px_160px] lg:gap-4 lg:items-center hover:bg-iris-dusk/5 transition-colors duration-150 group"
              >
                {/* Name */}
                <p className="font-sans text-[13px] text-cold-pearl group-hover:text-white transition-colors duration-150">
                  {c.name}
                </p>

                {/* Email */}
                <p className="font-technical text-[11px] tracking-[0.04em] text-iris-dusk truncate">
                  {c.email}
                </p>

                {/* Total */}
                <p className="font-technical text-[13px] text-lavender-smoke">
                  {c.total}
                </p>

                {/* Last activity */}
                <p className="font-technical text-[11px] tracking-[0.06em] text-lavender-smoke">
                  {c.lastDate.toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </p>

                {/* Status breakdown */}
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(c.statuses).map(([status, count]) => (
                    <span
                      key={status}
                      className={`font-technical text-[10px] tracking-[0.08em] ${STATUS_COLORS[status] ?? "text-iris-dusk"}`}
                    >
                      {status.replace("_", " ")} ×{count}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {clients.length > 0 && (
        <p className="font-technical text-[11px] tracking-[0.06em] text-iris-dusk mt-4">
          {clients.length} client{clients.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
