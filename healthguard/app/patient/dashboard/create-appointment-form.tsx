"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { infer as _infer } from "zod";
import { patientApi } from "@/lib/api-client";

const createAppointmentSchema = z.object({
  specialty: z.string().min(1, "Specialty is required"),
  provider: z.string().min(1, "Provider is required"),
  datetime: z.string().min(1, "Date/time is required"),
  location: z.string().min(1, "Location is required"),
  reason: z.string().min(1, "Reason is required"),
});

type FormValues = z.infer<typeof createAppointmentSchema>;

export function CreateAppointmentForm(props: {
  onCreated?: () => void;
  onCancel?: () => void;
}) {
  const { onCreated, onCancel } = props;
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: {
      specialty: "",
      provider: "",
      datetime: "",
      location: "",
      reason: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const res = await patientApi.createAppointment({
        specialty: values.specialty,
        provider: values.provider,
        datetime: values.datetime,
        location: values.location,
        reason: values.reason,
      });

      if (!res.success) {
        throw new Error(res.error || res.message || "Appointment creation failed");
      }

      onCreated?.();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Appointment creation failed");
    }
  };


  return (
    <Card className="rounded-xl border border-border bg-card p-4">
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <Label htmlFor="specialty">Specialty</Label>
          <Input id="specialty" {...register("specialty")} error={errors.specialty?.message} />
        </div>

        <div>
          <Label htmlFor="provider">Provider</Label>
          <Input id="provider" {...register("provider")} error={errors.provider?.message} />
        </div>

        <div>
          <Label htmlFor="datetime">Date & time</Label>
          <Input
            id="datetime"
            type="datetime-local"
            {...register("datetime")}
            error={errors.datetime?.message}
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" {...register("location")} error={errors.location?.message} />
        </div>

        <div>
          <Label htmlFor="reason">Reason</Label>
          <Input id="reason" {...register("reason")} error={errors.reason?.message} />
        </div>

        {serverError ? (
          <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{serverError}</div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Create appointment
          </Button>
        </div>
      </form>
    </Card>
  );
}

