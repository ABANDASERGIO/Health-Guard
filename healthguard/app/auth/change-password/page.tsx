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

const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "At least 8 characters"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

type FormValues = z.infer<typeof changePasswordFormSchema>;

export default function ChangePasswordPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);

    try {
      await authApi.changePassword(values.currentPassword, values.newPassword, values.confirmNewPassword);
      router.push("/auth/login?changed=success");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Password change failed. Please try again.");
    }
  };

  return (
    <AuthShell
      title="Change your password"
      description="Enter your current password and choose a new one."
    >
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current password</Label>
          <Input
            id="currentPassword"
            type={showPw ? "text" : "password"}
            error={errors.currentPassword?.message}
            {...register("currentPassword")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">New password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showPw ? "text" : "password"}
              className="pr-12"
              error={errors.newPassword?.message}
              {...register("newPassword")}
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
          <Label htmlFor="confirmNewPassword">Confirm new password</Label>
          <Input
            id="confirmNewPassword"
            type={showPw ? "text" : "password"}
            error={errors.confirmNewPassword?.message}
            {...register("confirmNewPassword")}
          />
        </div>

        {serverError ? (
          <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            {serverError}
          </div>
        ) : null}

        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Change password
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

