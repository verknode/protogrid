import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";

export const metadata = { title: "Dashboard — ProtoGrid Admin" };

const stats = [
  { label: "New",       value: "—" },
  { label: "In Review", value: "—" },
  { label: "Accepted",  value: "—" },
  { label: "Done",      value: "—" },
];

export default async function AdminDashboardPage() {
  let session = null;
  let dbUnavailable = false;

  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    dbUnavailable = true;
  }

  // If we have a real session but user is not admin, send them away
  if (session && session.user.role !== "admin") {
    redirect("/account");
  }

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
        {stats.map(({ label, value }) => (
          <div key={label} className="border border-iris-dusk/25 rounded-sm p-6">
            <p className="font-technical text-[11px] tracking-[0.12em] uppercase text-lavender-smoke mb-3">
              {label}
            </p>
            <p className="font-display font-bold text-[32px] leading-none text-cold-pearl">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent requests */}
      <div className="border border-iris-dusk/25 rounded-sm">
        <div className="px-6 py-4 border-b border-iris-dusk/20 flex items-center justify-between">
          <p className="font-technical text-[11px] tracking-[0.12em] uppercase text-lavender-smoke">
            Recent Requests
          </p>
          <a
            href="/admin/requests"
            className="font-technical text-[11px] tracking-[0.08em] text-iris-dusk hover:text-lavender-smoke transition-colors duration-150"
          >
            View all →
          </a>
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
