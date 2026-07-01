"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

type PatientOption = {
  id: string;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
};

export default function DoctorAccessRequestPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(accessRequestSchema),
    defaultValues: {
      patientId: "",
      reason: "",
      priority: "normal",
      notes: "",
    },
  });

  const selectedPatientId = watch("patientId");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { doctorApi } = await import("@/lib/api-client");
        const res = await doctorApi.getPatients();
        if (!mounted) return;

        const list = Array.isArray(res.data) ? (res.data as PatientOption[]) : [];
        setPatients(list);

        // Auto-select the first patient to avoid blank submit.
        if (list.length > 0) {
          setValue("patientId", list[0].id, { shouldValidate: true });
        }
      } catch (err) {
        if (!mounted) return;
        setServerError(err instanceof Error ? err.message : "Failed to load patients.");
      } finally {
        if (!mounted) return;
        setLoadingPatients(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [setValue]);

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const { doctorApi } = await import("@/lib/api-client");
      await doctorApi.requestAccess(values.patientId, values.reason, values.priority);
      router.push("/doctor/access/status?state=pending");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Access request failed.");
    }
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
          <form className="grid gap-6 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="patientId">Patient</Label>
              <Select
                id="patientId"
                error={errors.patientId?.message}
                value={selectedPatientId}
                onChange={(e) => setValue("patientId", e.target.value, { shouldValidate: true })}
                disabled={loadingPatients || patients.length === 0}
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name ? `${p.name}` : p.email ? p.email : p.id}
                  </option>
                ))}
              </Select>
              {loadingPatients ? (
                <p className="text-xs text-muted">Loading patients…</p>
              ) : patients.length === 0 ? (
                <p className="text-xs text-muted">No patients available.</p>
              ) : null}
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
              <Button type="submit" loading={isSubmitting} disabled={loadingPatients}>
                Submit request
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>

            {serverError ? (
              <div className="md:col-span-2 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
                {serverError}
              </div>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

