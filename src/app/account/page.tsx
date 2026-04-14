import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AccountClient } from "./AccountClient";

export const metadata = { title: "Account — ProtoGrid" };

export default async function AccountPage() {
  let session = null;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    // DB unavailable — middleware handles cookie-based guard
  }

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="flex flex-col pt-16">
      <AccountClient user={session.user} />
    </main>
  );
}
