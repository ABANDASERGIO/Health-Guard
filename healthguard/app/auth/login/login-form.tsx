"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema } from "@/validations/auth";
import type { z } from "zod";
import { useAuthStore } from "@/stores/auth-store";
import type { UserRole } from "@/types";

type FormValues = z.infer<typeof loginSchema>;

const ROLE_HOME: Record<UserRole, string> = {
  patient: "/patient/dashboard",
  doctor: "/doctor/dashboard",
  admin: "/admin/dashboard",
};

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", role: "patient" },
  });

  const role = watch("role");

  const onSubmit = async (values: FormValues) => {
    clearError();
    try {
      await login(values.email, values.password, values.role);
      const from = params.get("from");
      if (from && from.startsWith("/")) {
        router.push(from);
        return;
      }
      router.push(ROLE_HOME[values.role]);
    } catch (err) {
      console.error("Login failed:", err);
      // Error is already set in the store
    }
  };

  return (
    <AuthShell
      title="Authenticate securely"
      description="Multi-role healthcare workspace with segmented dashboards, PHI-safe layouts, and audited session handling suitable for capstone demonstrations."
    >
      <div className="mb-8 flex items-center gap-3 rounded-2xl border border-border bg-muted-bg/60 px-4 py-3">
        <KeyRound className="size-5 text-primary" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-foreground">Real API Integration</p>
          <p className="text-xs text-muted">
            Connecting to backend API at {process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"} for authentication.
          </p>
        </div>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2">
          <Label>Role selection</Label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                ["patient", "Patient"],
                ["doctor", "Doctor"],
                ["admin", "Admin"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue("role", value, { shouldValidate: true })}
                className={`rounded-xl border px-2 py-3 text-center text-xs font-semibold transition-colors sm:text-sm ${
                  role === value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card hover:bg-muted-bg"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <input type="hidden" {...register("role")} />
          {errors.role ? <p className="text-xs text-danger">{errors.role.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" autoComplete="username" error={errors.email?.message} {...register("email")} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/auth/forgot-password" className="text-xs font-medium text-accent hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              error={errors.password?.message}
              className="pr-12"
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-2 top-[6px] rounded-lg p-2 text-muted hover:bg-muted-bg hover:text-foreground"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
        ) : null}

        <Button type="submit" className="w-full" size="lg" loading={isSubmitting || isLoading}>
          Sign in securely
        </Button>

        <p className="text-center text-sm text-muted">
          New to SPMS?{" "}
          <Link href="/auth/register" className="font-semibold text-accent hover:underline">
            Register an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
