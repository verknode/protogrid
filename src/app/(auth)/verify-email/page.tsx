"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleResend() {
    if (!email) return;
    setStatus("sending");
    try {
      await authClient.sendVerificationEmail({
        email,
        callbackURL: "/account",
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <Link
        href="/"
        className="font-technical text-[13px] tracking-[0.2em] text-cold-pearl mb-10 block hover:text-white transition-colors duration-150"
      >
        PROTOGRID
      </Link>

      <h1 className="font-display font-bold text-[28px] leading-[1.1] tracking-[-0.01em] text-cold-pearl mb-2">
        Check your inbox
      </h1>
      <p className="font-sans text-[14px] text-lavender-smoke mb-6">
        We sent a verification link to{" "}
        {email ? (
          <span className="text-cold-pearl">{email}</span>
        ) : (
          "your email address"
        )}
        . Click the link to activate your account.
      </p>
      <p className="font-sans text-[13px] text-iris-dusk mb-8">
        Didn&apos;t receive it? Check your spam folder, or resend below.
      </p>

      {email && (
        <button
          type="button"
          onClick={handleResend}
          disabled={status === "sending" || status === "sent"}
          className="h-12 px-6 border border-iris-dusk/40 text-lavender-smoke text-[13px] font-technical tracking-[0.06em] rounded-sm hover:border-lavender-smoke hover:text-cold-pearl disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        >
          {status === "sending"
            ? "Sending…"
            : status === "sent"
              ? "Email sent"
              : "Resend verification email"}
        </button>
      )}

      {status === "error" && (
        <p className="mt-3 font-technical text-[11px] text-red-400">
          Failed to resend. Try again or{" "}
          <Link href="/login" className="text-lavender-smoke hover:text-cold-pearl transition-colors duration-150">
            sign in
          </Link>
          .
        </p>
      )}

      <p className="font-sans text-[13px] text-iris-dusk mt-8">
        Already verified?{" "}
        <Link
          href="/login"
          className="text-lavender-smoke hover:text-cold-pearl transition-colors duration-150"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
