"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Required"),
});

type FormData = z.infer<typeof schema>;

const inputClass =
  "w-full h-12 px-4 bg-transparent border border-iris-dusk/40 rounded-sm text-[14px] text-cold-pearl placeholder:text-lavender-smoke/50 focus:outline-none focus:border-lavender-smoke transition-colors duration-150";

const labelClass =
  "block font-technical text-[11px] tracking-[0.12em] uppercase text-lavender-smoke mb-2";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/account";
  const [serverError, setServerError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError(null);
    const result = await signIn.email({
      email: data.email,
      password: data.password,
    });
    if (result.error) {
      setServerError(result.error.message ?? "Invalid email or password");
      return;
    }
    router.push(from.startsWith("/") ? from : "/account");
    router.refresh();
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    await signIn.social({
      provider: "google",
      callbackURL: from.startsWith("/") ? from : "/account",
    });
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
        Sign in
      </h1>
      <p className="font-sans text-[14px] text-lavender-smoke mb-8">
        No account?{" "}
        <Link
          href="/register"
          className="text-cold-pearl hover:text-white transition-colors duration-150"
        >
          Create one
        </Link>
      </p>

      {/* Google */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading}
        className="w-full h-12 flex items-center justify-center gap-3 border border-iris-dusk/40 rounded-sm font-technical text-[13px] tracking-[0.04em] text-lavender-smoke hover:border-lavender-smoke/60 hover:text-cold-pearl disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 mb-5"
      >
        <GoogleIcon />
        {googleLoading ? "Redirecting…" : "Continue with Google"}
      </button>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-iris-dusk/20" />
        <span className="font-technical text-[10px] tracking-[0.1em] uppercase text-iris-dusk">or</span>
        <div className="flex-1 h-px bg-iris-dusk/20" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label className={labelClass}>Email</label>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={inputClass}
          />
          {errors.email && (
            <p className="mt-1.5 font-technical text-[11px] text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Password</label>
          <input
            {...register("password")}
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className={inputClass}
          />
          {errors.password && (
            <p className="mt-1.5 font-technical text-[11px] text-red-400">{errors.password.message}</p>
          )}
        </div>

        {serverError && (
          <p className="font-technical text-[11px] text-red-400 pt-1">{serverError}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-cold-pearl text-ink-shadow text-[13px] font-technical tracking-[0.06em] rounded-sm hover:bg-[#D8D9DC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 mt-2"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="font-sans text-[12px] text-iris-dusk mt-6 text-center leading-[1.5]">
        By signing in, you agree to our{" "}
        <Link href="/terms" className="text-lavender-smoke hover:text-cold-pearl transition-colors duration-150">Terms</Link>
        {" "}and{" "}
        <Link href="/privacy" className="text-lavender-smoke hover:text-cold-pearl transition-colors duration-150">Privacy Policy</Link>.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
