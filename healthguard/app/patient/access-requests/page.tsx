"use client";

import { useMemo, useState } from "react";
import { KeyRound, ShieldCheck, ShieldOff } from "lucide-react";
import { EncryptionBanner } from "@/components/security/encryption-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import type { AccessRequest } from "@/types";
import { patientAccessRequests as initialRequests } from "@/mock-data/patient";

export default function PatientAccessRequestsPage() {
  const [requests, setRequests] = useState<AccessRequest[]>(initialRequests);

  const pending = useMemo(() => requests.filter((r) => r.status === "pending"), [requests]);

  const approve = (id: string) => {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "approved" as const, otp } : r))
    );
  };

  const reject = (id: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "rejected" as const } : r)));
  };

  const revoke = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Access requests"
        description="Approve clinician access to encrypted PHI, rotate OTP codes, and revoke temporary privileges instantly."
      />

      <EncryptionBanner variant="compact" />

      <Card>
        <CardHeader>
          <CardTitle>Secure access workflow</CardTitle>
          <CardDescription>
            Doctors initiate requests · You approve · OTP unlocks time-bound sessions · All actions audit-logged.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          {["Request", "Notify patient", "OTP verify", "Temporary access"].map((step, idx) => (
            <div key={step} className="rounded-xl border border-border bg-muted-bg/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Step {idx + 1}</p>
              <p className="mt-2 font-semibold">{step}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {requests.map((req) => (
          <Card key={req.id}>
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>{req.doctorName}</CardTitle>
                  <Badge
                    variant={
                      req.priority === "critical"
                        ? "danger"
                        : req.priority === "high"
                          ? "warning"
                          : "outline"
                    }
                  >
                    {req.priority}
                  </Badge>
                  <Badge
                    variant={
                      req.status === "approved"
                        ? "success"
                        : req.status === "rejected"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {req.status}
                  </Badge>
                </div>
                <CardDescription className="mt-2 max-w-3xl">{req.reason}</CardDescription>
                <p className="mt-3 text-xs text-muted">
                  Request ID {req.id} · Doctor ID {req.doctorId}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {req.status === "pending" ? (
                  <>
                    <Button type="button" onClick={() => approve(req.id)}>
                      <ShieldCheck className="size-4" /> Approve
                    </Button>
                    <Button type="button" variant="outline" onClick={() => reject(req.id)}>
                      <ShieldOff className="size-4" /> Reject
                    </Button>
                  </>
                ) : req.status === "approved" ? (
                  <>
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm">
                      <KeyRound className="size-4 text-primary" />
                      <span className="font-mono font-semibold">{req.otp ?? "Generating…"}</span>
                    </div>
                    <Button type="button" variant="danger" onClick={() => revoke(req.id)}>
                      Revoke access
                    </Button>
                  </>
                ) : (
                  <Badge variant="danger">Rejected · no PHI shared</Badge>
                )}
              </div>
            </CardHeader>
          </Card>
        ))}

        {pending.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted">
              No pending requests — outstanding approvals appear here with notification badges.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
