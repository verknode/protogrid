"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notifyAdminNewRequest, notifyClientRequestReceived } from "@/lib/email";
import { validateTurnstile } from "@/lib/turnstile";
import { rateLimit } from "@/lib/ratelimit";

const fileSchema = z.object({
  name: z.string(),
  url:  z.string(),
  key:  z.string(),
  size: z.number().int().nonnegative(),
  type: z.string(),
});

const schema = z.object({
  title:          z.string().min(2, "Please add a project title").optional(),
  name:           z.string().min(2).optional(),
  email:          z.string().email().optional(),
  message:        z.string().min(10),
  dimensions:     z.string().optional(),
  deadline:       z.string().optional(),
  budget:         z.string().optional(),
  files:          z.array(fileSchema).optional(),
  turnstileToken: z.string().optional(),
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

  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  // 5 submissions per IP per hour
  if (!rateLimit(`submitRequest:${ip}`, 5, 3600)) {
    return { error: "Too many requests. Please try again later." };
  }

  const valid = await validateTurnstile(parsed.data.turnstileToken, ip);
  if (!valid) {
    return { error: "Security check failed. Please reload and try again." };
  }

  let userId: string | undefined;
  let sessionName: string | undefined;
  let sessionEmail: string | undefined;

  try {
    const session = await auth.api.getSession({ headers: hdrs });
    if (session?.user) {
      userId = session.user.id;
      sessionName = session.user.name;
      sessionEmail = session.user.email;
    }
  } catch {
    // submit anonymously
  }

  const { files = [], name, email, turnstileToken: _token, ...fields } = parsed.data;
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

    // Fire-and-forget — never block the response
    notifyAdminNewRequest({
      name: finalName,
      email: finalEmail,
      title: fields.title,
      message: fields.message,
      budget: fields.budget,
      requestId: request.id,
    });
    notifyClientRequestReceived({
      to: finalEmail,
      clientName: finalName,
      title: fields.title,
      requestId: request.id,
    });

    return { success: true, id: request.id };
  } catch {
    return { error: "Could not save your request. Please try again." };
  }
}
