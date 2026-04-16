import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getFounderProfile } from "@/app/actions/founderActions";
import { FounderEditor } from "@/components/admin/FounderEditor";

export const metadata = { title: "Founder — ProtoGrid Admin" };

export default async function AdminFounderPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") redirect("/account");

  const profile = await getFounderProfile();

  return (
    <div>
      <p className="font-technical text-[11px] tracking-[0.18em] uppercase text-lavender-smoke mb-4">Admin</p>
      <h1 className="font-display font-bold text-[clamp(24px,3vw,40px)] leading-[1.1] tracking-[-0.01em] text-cold-pearl mb-8">
        Founder
      </h1>
      <FounderEditor initial={profile} />
    </div>
  );
}
