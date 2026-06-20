"use client";

import { EncryptionBanner } from "@/components/security/encryption-banner";
import { AnalyticsBarChart } from "@/components/charts/analytics-bar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";
import { adminSummaryCards } from "@/mock-data/admin";

const growth = [
  { name: "Jan", value: 820 },
  { name: "Feb", value: 864 },
  { name: "Mar", value: 910 },
  { name: "Apr", value: 942 },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Enterprise overview"
        description="Aggregate utilization, workforce footprint, and security telemetry across the SPMS estate."
        actions={
          <LinkButton href="/admin/logs" variant="secondary">
            Open system logs
          </LinkButton>
        }
      />

      <EncryptionBanner variant="compact" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminSummaryCards.map((c) => (
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
        ))}
      </div>

      <AnalyticsBarChart title="Monthly active clinician sessions (000s)" data={growth} dataKey="value" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Access log summary</CardTitle>
            <CardDescription>Unauthorized attempts held at 0.02% after MFA enforcement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted">
            <p>Centralized audit streaming replays to SOC dashboards with immutable hashes (demo).</p>
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
            <Badge variant="warning">3 hospitals pending hardware tokens</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
