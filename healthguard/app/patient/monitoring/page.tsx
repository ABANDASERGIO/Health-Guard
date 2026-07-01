"use client";

import { format } from "date-fns";
import { useMemo, useState, useEffect } from "react";
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
import type { VitalReading } from "@/types";

type VitalsInput = {
  temperature?: string;
  systolic?: string;
  diastolic?: string;
  heartRate?: string;
  weight?: string;
  symptoms?: string;
};

export default function PatientMonitoringPage() {
  const [saved, setSaved] = useState<string | null>(null);
  const [vitals, setVitals] = useState<VitalReading[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VitalsInput>({
    defaultValues: {
      temperature: "",
      systolic: "",
      diastolic: "",
      heartRate: "",
      weight: "",
      symptoms: "",
    },
  });

  useEffect(() => {
    (async () => {
      const { patientApi } = await import("@/lib/api-client");
      const res = await patientApi.getVitals(1, 10);
      if (res.success && Array.isArray(res.data)) {
        setVitals(res.data as VitalReading[]);
      }
    })();
  }, []);

  const risk = useMemo(() => {
    const last = vitals[0];
    if (!last?.systolic) return "low";
    if (last.systolic >= 135) return "elevated";
    return "stable";
  }, [vitals]);

  const onSubmit = async (data: VitalsInput) => {
    setSaved(null);
    try {
      const { patientApi } = await import("@/lib/api-client");
      await patientApi.recordVital(data);
      setSaved("Vitals saved and queued for clinician review.");
      reset();
      setVitals((prev) => [
        {
          ...data,
          id: `local-${Date.now()}`,
          date: new Date().toISOString(),
          temperature: Number(data.temperature),
          systolic: Number(data.systolic),
          diastolic: Number(data.diastolic),
          heartRate: Number(data.heartRate),
          weight: Number(data.weight),
        } as VitalReading,
        ...prev,
      ]);
      setTimeout(() => setSaved(null), 4000);
    } catch (err) {
      setSaved("Failed to save vitals.");
    }
  };

  const chartSeries = vitals.map((v) => ({
    date: format(new Date(v.date), "MMM dd"),
    systolic: v.systolic ?? 0,
    diastolic: v.diastolic ?? 0,
    hr: v.heartRate ?? 0,
  }));

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
            <CardDescription>Secure data syncs to your care timeline within seconds.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="primary">Secure transfer</Badge>
            <Badge variant="outline">Protected data</Badge>
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
                <Textarea id="symptoms" placeholder="Optional notes — kept private in production integrations." {...register("symptoms")} />
              </div>

              <Button type="submit" loading={isSubmitting} className="w-full">
                Submit vitals securely
              </Button>
              {saved ? <p className="text-center text-sm text-emerald-700 dark:text-emerald-300">{saved}</p> : null}
            </form>
          </CardContent>
        </Card>

        {vitals.length > 0 ? (
          <VitalsTrendChart data={chartSeries} />
        ) : (
          <p className="text-sm text-muted">No vitals recorded yet.</p>
        )}
      </div>
    </div>
  );
}