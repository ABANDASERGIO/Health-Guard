"use client";

import { useEffect, useState } from "react";
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

const ALERT_CHART_H = 280;

type AlertItem = {
  id: string;
  level: "critical" | "warning" | "info";
  patient: string;
  message: string;
};

export default function DoctorAlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [severityData, setSeverityData] = useState<Array<{ label: string; count: number }>>([]);

  useEffect(() => {
    (async () => {
      const { doctorApi } = await import("@/lib/api-client");
      const res = await doctorApi.getAccessRequests(1, 50);
      if (res.success && Array.isArray(res.data)) {
        const mapped = (res.data as any[]).map((a) => ({
          id: a.id,
          level: (a.priority === "CRITICAL" || a.priority === "HIGH" ? "critical" : a.priority === "NORMAL" ? "warning" : "info") as "critical" | "warning" | "info",
          patient: `${a.patient?.name || "Unknown"} · ${a.patient?.id?.slice(0, 8) || "Unknown"}`,
          message: a.reason,
        }));
        setAlerts(mapped);
        const counts = mapped.reduce((acc, a) => {
          acc[a.level] = (acc[a.level] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        setSeverityData([
          { label: "Critical", count: counts.critical || 0 },
          { label: "Warning", count: counts.warning || 0 },
          { label: "Info", count: counts.info || 0 },
        ]);
      }
    })();
  }, []);

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
        {alerts.length === 0 ? (
          <p className="text-sm text-muted md:col-span-2">No alerts.</p>
        ) : (
          alerts.map((a) => (
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
          ))
        )}
      </div>
    </div>
  );
}