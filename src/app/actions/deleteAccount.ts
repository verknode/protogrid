"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function deleteAccount(): Promise<{ error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { error: "Not authenticated." };
  if (session.user.role === "admin") return { error: "Admin accounts cannot be self-deleted." };

  await db.user.delete({ where: { id: session.user.id } });

  return {};
}
