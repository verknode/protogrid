export default function DashboardPage() {
  return (
    <div>
      <p className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4">
        Overview
      </p>
      <h1 className="font-display font-bold text-[clamp(24px,3vw,40px)] leading-[1.1] tracking-[-0.01em] text-cold-pearl mb-10">
        Dashboard
      </h1>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "New Requests", value: "—" },
          { label: "In Review", value: "—" },
          { label: "Accepted", value: "—" },
          { label: "Completed", value: "—" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="border border-iris-dusk/25 rounded-sm p-6"
          >
            <p className="font-technical text-[11px] tracking-[0.12em] uppercase text-lavender-smoke mb-2">
              {stat.label}
            </p>
            <p className="font-display font-bold text-[32px] text-cold-pearl">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Requests table placeholder */}
      <div className="border border-iris-dusk/25 rounded-sm">
        <div className="px-6 py-4 border-b border-iris-dusk/20">
          <p className="font-technical text-[12px] tracking-[0.08em] uppercase text-lavender-smoke">
            Recent Requests
          </p>
        </div>
        <div className="px-6 py-12 text-center">
          <p className="font-sans text-[14px] text-lavender-smoke">
            No requests yet.
          </p>
        </div>
      </div>
    </div>
  );
}
