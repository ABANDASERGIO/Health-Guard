"use client";

import { format } from "date-fns";
import {
  AlertTriangle,
  Calendar,
  ClipboardList,
  FlaskConical,
  Pill,
  ShieldCheck,
} from "lucide-react";
import { EncryptionBanner } from "@/components/security/encryption-banner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { useAuthStore } from "@/stores/auth-store";
import {
  patientActivities,
  patientHealthAlerts,
  patientSummaryCards,
  upcomingAppointments,
} from "@/mock-data/patient";

export default function PatientDashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "Patient"}`}
        description="Your monitoring workspace summarizes encrypted vitals, appointments, and clinician requests in one HIPAA-conscious dashboard."
        actions={
          <Badge variant="success" className="hidden sm:inline-flex">
            JWT session active
          </Badge>
        }
      />

      <EncryptionBanner />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {patientSummaryCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="text-3xl">{card.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">{card.trend}</p>
              <Badge
                variant={
                  card.status === "success"
                    ? "success"
                    : card.status === "warning"
                      ? "warning"
                      : "outline"
                }
                className="mt-3"
              >
                {card.status === "success"
                  ? "Stable"
                  : card.status === "warning"
                    ? "Attention"
                    : "Monitoring"}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent medical activity</CardTitle>
            <CardDescription>Latest verified updates across your encrypted chart.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {patientActivities.map((item) => (
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
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-warning" />
                Health alerts
              </CardTitle>
              <CardDescription>Signals derived from your longitudinal vitals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {patientHealthAlerts.map((a) => (
                <div key={a.id} className="rounded-xl border border-border bg-muted-bg/40 p-3">
                  <p className="text-sm font-semibold">{a.title}</p>
                  <p className="mt-1 text-xs text-muted">{a.detail}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5 text-primary" />
                Upcoming appointments
              </CardTitle>
              <CardDescription>Encrypted scheduling references.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingAppointments.map((ap) => (
                <div key={ap.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{ap.specialty}</p>
                    {ap.encrypted ? (
                      <Badge variant="primary" className="gap-1">
                        <ShieldCheck className="size-3" /> Encrypted
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted">{ap.provider}</p>
                  <p className="mt-3 text-xs font-medium text-muted">
                    {format(new Date(ap.datetime), "EEEE, MMM d · h:mm a")}
                  </p>
                  <p className="mt-1 text-xs text-muted">{ap.location}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
