"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Shield } from "lucide-react";
import { EncryptionBanner } from "@/components/security/encryption-banner";
import { VitalsTrendChart } from "@/components/charts/vitals-trend-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Textarea } from "@/components/ui/textarea";
import { vitalsSchema } from "@/validations/auth";
import type { z } from "zod";
import { vitalsHistory } from "@/mock-data/patient";

type FormValues = z.infer<typeof vitalsSchema>;

const chartSeries = [
  { date: "May 03", systolic: 132, diastolic: 86, hr: 76 },
  { date: "May 07", systolic: 128, diastolic: 82, hr: 72 },
  { date: "May 10", systolic: 130, diastolic: 84, hr: 74 },
];

export default function PatientMonitoringPage() {
  const [saved, setSaved] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(vitalsSchema),
    defaultValues: {
      temperature: "",
      systolic: "",
      diastolic: "",
      heartRate: "",
      weight: "",
      symptoms: "",
    },
  });

  const risk = useMemo(() => {
    const last = vitalsHistory[0];
    if (!last?.systolic) return "low";
    if (last.systolic >= 135) return "elevated";
    return "stable";
  }, []);

  const onSubmit = async (_data: FormValues) => {
    await new Promise((r) => setTimeout(r, 400));
    setSaved("Vitals encrypted and queued for clinician review.");
    reset();
    setTimeout(() => setSaved(null), 4000);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Health monitoring"
        description="Capture home readings with validation, visualize longitudinal trends, and surface automated risk cues."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Risk indicator</CardDescription>
            <CardTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="size-5 text-warning" />
              {risk === "elevated" ? "Elevated BP trend" : risk === "stable" ? "Stable vitals" : "Monitoring"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted">
              Automated rules highlight hypertension risk when systolic averages climb across readings.
            </p>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="size-5 text-primary" />
              Monitoring summary
            </CardTitle>
            <CardDescription>Encrypted buffers replicate to your audit trail within seconds.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="primary">AES-256 payload UI</Badge>
            <Badge variant="outline">PHI segmentation</Badge>
            <Badge variant="success">Patient-entered data</Badge>
          </CardContent>
        </Card>
      </div>

      <EncryptionBanner variant="compact" />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Log vitals</CardTitle>
            <CardDescription>Submit at least one measurement or symptom note.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature °C</Label>
                  <Input id="temperature" type="number" step="0.1" {...register("temperature")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight kg</Label>
                  <Input id="weight" type="number" step="0.1" {...register("weight")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="systolic">Systolic</Label>
                  <Input id="systolic" type="number" {...register("systolic")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diastolic">Diastolic</Label>
                  <Input id="diastolic" type="number" {...register("diastolic")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="heartRate">Heart rate</Label>
                <Input id="heartRate" type="number" {...register("heartRate")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="symptoms">Symptoms</Label>
                <Textarea id="symptoms" placeholder="Optional notes — encrypted at rest in production integrations." {...register("symptoms")} />
              </div>

              {errors.symptoms?.message ? (
                <p className="text-sm text-danger">{errors.symptoms.message}</p>
              ) : null}

              <Button type="submit" loading={isSubmitting} className="w-full">
                Submit encrypted vitals
              </Button>
              {saved ? <p className="text-center text-sm text-emerald-700 dark:text-emerald-300">{saved}</p> : null}
            </form>
          </CardContent>
        </Card>

        <VitalsTrendChart data={chartSeries} />
      </div>
    </div>
  );
}
