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
  title:      z.string().min(2, "Please add a project title").optional(),
  name:       z.string().min(2).optional(),
  email:      z.string().email().optional(),
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
  let sessionName: string | undefined;
  let sessionEmail: string | undefined;

  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user) {
      userId = session.user.id;
      sessionName = session.user.name;
      sessionEmail = session.user.email;
    }
  } catch {
    // submit anonymously
  }

  const { files = [], name, email, ...fields } = parsed.data;
  const finalName = name || sessionName;
  const finalEmail = email || sessionEmail;

  if (!finalName || !finalEmail) {
    return { error: "Name and email are required." };
  }

  try {
    const request = await db.request.create({
      data: {
        ...fields,
        name: finalName,
        email: finalEmail,
        ...(userId ? { userId } : {}),
        ...(files.length > 0 ? { files: { create: files } } : {}),
      },
    });
    return { success: true, id: request.id };
  } catch {
    return { error: "Could not save your request. Please try again." };
  }
}
