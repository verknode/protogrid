"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signUp, signIn } from "@/lib/auth-client";
import { recordLegalConsent, CURRENT_TERMS_VERSION, CURRENT_PRIVACY_VERSION } from "@/app/actions/recordConsent";
import Link from "next/link";

const schema = z
  .object({
    name: z.string().min(2, "At least 2 characters"),
    email: z.string().email("Invalid email"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
    legalConsent: z.literal(true, {
      error: "You must agree to the Terms and Privacy Policy",
    }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
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

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError(null);
    const result = await signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
    });
    if (result.error) {
      setServerError(result.error.message ?? "Registration failed");
      return;
    }
    await recordLegalConsent();
    router.push("/account");
    router.refresh();
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    await signIn.social({ provider: "google", callbackURL: "/account" });
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
        Create account
      </h1>
      <p className="font-sans text-[14px] text-lavender-smoke mb-8">
        Already have one?{" "}
        <Link
          href="/login"
          className="text-cold-pearl hover:text-white transition-colors duration-150"
        >
          Sign in
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
          <label className={labelClass}>Name</label>
          <input
            {...register("name")}
            type="text"
            autoComplete="name"
            placeholder="Your name"
            className={inputClass}
          />
          {errors.name && (
            <p className="mt-1.5 font-technical text-[11px] text-red-400">{errors.name.message}</p>
          )}
        </div>

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
            autoComplete="new-password"
            placeholder="Min. 8 chars, 1 uppercase, 1 number"
            className={inputClass}
          />
          {errors.password && (
            <p className="mt-1.5 font-technical text-[11px] text-red-400">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Confirm password</label>
          <input
            {...register("confirmPassword")}
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={inputClass}
          />
          {errors.confirmPassword && (
            <p className="mt-1.5 font-technical text-[11px] text-red-400">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Legal consent */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              {...register("legalConsent")}
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0 appearance-none border border-iris-dusk/50 rounded-sm bg-transparent checked:bg-cold-pearl checked:border-cold-pearl transition-colors duration-150 cursor-pointer relative
                after:content-[''] after:absolute after:inset-0 after:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22><path fill=%22%231e2028%22 d=%22M6.5 11.5L3 8l1-1 2.5 2.5 5-5 1 1z%22/></svg>')] after:bg-center after:bg-no-repeat after:opacity-0 checked:after:opacity-100"
            />
            <span className="font-sans text-[13px] leading-[1.5] text-lavender-smoke">
              I agree to the{" "}
              <Link href="/terms" target="_blank" className="text-cold-pearl hover:text-white transition-colors duration-150">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" className="text-cold-pearl hover:text-white transition-colors duration-150">
                Privacy Policy
              </Link>
              <span className="font-technical text-[10px] text-iris-dusk ml-1.5">
                v{CURRENT_TERMS_VERSION}
              </span>
            </span>
          </label>
          {errors.legalConsent && (
            <p className="mt-1.5 font-technical text-[11px] text-red-400 pl-7">{errors.legalConsent.message}</p>
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
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>
    </div>
  );
}
