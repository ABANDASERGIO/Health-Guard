"use client";

import { format, formatDistanceToNow } from "date-fns";
import { AlertTriangle, Calendar, ClipboardList, FlaskConical, Pill, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { EncryptionBanner } from "@/components/security/encryption-banner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { VitalsTrendChart } from "@/components/charts/vitals-trend-chart";
import type { ActivityLogEntry, VitalReading } from "@/types";
import { useAuthStore } from "@/stores/auth-store";

type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  icon: "lab" | "rx" | "vitals";
};

type Appointment = {
  id: string;
  specialty: string;
  provider: string;
  datetime: string;
  location: string;
  encrypted: boolean;
};

export default function PatientDashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vitals, setVitals] = useState<VitalReading[]>([]);

  useEffect(() => {
    (async () => {
      const { patientApi } = await import("@/lib/api-client");
      const [vitalsRes, activitiesRes, appointmentsRes] = await Promise.all([
        patientApi.getVitals(1, 10),
        patientApi.getActivityLogs(1, 5),
        patientApi.getAppointments(1, 5),
      ]);

      if (vitalsRes.success && Array.isArray(vitalsRes.data)) {
        setVitals(vitalsRes.data as VitalReading[]);
      }

      if (activitiesRes.success && Array.isArray(activitiesRes.data)) {
        const mapped = (activitiesRes.data as ActivityLogEntry[]).map((a) => ({
          id: a.id,
          title: a.action,
          detail: a.resource,
          time: formatDistanceToNow(new Date(a.timestamp), { addSuffix: true }),
          icon: (a.action.includes("Lab") ? "lab" : a.action.includes("Prescription") || a.action.includes("Rx") ? "rx" : "vitals") as any,
        }));
        setActivities(mapped);
      }

      if (appointmentsRes.success && Array.isArray(appointmentsRes.data)) {
        const mapped = (appointmentsRes.data as any[]).map((a) => ({
          id: a.id,
          specialty: a.specialty || "Appointment",
          provider: a.provider || "Provider",
          datetime: a.datetime,
          location: a.location || "Location",
          encrypted: a.encrypted ?? true,
        }));
        setAppointments(mapped);
      }
    })();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "Patient"}`}
        description="Your monitoring workspace summarizes protected vitals, appointments, and clinician requests in one HIPAA-conscious dashboard."
        actions={
          <Badge variant="success" className="hidden sm:inline-flex">
            Session active
          </Badge>
        }
      />

      <EncryptionBanner />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent medical activity</CardTitle>
            <CardDescription>Latest verified updates across your care summary.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-sm text-muted">No recent activity.</p>
            ) : (
              activities.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 rounded-xl border border-border bg-muted-bg/40 p-4"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-card shadow-inner ring-1 ring-border">
                    {item.icon === "lab" ? (
                      <FlaskConical className="size-5 text-primary" />
                    ) : item.icon === "rx" ? (
                      <Pill className="size-5 text-accent" />
                    ) : (
                      <ClipboardList className="size-5 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{item.title}</p>
                      <Badge variant="outline">{item.time}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted">{item.detail}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5 text-primary" />
                Upcoming appointments
              </CardTitle>
              <CardDescription>Protected scheduling references.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {appointments.length === 0 ? (
                <p className="text-sm text-muted">No upcoming appointments.</p>
              ) : (
                appointments.map((ap) => (
                  <div key={ap.id} className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">{ap.specialty}</p>
                      {ap.encrypted ? (
                        <Badge variant="primary" className="gap-1">
                          <ShieldCheck className="size-3" /> Protected
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted">{ap.provider}</p>
                    <p className="mt-3 text-xs font-medium text-muted">
                      {format(new Date(ap.datetime), "EEEE, MMM d · h:mm a")}
                    </p>
                    <p className="mt-1 text-xs text-muted">{ap.location}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {vitals.length > 0 ? (
        <VitalsTrendChart data={vitals.map((v) => ({
          date: format(new Date(v.date), "MMM dd"),
          systolic: v.systolic ?? 0,
          diastolic: v.diastolic ?? 0,
          hr: v.heartRate,
        }))} />
      ) : null}
    </div>
  );
}