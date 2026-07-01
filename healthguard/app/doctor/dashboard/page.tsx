"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, ShieldCheck, Sparkles, Users } from "lucide-react";
import { EncryptionBanner } from "@/components/security/encryption-banner";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/link-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

type SummaryCard = {
  label: string;
  value: string | number;
  trend: string;
  status: "success" | "warning" | "danger" | "neutral";
};

type PatientPreview = {
  id: string;
  mrn: string;
  name: string;
  risk: "low" | "moderate" | "high";
  lastVitals: string;
  alert: boolean;
};

type RecentActivity = {
  id: string;
  title: string;
  detail: string;
  time: string;
};

type IntelligentAlert = {
  id: string;
  level: "critical" | "warning";
  patient: string;
  message: string;
};

export default function DoctorDashboardPage() {
  const [summary, setSummary] = useState<SummaryCard[]>([]);
  const [patients, setPatients] = useState<PatientPreview[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [alerts, setAlerts] = useState<IntelligentAlert[]>([]);

  useEffect(() => {
    (async () => {
      const { doctorApi } = await import("@/lib/api-client");
      const [patientsRes, alertsRes] = await Promise.all([
        doctorApi.getPatients(1, 10),
        doctorApi.getAccessRequests(1, 20),
      ]);

      if (patientsRes.success && Array.isArray(patientsRes.data)) {
        const mapped = (patientsRes.data as any[]).map((p) => ({
          id: p.id,
          mrn: p.mrn || p.id.slice(0, 8),
          name: p.name,
          risk: p.risk || "moderate",
          lastVitals: p.lastVitals || "No vitals recorded",
          alert: p.alert || false,
        }));
        setPatients(mapped);
        setSummary([{ label: "Assigned patients", value: mapped.length, trend: "Active patients", status: "neutral" }]);
      }

      if (alertsRes.success && Array.isArray(alertsRes.data)) {
        const mapped = (alertsRes.data as any[]).map((a) => ({
          id: a.id,
          level: (a.priority === "CRITICAL" || a.priority === "HIGH" ? "critical" : "warning") as "critical" | "warning",
          patient: `${a.patient?.name || "Patient"} · ${a.patient?.id?.slice(0, 8) || "Unknown"}`,
          message: a.reason,
        }));
        setAlerts(mapped);
      }
    })();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Clinical command center"
        description="Prioritized roster insights, secure access telemetry, and escalation-ready intelligence for assigned populations."
        actions={<LinkButton href="/doctor/access/request" variant="secondary">New access request</LinkButton>}
      />

      <EncryptionBanner variant="compact" />

      <Card className="border-primary/25 bg-gradient-to-r from-primary/5 via-card to-accent-soft/30">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Sparkles className="size-6" />
            </span>
            <div>
              <p className="font-semibold text-foreground">AI Clinical Assistant</p>
              <p className="mt-1 max-w-xl text-sm text-muted">
                Chat about assigned patients, draft documentation, and review cohort insights — separate from patient AI
                conversations.
              </p>
            </div>
          </div>
          <LinkButton href="/doctor/ai-assistant" className="shrink-0">
            Open assistant
          </LinkButton>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.length === 0 ? (
          <p className="text-sm text-muted">No summary data.</p>
        ) : (
          summary.map((c) => (
            <Card key={c.label}>
              <CardHeader className="pb-2">
                <CardDescription>{c.label}</CardDescription>
                <CardTitle className="text-3xl">{c.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted">{c.trend}</p>
                <Badge
                  variant={
                    c.status === "danger"
                      ? "danger"
                      : c.status === "warning"
                          ? "warning"
                          : c.status === "success"
                            ? "success"
                            : "outline"
                  }
                  className="mt-3"
                >
                  Live sync
                </Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Assigned patients</CardTitle>
              <CardDescription>Risk-aware roster with latest vitals snapshot.</CardDescription>
            </div>
            <LinkButton href="/doctor/patients" variant="outline" size="sm">
              Open search
            </LinkButton>
          </CardHeader>
          <CardContent className="space-y-3">
            {patients.length === 0 ? (
              <p className="text-sm text-muted">No patients assigned.</p>
            ) : (
              patients.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-muted-bg/40 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{p.name}</p>
                      <Badge variant="outline">{p.mrn}</Badge>
                      <Badge variant={p.risk === "high" ? "danger" : p.risk === "moderate" ? "warning" : "success"}>
                        {p.risk} risk
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted">{p.lastVitals}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.alert ? (
                      <Badge variant="danger" className="gap-1">
                        <AlertTriangle className="size-3" /> Escalation
                      </Badge>
                    ) : (
                      <Badge variant="success">Stable</Badge>
                    )}
                    <LinkButton href={`/doctor/monitoring/${p.id}`} size="sm" variant="secondary">
                      Monitor
                    </LinkButton>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
            <CardDescription>Doctor actions attributed to your credentials.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted">No recent activity.</p>
            ) : (
              recentActivity.map((a) => (
                <div key={a.id} className="rounded-xl border border-border p-3">
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-sm text-muted">{a.detail}</p>
                  <p className="mt-2 text-xs text-muted">{a.time}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary" />
              Intelligent alert dashboard
            </CardTitle>
            <CardDescription>Machine-ranked escalations derived from monitoring feeds.</CardDescription>
          </div>
          <LinkButton href="/doctor/alerts" variant="outline">
            View alert workspace
          </LinkButton>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {alerts.length === 0 ? (
            <p className="text-sm text-muted md:col-span-2">No alerts.</p>
          ) : (
            alerts.map((a) => (
              <div
                key={a.id}
                className={`rounded-2xl border p-4 ${
                  a.level === "critical"
                    ? "border-red-500/40 bg-red-500/10"
                    : "border-amber-500/35 bg-amber-500/10"
                }`}
              >
                <Badge variant={a.level === "critical" ? "danger" : "warning"}>{a.level}</Badge>
                <p className="mt-3 font-semibold">{a.patient}</p>
                <p className="mt-2 text-sm text-muted">{a.message}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5" />
            Access request tracking
          </CardTitle>
          <CardDescription>Verification workflows mirror patient approvals — track status centrally.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <LinkButton href="/doctor/access/request">Compose request</LinkButton>
          <LinkButton href="/doctor/access/otp" variant="outline">
            Verify code
          </LinkButton>
          <LinkButton href="/doctor/access/status" variant="secondary">
            Approval status
          </LinkButton>
        </CardContent>
      </Card>
    </div>
  );
}