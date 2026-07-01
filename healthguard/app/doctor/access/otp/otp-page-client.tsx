"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { EncryptionBanner } from "@/components/security/encryption-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { otpSchema } from "@/validations/auth";
import type { z } from "zod";

type FormValues = z.infer<typeof otpSchema>;

export function OtpPageClient() {
  const router = useRouter();
  const params = useSearchParams();
  const preview = params.get("preview");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  const onSubmit = async (_values: FormValues) => {
    // Doctor access requests do not require an OTP from the doctor.
    // Patient approval/rejection drives the notification and the final access state.
    router.push("/doctor/access/status?state=pending");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="OTP verification"
        description="Enter the patient-provided one-time password to unlock a time-scoped PHI session."
      />

      <EncryptionBanner variant="compact" />

      {preview ? (
        <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm text-muted">
          Preview mode: submit any six digits to simulate successful verification.
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-5 text-primary" />
            Challenge-response
          </CardTitle>
          <CardDescription>OTP rotates after each approval · attempts audit-logged.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="max-w-md space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="code">Patient OTP</Label>
              <Input
                id="code"
                inputMode="numeric"
                maxLength={6}
                className="font-mono tracking-[0.4em]"
                error={errors.code?.message}
                {...register("code")}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="submit" loading={isSubmitting}>
                Verify & unlock session
              </Button>
              <Badge variant="outline">Temporary elevate · auto-expire</Badge>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
