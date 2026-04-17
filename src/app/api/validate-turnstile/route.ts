import { NextRequest, NextResponse } from "next/server";
import { validateTurnstile } from "@/lib/turnstile";
import { rateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  // 20 Turnstile verifications per IP per 10 minutes
  if (!rateLimit(`turnstile:${ip}`, 20, 600)) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Try again later." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const token = typeof body.token === "string" ? body.token : null;

  if (!token) {
    return NextResponse.json(
      { success: false, error: "Missing token." },
      { status: 400 },
    );
  }

  const valid = await validateTurnstile(token, ip);
  if (!valid) {
    return NextResponse.json(
      { success: false, error: "Captcha verification failed. Please try again." },
      { status: 400 },
    );
  }

  return NextResponse.json({ success: true });
}
