"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") throw new Error("Unauthorized");
}

export async function getFounderProfile() {
  try {
    const profile = await db.founderProfile.findFirst();
    return profile;
  } catch {
    return null;
  }
}

export async function upsertFounderProfile(data: {
  name: string;
  title: string;
  shortBio: string;
  longText: string;
  imageUrl?: string;
  imageKey?: string;
}): Promise<{ success: true } | { error: string }> {
  await requireAdmin();

  try {
    const existing = await db.founderProfile.findFirst();
    if (existing) {
      await db.founderProfile.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await db.founderProfile.create({ data });
    }
    revalidatePath("/about");
    revalidatePath("/");
    revalidatePath("/admin/founder");
    return { success: true };
  } catch {
    return { error: "Failed to save founder profile" };
  }
}
