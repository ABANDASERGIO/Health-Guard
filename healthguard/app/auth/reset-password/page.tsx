"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api-client";

const resetPasswordFormSchema = z
  .object({
    otp: z.string().length(6, "Enter the 6-digit code").regex(/^\d+$/, "Digits only"),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof resetPasswordFormSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { otp: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);

    const email = sessionStorage.getItem("recovery_email");
    if (!email) {
      router.push("/auth/forgot-password");
      return;
    }

    try {
      await authApi.resetPassword(email, values.otp, values.password);
      sessionStorage.removeItem("recovery_email");
      router.push("/auth/login?reset=success");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Password reset failed. Please try again.");
    }
  };

  return (
    <AuthShell
      title="Set a new password"
      description="Enter the code sent to your verified email, then choose a strong passphrase that you have not used previously with HealthGuard."
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2">
          <Label htmlFor="otp">Verification code</Label>
          <Input
            id="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="••••••"
            maxLength={6}
            className="tracking-[0.5em] font-mono text-lg"
            error={errors.otp?.message}
            {...register("otp")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
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
          Update credentials
        </Button>

        <p className="text-center text-sm text-muted">
          Return to{" "}
          <Link href="/auth/login" className="font-semibold text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
