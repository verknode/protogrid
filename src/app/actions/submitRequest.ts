"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const schema = z.object({
  name:       z.string().min(2),
  email:      z.string().email(),
  message:    z.string().min(10),
  dimensions: z.string().optional(),
  deadline:   z.string().optional(),
});

export type SubmitRequestResult =
  | { success: true }
  | { error: string };

export async function submitRequest(
  data: unknown
): Promise<SubmitRequestResult> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data. Please check all fields." };
  }

  // Attach to user account if signed in
  let userId: string | undefined;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user?.id) userId = session.user.id;
  } catch {
    // No session or DB unavailable — submit anonymously
  }

  try {
    await db.request.create({
      data: {
        name:       parsed.data.name,
        email:      parsed.data.email,
        message:    parsed.data.message,
        dimensions: parsed.data.dimensions,
        deadline:   parsed.data.deadline,
        ...(userId ? { userId } : {}),
      },
    });
    return { success: true };
  } catch {
    return { error: "Could not save your request. Please try again." };
  }
}
