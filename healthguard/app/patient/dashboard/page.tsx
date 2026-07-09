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


import { CreateAppointmentForm } from "./create-appointment-form";
import { ActivePrescriptionsCard } from "./ActivePrescriptionsCard";
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
  const [showCreate, setShowCreate] = useState(false);


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
        title={"Patient monitoring"}

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
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5 text-primary" />
                Upcoming appointments
              </CardTitle>
              <CardDescription>Protected scheduling references.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between gap-3 rounded-xl border border-border bg-muted-bg/40 p-4">
                <div>
                  <p className="text-sm font-semibold">Appointments</p>
                  <p className="mt-1 text-xs text-muted">Create a new appointment request .</p>
                </div>

                <button
                  type="button"
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                  onClick={() => {
                    setShowCreate((v) => !v);
                  }}
                >
                  Create appointment
                </button>

                {showCreate ? (
                  <button
                    type="button"
                    className="ml-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted-bg"
                    onClick={() => setShowCreate(false)}
                  >
                    Cancel
                  </button>
                ) : null}
              </div>


              {showCreate ? (
                <CreateAppointmentForm
                  onCancel={() => setShowCreate(false)}
                  onCreated={() => {
                    setShowCreate(false);
                    // Reload appointments on success
                    void (async () => {
                      const { patientApi } = await import("@/lib/api-client");
                      const res = await patientApi.getAppointments(1, 5);
                      if (res.success && Array.isArray(res.data)) {
                        const mapped = (res.data as any[]).map((a) => ({
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
                  }}
                />
              ) : appointments.length === 0 ? (
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

      {/* Active prescriptions (doctor -> patient) */}
      <div className="lg:mt-2">
        <ActivePrescriptionsCard />
      </div>

    </div>
  );
}
