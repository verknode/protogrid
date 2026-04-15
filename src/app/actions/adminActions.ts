"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

const VALID_STATUSES = ["NEW", "IN_REVIEW", "ACCEPTED", "REJECTED", "DONE"] as const;
type Status = (typeof VALID_STATUSES)[number];

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    throw new Error("Unauthorized");
  }
}

export async function updateRequestStatus(
  requestId: string,
  status: string,
): Promise<{ success: true } | { error: string }> {
  await requireAdmin();

  if (!VALID_STATUSES.includes(status as Status)) {
    return { error: "Invalid status" };
  }

  try {
    await db.request.update({
      where: { id: requestId },
      data: { status: status as Status },
    });
    revalidatePath(`/admin/requests/${requestId}`);
    revalidatePath("/admin/requests");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch {
    return { error: "Failed to update status" };
  }
}

export async function updateAdminNote(
  requestId: string,
  note: string,
): Promise<{ success: true } | { error: string }> {
  await requireAdmin();

  try {
    await db.request.update({
      where: { id: requestId },
      data: { adminNote: note.trim() || null },
    });
    revalidatePath(`/admin/requests/${requestId}`);
    return { success: true };
  } catch {
    return { error: "Failed to save note" };
  }
}
