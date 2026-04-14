"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signUp } from "@/lib/auth-client";
import Link from "next/link";

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

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
    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div>
      {/* Logo */}
      <p className="font-technical text-[13px] tracking-[0.2em] text-cold-pearl mb-10">
        PROTOGRID
      </p>

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

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Name */}
        <div>
          <label className="block font-technical text-[11px] tracking-[0.12em] uppercase text-lavender-smoke mb-2">
            Name
          </label>
          <input
            {...register("name")}
            type="text"
            autoComplete="name"
            placeholder="Your name"
            className="w-full h-12 px-4 bg-transparent border border-iris-dusk/40 rounded-sm text-[14px] text-cold-pearl placeholder:text-lavender-smoke/50 focus:outline-none focus:border-lavender-smoke transition-colors duration-150"
          />
          {errors.name && (
            <p className="mt-1.5 font-technical text-[11px] text-red-400">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block font-technical text-[11px] tracking-[0.12em] uppercase text-lavender-smoke mb-2">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full h-12 px-4 bg-transparent border border-iris-dusk/40 rounded-sm text-[14px] text-cold-pearl placeholder:text-lavender-smoke/50 focus:outline-none focus:border-lavender-smoke transition-colors duration-150"
          />
          {errors.email && (
            <p className="mt-1.5 font-technical text-[11px] text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block font-technical text-[11px] tracking-[0.12em] uppercase text-lavender-smoke mb-2">
            Password
          </label>
          <input
            {...register("password")}
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full h-12 px-4 bg-transparent border border-iris-dusk/40 rounded-sm text-[14px] text-cold-pearl placeholder:text-lavender-smoke/50 focus:outline-none focus:border-lavender-smoke transition-colors duration-150"
          />
          {errors.password && (
            <p className="mt-1.5 font-technical text-[11px] text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label className="block font-technical text-[11px] tracking-[0.12em] uppercase text-lavender-smoke mb-2">
            Confirm password
          </label>
          <input
            {...register("confirmPassword")}
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full h-12 px-4 bg-transparent border border-iris-dusk/40 rounded-sm text-[14px] text-cold-pearl placeholder:text-lavender-smoke/50 focus:outline-none focus:border-lavender-smoke transition-colors duration-150"
          />
          {errors.confirmPassword && (
            <p className="mt-1.5 font-technical text-[11px] text-red-400">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Server error */}
        {serverError && (
          <p className="font-technical text-[11px] text-red-400 pt-1">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 bg-cold-pearl text-ink-shadow text-[13px] font-technical tracking-[0.06em] rounded-sm hover:bg-[#D8D9DC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 mt-2"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
    </div>
  );
}
