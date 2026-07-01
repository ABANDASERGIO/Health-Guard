"use client";

import { useParams } from "next/navigation";
import { ClipboardPlus, Pill } from "lucide-react";
import { useEffect, useState } from "react";
import { EncryptionBanner } from "@/components/security/encryption-banner";
import { VitalsTrendChart } from "@/components/charts/vitals-trend-chart";
import { AnalyticsBarChart } from "@/components/charts/analytics-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Textarea } from "@/components/ui/textarea";

const adherence = [
  { name: "Week 1", value: 88 },
  { name: "Week 2", value: 92 },
  { name: "Week 3", value: 85 },
  { name: "Week 4", value: 90 },
];

type VitalSeries = {
  date: string;
  systolic: number;
  diastolic: number;
  hr?: number;
};

export default function DoctorMonitoringPage() {
  const params = useParams<{ patientId: string }>();
  const patientId = params.patientId;
  const [vitals, setVitals] = useState<VitalSeries[]>([]);

  useEffect(() => {
    (async () => {
      if (!patientId) return;
      const { doctorApi } = await import("@/lib/api-client");
      const res = await doctorApi.getMonitoringSessions(patientId);
      if (res.success && Array.isArray(res.data)) {
        const mapped = (res.data as any[]).map((v) => ({
          date: v.date,
          systolic: v.systolic ?? 0,
          diastolic: v.diastolic ?? 0,
          hr: v.heartRate ?? 0,
        }));
        setVitals(mapped);
      }
    })();
  }, [patientId]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Patient monitoring"
        description={`Encrypted longitudinal review · cohort member ${patientId?.toUpperCase() ?? ""}`}
      />

      <EncryptionBanner variant="compact" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Vitals & engagement</CardTitle>
            <CardDescription>Dual charts highlight physiological trend vs adherence proxies.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8">
            {vitals.length > 0 ? (
              <VitalsTrendChart data={vitals} />
            ) : (
              <p className="text-sm text-muted">No vitals recorded for this patient.</p>
            )}
            <AnalyticsBarChart title="Therapy adherence index" data={adherence} dataKey="value" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardPlus className="size-5 text-primary" />
              Doctor updates
            </CardTitle>
            <CardDescription>Add encrypted diagnoses, Rx, and commentary.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dx">Diagnosis</Label>
              <Input id="dx" placeholder="ICD-10 · free text" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rx">Prescription</Label>
              <Input id="rx" placeholder="Drug · dose · SIG" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Doctor notes</Label>
              <Textarea id="notes" rows={5} placeholder="Structured note stored as PHI · encrypted at rest." />
            </div>
            <Button type="button" className="w-full gap-2">
              <Pill className="size-4" />
              Save to encrypted chart
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}