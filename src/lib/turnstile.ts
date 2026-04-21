const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Validates a Cloudflare Turnstile token server-side.
 * Returns true in development when TURNSTILE_SECRET_KEY is not set.
 */
export async function validateTurnstile(token: string | undefined | null, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // Dev/unconfigured: skip validation
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.warn("[turnstile] TURNSTILE_SECRET_KEY not set in production — skipping CAPTCHA validation");
    }
    return true;
  }

  if (!token) return false;

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);

    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      signal: AbortSignal.timeout(5000),
    });

    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    // Network error — fail closed to prevent CAPTCHA bypass
    console.error("[turnstile] verification fetch failed — blocking request");
    return false;
  }
}
