"use client";

import { AlertTriangle, TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ClientChart } from "@/components/charts/client-chart";
import { EncryptionBanner } from "@/components/security/encryption-banner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { intelligentAlerts } from "@/mock-data/doctor";

const severityData = [
  { label: "Critical", count: 4 },
  { label: "Warning", count: 11 },
  { label: "Info", count: 26 },
];

const ALERT_CHART_H = 280;

export default function DoctorAlertsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Intelligent alert dashboard"
        description="Risk stratification surfaces abnormal vitals, adverse trends, and priority follow-ups."
      />

      <EncryptionBanner variant="compact" />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-primary" />
              Alert distribution
            </CardTitle>
            <CardDescription>Operational load vs severity buckets (rolling 24h).</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ClientChart height={ALERT_CHART_H}>
              <ResponsiveContainer width="100%" height={ALERT_CHART_H}>
                <BarChart data={severityData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="var(--muted)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--muted)" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, borderColor: "var(--border)", background: "var(--card)" }}
                  />
                  <Legend />
                  <Bar dataKey="count" name="Alerts" fill="var(--danger)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ClientChart>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-warning" />
              SLA posture
            </CardTitle>
            <CardDescription>Nursing callbacks within target for 92% of escalations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Badge variant="success">Escalation pathway healthy</Badge>
            <p className="text-sm text-muted">
              Critical alerts automatically page on-call cardiology when persistence exceeds configured thresholds.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {intelligentAlerts.map((a) => (
          <Card
            key={a.id}
            className={
              a.level === "critical"
                ? "border-red-500/40 bg-red-500/5"
                : "border-amber-500/35 bg-amber-500/5"
            }
          >
            <CardHeader>
              <Badge variant={a.level === "critical" ? "danger" : "warning"}>{a.level}</Badge>
              <CardTitle className="text-base">{a.patient}</CardTitle>
              <CardDescription>{a.message}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
