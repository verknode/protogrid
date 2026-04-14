import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";

export const metadata = { title: "Requests — ProtoGrid Admin" };

const filters = ["All", "New", "In Review", "Accepted", "Done"];

export default async function AdminRequestsPage() {
  let session = null;
  let dbUnavailable = false;

  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    dbUnavailable = true;
  }

  if (session && session.user.role !== "admin") {
    redirect("/account");
  }

  return (
    <div>
      <p className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4">
        Admin
      </p>
      <h1 className="font-display font-bold text-[clamp(24px,3vw,40px)] leading-[1.1] tracking-[-0.01em] text-cold-pearl mb-10">
        Requests
      </h1>

      {dbUnavailable && (
        <div className="border border-iris-dusk/40 rounded-sm px-5 py-4 flex items-start gap-3 mb-8">
          <AlertCircle size={15} className="text-lavender-smoke shrink-0 mt-0.5" />
          <p className="font-sans text-[13px] leading-[1.6] text-iris-dusk">
            Database not connected. Set{" "}
            <code className="font-technical text-lavender-smoke">DATABASE_URL</code> to load requests.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f, i) => (
          <button
            key={f}
            className={`h-8 px-3 font-technical text-[11px] tracking-[0.08em] rounded-sm border transition-colors duration-150 ${
              i === 0
                ? "border-lavender-smoke/50 text-cold-pearl"
                : "border-iris-dusk/25 text-lavender-smoke hover:border-iris-dusk/50 hover:text-cold-pearl"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border border-iris-dusk/25 rounded-sm overflow-hidden">
        <div className="hidden lg:grid grid-cols-[1fr_2fr_120px_100px] gap-6 px-6 py-3 border-b border-iris-dusk/20 bg-iris-dusk/5">
          {["Sender", "Task", "Date", "Status"].map((h) => (
            <p key={h} className="font-technical text-[10px] tracking-[0.14em] uppercase text-iris-dusk">
              {h}
            </p>
          ))}
        </div>
        <div className="px-6 py-12 text-center">
          <p className="font-sans text-[14px] text-lavender-smoke">
            {dbUnavailable ? "Connect database to load requests." : "No requests yet."}
          </p>
        </div>
      </div>
    </div>
  );
}
