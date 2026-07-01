"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock } from "lucide-react";
import { EncryptionBanner } from "@/components/security/encryption-banner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";

export function StatusPageClient() {
  const params = useSearchParams();
  const state = params.get("state");

  const granted = state === "granted";
  const pending = !granted;


  return (
    <div className="space-y-8">
      <PageHeader
        title="Access approval status"
        description="Track OTP workflows from submission through temporary privilege activation."
      />

      <EncryptionBanner variant="compact" />

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            {granted ? (
              <CheckCircle2 className="size-10 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Clock className="size-10 text-amber-600 dark:text-amber-400" />
            )}
            <div>
              <CardTitle>{granted ? "Secure access granted" : "Awaiting patient decision"}</CardTitle>
              <CardDescription>
                {granted
                  ? "Session unlock expires automatically · all chart views emit audit events."
                  : "The patient will approve or reject the request. Notifications are sent to the doctor automatically."}
              </CardDescription>
            </div>
          </div>
          <Badge variant={granted ? "success" : "warning"}>{granted ? "Active session" : "Pending"}</Badge>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <LinkButton href="/doctor/monitoring/pat-001">Open patient monitoring</LinkButton>
          <LinkButton href="/doctor/dashboard" variant="outline">
            Return to dashboard
          </LinkButton>
        </CardContent>
      </Card>
    </div>
  );
}
