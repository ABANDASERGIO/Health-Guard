"use client";

import { format, formatDistanceToNow } from "date-fns";
import { Calendar, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { EncryptionBanner } from "@/components/security/encryption-banner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { VitalsTrendChart } from "@/components/charts/vitals-trend-chart";
import type { ActivityLogEntry, VitalReading, AccessRequest } from "@/types";

import { useAuthStore } from "@/stores/auth-store";

type AccessRequestWithHospital = AccessRequest & { doctorHospital?: string };


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
  const [accessRequests, setAccessRequests] = useState<AccessRequestWithHospital[]>([]);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000 * 30);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadAccessRequests = async () => {
      if (!mounted) return;
      const { patientApi } = await import("@/lib/api-client");
      const res = await patientApi.getAccessRequests();
      if (res.success && Array.isArray(res.data)) {
        setAccessRequests(res.data as AccessRequestWithHospital[]);
      }
    };

    void loadAccessRequests();
    const t = window.setInterval(() => {
      void loadAccessRequests();
    }, 30000);

    return () => {
      mounted = false;
      window.clearInterval(t);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!mounted) return;

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
    };

    void load();
    const t = window.setInterval(() => {
      void load();
    }, 30000);

    return () => {
      mounted = false;
      window.clearInterval(t);
    };
  }, []);


  return (
    <div className="space-y-8">
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-muted-bg ring-1 ring-border">
              {user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatar}
                  alt={user?.name ? `${user.name} avatar` : "User avatar"}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={(e) => {
                    const el = e.currentTarget;
                    el.style.display = "none";
                  }}
                />
              ) : (
                <span className="text-xs font-semibold text-muted">{(user?.name || "P").slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            <span>
              Welcome back, {user?.name?.split(" ")[0] ?? "Patient"}
            </span>
          </div>
        }
        description={
          `Today is ${format(now, "EEEE, MMM d, yyyy")} · Your monitoring workspace updates automatically.`
        }
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
            <CardTitle>Protected vitals snapshot</CardTitle>
            <CardDescription>Secure trends from your latest measurements.</CardDescription>
          </CardHeader>
          <CardContent>
            {vitals.length === 0 ? (
              <p className="text-sm text-muted">No vitals recorded yet.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted">
                  Latest reading is shown in the vitals chart below.
                </p>
              </div>
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