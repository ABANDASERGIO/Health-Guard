"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EncryptionBanner } from "@/components/security/encryption-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { accessRequestSchema } from "@/validations/auth";
import type { z } from "zod";

type FormValues = z.infer<typeof accessRequestSchema>;

export default function DoctorAccessRequestPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(accessRequestSchema),
    defaultValues: {
      patientId: "MRN-88421",
      reason: "",
      priority: "normal",
      notes: "",
    },
  });

  const onSubmit = async (_values: FormValues) => {
    await new Promise((r) => setTimeout(r, 600));
    router.push("/doctor/access/otp?preview=1");
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Access request"
        description="Structured justification captures medical necessity for patient-side approval and OTP verification."
      />

      <EncryptionBanner variant="compact" />

      <Card>
        <CardHeader>
          <CardTitle>Request encrypted chart access</CardTitle>
          <CardDescription>Minimum necessary doctrine · auto-logged to compliance exports.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="patientId">Patient identifier</Label>
              <Input id="patientId" placeholder="MRN-#####" error={errors.patientId?.message} {...register("patientId")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="reason">Reason for access</Label>
              <Textarea id="reason" rows={4} error={errors.reason?.message} {...register("reason")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select id="priority" error={errors.priority?.message} {...register("priority")}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Notes / comments</Label>
              <Textarea id="notes" rows={3} {...register("notes")} />
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-3">
              <Button type="submit" loading={isSubmitting}>
                Submit request
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
