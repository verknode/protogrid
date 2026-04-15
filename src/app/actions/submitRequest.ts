"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const fileSchema = z.object({
  name: z.string(),
  url:  z.string(),
  key:  z.string(),
  size: z.number().int().nonnegative(),
  type: z.string(),
});

const schema = z.object({
  name:       z.string().min(2),
  email:      z.string().email(),
  message:    z.string().min(10),
  dimensions: z.string().optional(),
  deadline:   z.string().optional(),
  files:      z.array(fileSchema).optional(),
});

export type SubmitRequestResult =
  | { success: true; id: string }
  | { error: string };

export async function submitRequest(
  data: unknown,
): Promise<SubmitRequestResult> {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    return { error: "Invalid form data. Please check all fields." };
  }

  let userId: string | undefined;
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user?.id) userId = session.user.id;
  } catch {
    // submit anonymously
  }

  try {
    const { files = [], ...fields } = parsed.data;
    const request = await db.request.create({
      data: {
        ...fields,
        ...(userId ? { userId } : {}),
        ...(files.length > 0
          ? { files: { create: files } }
          : {}),
      },
    });
    return { success: true, id: request.id };
  } catch {
    return { error: "Could not save your request. Please try again." };
  }
}
