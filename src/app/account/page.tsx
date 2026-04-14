import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AccountClient } from "./AccountClient";

export const metadata = { title: "Account — ProtoGrid" };

export default async function AccountPage() {
  let session = null;
  let dbUnavailable = false;

  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch {
    // DB not reachable. Middleware already confirmed a session cookie exists,
    // so we know the user is authenticated — just can't load their profile.
    dbUnavailable = true;
  }

  // Only redirect to login if we got a real "no session" response (not a DB error).
  // If we redirect on DB error, we create an infinite loop:
  // account → (DB fail) → login → (cookie found) → account → ...
  if (!session && !dbUnavailable) {
    redirect("/login");
  }

  return (
    <main className="flex flex-col pt-16">
      <AccountClient user={session?.user ?? null} dbUnavailable={dbUnavailable} />
    </main>
  );
}
