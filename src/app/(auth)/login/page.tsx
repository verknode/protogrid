"use client";

import { useState } from "react";
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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/account";
  const [serverError, setServerError] = useState<string | null>(null);

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

  return (
    <div>
      <Link href="/" className="font-technical text-[13px] tracking-[0.2em] text-cold-pearl mb-10 block hover:text-white transition-colors duration-150">
        PROTOGRID
      </Link>

      <h1 className="font-display font-bold text-[28px] leading-[1.1] tracking-[-0.01em] text-cold-pearl mb-2">
        Sign in
      </h1>
      <p className="font-sans text-[14px] text-lavender-smoke mb-8">
        No account?{" "}
        <Link href="/register" className="text-cold-pearl hover:text-white transition-colors duration-150">
          Create one
        </Link>
      </p>

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
    </div>
  );
}
