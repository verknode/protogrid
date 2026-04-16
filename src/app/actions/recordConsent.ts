"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/** Current versions — bump when legal text changes */
export const CURRENT_TERMS_VERSION = "1.0";
export const CURRENT_PRIVACY_VERSION = "1.0";

export async function recordLegalConsent(): Promise<
  { success: true } | { error: string }
> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Not authenticated" };

  const hdrs = await headers();
  const ip = hdrs.get("x-forwarded-for") ?? hdrs.get("x-real-ip") ?? null;
  const ua = hdrs.get("user-agent") ?? null;

  try {
    await db.legalConsent.create({
      data: {
        userId: session.user.id,
        termsVersion: CURRENT_TERMS_VERSION,
        privacyVersion: CURRENT_PRIVACY_VERSION,
        ipAddress: ip,
        userAgent: ua,
      },
    });
    return { success: true };
  } catch {
    return { error: "Failed to record consent" };
  }
}
