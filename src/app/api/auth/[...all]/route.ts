import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { rateLimit } from "@/lib/ratelimit";
import { headers } from "next/headers";

const { GET, POST: authPOST } = toNextJsHandler(auth);

export { GET };

export async function POST(req: Request) {
  const url = new URL(req.url);

  if (url.pathname.endsWith("/sign-in/email")) {
    const hdrs = await headers();
    const ip =
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      hdrs.get("x-real-ip") ??
      "unknown";

    // 10 attempts per 15 min per IP
    if (!rateLimit(`login:ip:${ip}`, 10, 900)) {
      return new Response(
        JSON.stringify({ message: "Too many login attempts. Please wait 15 minutes." }),
        { status: 429, headers: { "Content-Type": "application/json" } },
      );
    }

    // 5 attempts per 15 min per email
    try {
      const body = await req.clone().json() as { email?: string };
      if (body.email) {
        const emailKey = `login:email:${body.email.toLowerCase()}`;
        if (!rateLimit(emailKey, 5, 900)) {
          return new Response(
            JSON.stringify({ message: "Too many login attempts for this email. Please wait 15 minutes." }),
            { status: 429, headers: { "Content-Type": "application/json" } },
          );
        }
      }
    } catch {
      // body parse failed — let auth handle it
    }
  }

  return authPOST(req);
}
