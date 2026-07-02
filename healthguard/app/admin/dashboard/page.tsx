"use client";

import { useEffect, useState } from "react";
import { EncryptionBanner } from "@/components/security/encryption-banner";
import { AnalyticsBarChart } from "@/components/charts/analytics-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";

type SummaryCard = {
  label: string;
  value: string | number;
  trend: string;
  status: "success" | "warning" | "neutral";
};

const growth = [
  { name: "Jan", value: 820 },
  { name: "Feb", value: 864 },
  { name: "Mar", value: 910 },
  { name: "Apr", value: 942 },
];

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<SummaryCard[]>([]);

  useEffect(() => {
    (async () => {
      const { adminApi } = await import("@/lib/api-client");
      const res = await adminApi.getDashboardStats();
      if (res.success && Array.isArray(res.data)) {
        setSummary(res.data as SummaryCard[]);
      }
    })();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Enterprise overview"
        description="Aggregate utilization, workforce footprint, and security telemetry across the HealthGuard network."
        actions={
          <LinkButton href="/admin/logs" variant="secondary">
            Open system logs
          </LinkButton>
        }
      />

      <EncryptionBanner variant="compact" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summary.length === 0 ? (
          <p className="text-sm text-muted">No stats available.</p>
        ) : (
          summary.map((c) => (
            <Card key={c.label}>
              <CardHeader className="pb-2">
                <CardDescription>{c.label}</CardDescription>
                <CardTitle className="text-3xl">{c.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted">{c.trend}</p>
                <Badge variant={c.status === "success" ? "success" : c.status === "warning" ? "warning" : "outline"} className="mt-3">
                  Monitored
                </Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AnalyticsBarChart title="Monthly active clinician sessions (000s)" data={growth} dataKey="value" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Access log summary</CardTitle>
            <CardDescription>Unauthorized attempts held at 0.02% after MFA enforcement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted">
            <p>Centralized audit streams support review dashboards with traceable history (demo).</p>
            <Badge variant="primary">HIPAA-aligned control mapping</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Security monitoring widgets</CardTitle>
            <CardDescription>Live posture indicators refreshed every 60 seconds.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="success">Encryption coverage 100%</Badge>
            <Badge variant="outline">RBAC drift check OK</Badge>
            <Badge variant="warning">3 hospitals pending extra authentication</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}