"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = async (_values: FormValues) => {
    await new Promise((r) => setTimeout(r, 500));
    router.push("/auth/reset-password");
  };

  return (
    <AuthShell
      title="Verify one-time passcode"
      description="Enter the six-digit OTP delivered to your verified phone or authenticator. Codes expire quickly to reduce replay risk."
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="rounded-2xl border border-border bg-muted-bg/60 px-4 py-3 text-sm text-muted">
          Demo OTP: use any six digits (for example{" "}
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
