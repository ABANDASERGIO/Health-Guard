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
import { resetPasswordSchema } from "@/validations/auth";
import type { z } from "zod";

type FormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (_values: FormValues) => {
    await new Promise((r) => setTimeout(r, 550));
    router.push("/auth/login?reset=success");
  };

  return (
    <AuthShell
      title="Set a new password"
      description="Choose a strong passphrase that you have not used previously with SPMS. Credential rotation is tracked for compliance reporting."
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
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
