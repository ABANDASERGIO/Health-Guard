"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPasswordSchema } from "@/validations/auth";
import type { z } from "zod";

type FormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (_values: FormValues) => {
    await new Promise((r) => setTimeout(r, 600));
    setDone(true);
  };

  return (
    <AuthShell
      title="Recover account access"
      description="Password recovery flows through MFA-backed verification. You will receive a secure OTP to confirm ownership before resetting credentials."
    >
      {done ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-900 dark:text-emerald-100">
            If the email exists in our directory, recovery instructions and an OTP have been dispatched to your secure
            inbox.
          </div>
          <Link href="/auth/verify-otp" className="block">
            <Button variant="secondary" className="w-full" type="button">
              Continue to OTP verification
            </Button>
          </Link>
          <p className="text-center text-sm text-muted">
            <Link href="/auth/login" className="font-semibold text-accent hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      ) : (
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
          </div>
          <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
            Send recovery link & OTP
          </Button>
          <p className="text-center text-sm text-muted">
            Remembered your password?{" "}
            <Link href="/auth/login" className="font-semibold text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
