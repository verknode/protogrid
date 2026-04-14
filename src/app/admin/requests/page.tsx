import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const statusColors: Record<string, string> = {
  NEW: "text-cold-pearl border-iris-dusk/60",
  IN_REVIEW: "text-lavender-smoke border-iris-dusk/40",
  ACCEPTED: "text-cold-pearl border-iris-dusk/40",
  REJECTED: "text-lavender-smoke border-iris-dusk/20",
  DONE: "text-iris-dusk border-iris-dusk/20",
};

export default async function AdminRequestsPage() {
  let session = null;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    // DB not connected
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

      {/* Filter row */}
      <div className="flex gap-2 mb-6">
        {["All", "New", "In Review", "Accepted", "Done"].map((f) => (
          <button
            key={f}
            className={`h-8 px-3 font-technical text-[11px] tracking-[0.08em] rounded-sm border transition-colors duration-150 ${
              f === "All"
                ? "border-lavender-smoke/50 text-cold-pearl"
                : "border-iris-dusk/25 text-lavender-smoke hover:border-iris-dusk/50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border border-iris-dusk/25 rounded-sm overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-4 px-6 py-3 border-b border-iris-dusk/20 bg-iris-dusk/5">
          {["Name", "Task", "Date", "Status"].map((h) => (
            <p key={h} className="font-technical text-[10px] tracking-[0.14em] uppercase text-iris-dusk">
              {h}
            </p>
          ))}
        </div>
        <div className="px-6 py-12 text-center">
          <p className="font-sans text-[14px] text-lavender-smoke">
            No requests. Connect your database to load data.
          </p>
        </div>
      </div>
    </div>
  );
}
