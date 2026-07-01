"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { otpSchema } from "@/validations/auth";
import type { z } from "zod";

type FormValues = z.infer<typeof otpSchema>;

export default function VerifyOtpPage() {

  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);

    const email = sessionStorage.getItem("recovery_email");
    if (!email) {
      router.push("/auth/forgot-password");
      return;
    }

    try {
      const response = await (await import("@/lib/api-client")).authApi.verifyPasswordResetOtp(email, values.code);
      if (!response.success) {
        // Keep user on page; backend returns statusCode/message
        return;
      }

      router.push("/auth/reset-password");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Verification failed. Please try again.");
    }
  };


  return (
    <AuthShell
      title="Confirm verification code"
      description="Enter the six-digit code sent to your email. Codes expire quickly to reduce reuse risk."
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="rounded-2xl border border-border bg-muted-bg/60 px-4 py-3 text-sm text-muted">
          Demo code: use any six digits (for example{" "}
          <span className="font-mono font-semibold text-foreground">482913</span>) to advance the workflow.
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Authentication code</Label>
          <Input
            id="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="••••••"
            maxLength={6}
            className="tracking-[0.5em] font-mono text-lg"
            error={errors.code?.message}
            {...register("code")}
          />
        </div>

        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Verify & continue
        </Button>

        {serverError ? (
          <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            {serverError}
          </div>
        ) : null}

        <p className="text-center text-sm text-muted">
          Wrong channel?{" "}
          <Link href="/auth/forgot-password" className="font-semibold text-accent hover:underline">
            Restart recovery
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
