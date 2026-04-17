import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AccountClient } from "./AccountClient";
import { Footer } from "@/components/home/Footer";

export const metadata = { title: "Account — ProtoGrid" };

export default async function AccountPage() {
  let session = null;
  let dbUnavailable = false;
  let requests: Array<{
    id: string;
    title: string | null;
    message: string;
    status: string;
    createdAt: Date;
    files: Array<{ id: string; name: string; url: string }>;
  }> = [];

  try {
    session = await auth.api.getSession({ headers: await headers() });

    if (session) {
      requests = await db.request.findMany({
        where: {
          OR: [
            { userId: session.user.id },
            ...(session.user.emailVerified ? [{ email: session.user.email, userId: null }] : []),
          ],
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          message: true,
          status: true,
          createdAt: true,
          files: {
            select: { id: true, name: true, url: true },
            orderBy: { createdAt: "asc" },
          },
        },
      });
    }
  } catch {
    dbUnavailable = true;
  }

  if (!session && !dbUnavailable) {
    redirect("/login");
  }

  if (session && !session.user.emailVerified) {
    redirect(`/verify-email?email=${encodeURIComponent(session.user.email)}`);
  }

  return (
    <main className="flex flex-col pt-16">
      <AccountClient
        user={session?.user ?? null}
        requests={requests}
        dbUnavailable={dbUnavailable}
      />
      <Footer />
    </main>
  );
}
