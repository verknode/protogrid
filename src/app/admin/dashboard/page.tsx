import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const stats = [
  { label: "New", value: "—" },
  { label: "In Review", value: "—" },
  { label: "Accepted", value: "—" },
  { label: "Done", value: "—" },
];

export default async function AdminDashboardPage() {
  let session = null;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    // DB not connected — middleware cookie check still guards the route
  }

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

      {/* Requests table */}
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
            No requests yet. Connect your database to load data.
          </p>
        </div>
      </div>
    </div>
  );
}
