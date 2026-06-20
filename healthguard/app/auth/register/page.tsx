"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema } from "@/validations/auth";
import type { z } from "zod";
import { authApi } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import type { UserRole } from "@/types";

type FormValues = z.infer<typeof registerSchema>;

const ROLE_HOME: Record<UserRole, string> = {
  patient: "/patient/dashboard",
  doctor: "/doctor/dashboard",
  admin: "/admin/dashboard",
};

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "patient",
      hospitalName: "",
    },
  });

  const role = watch("role");

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await authApi.register(
        values.email,
        values.password,
        values.name,
        values.role,
        values.role === "doctor" || values.role === "admin" ? values.hospitalName : undefined
      );
      await login(values.email, values.password, values.role);
      router.push(ROLE_HOME[values.role]);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    }
  };

  return (
    <AuthShell
      title="Create a verified profile"
      description="Provision patient, doctor, or administrator access with validated credentials and guided onboarding into the correct dashboard."
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2">
          <Label>Role</Label>
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
                className={`rounded-xl border px-2 py-3 text-center text-xs font-semibold sm:text-sm ${
                  role === value ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-muted-bg"
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
          <Label htmlFor="name">Full name</Label>
          <Input id="name" autoComplete="name" error={errors.name?.message} {...register("name")} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
        </div>

        {(role === "doctor" || role === "admin") ? (
          <div className="space-y-2">
            <Label htmlFor="hospitalName">Hospital name</Label>
            <Input
              id="hospitalName"
              autoComplete="organization"
              placeholder="e.g. Metro General Hospital"
              error={errors.hospitalName?.message}
              {...register("hospitalName")}
            />
          </div>
        ) : null}


        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              className="pr-12"
              error={errors.password?.message}
              {...register("password")}
            />
            <button
              type="button"
              className="absolute right-2 top-[6px] rounded-lg p-2 text-muted hover:bg-muted-bg"
              onClick={() => setShowPw((v) => !v)}
              aria-label="Toggle password visibility"
            >
              {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
        </div>

        {serverError ? (
          <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            {serverError}
          </div>
        ) : null}

        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Complete registration
        </Button>

        <p className="text-center text-sm text-muted">
          Already provisioned?{" "}
          <Link href="/auth/login" className="font-semibold text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
