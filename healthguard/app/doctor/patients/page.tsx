"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, Search } from "lucide-react";
import { EncryptionBanner } from "@/components/security/encryption-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";

type PatientResult = {
  mrn: string;
  name: string;
  dob: string;
  sex: string;
  lastVisit: string;
  access: "none" | "approved_until";
  accessDetail?: string;
};

export default function DoctorPatientsPage() {
  const [q, setQ] = useState("");
  const [risk, setRisk] = useState<"all" | "needs-access">("all");
  const [patients, setPatients] = useState<PatientResult[]>([]);

  useEffect(() => {
    (async () => {
      const { doctorApi } = await import("@/lib/api-client");
      const res = await doctorApi.getPatients(1, 50);
      if (res.success && Array.isArray(res.data)) {
        const mapped = (res.data as any[]).map((p) => ({
          mrn: p.id?.slice(0, 8) ?? "Unknown",
          name: p.name,
          dob: p.dob || "Unknown",
          sex: p.sex || "Unknown",
          lastVisit: p.lastVisit || "Never",
          access: p.access || "none",
          accessDetail: p.accessDetail,
        }));
        setPatients(mapped);
      }
    })();
  }, []);

  const rows = useMemo(() => {
    return patients.filter((p) => {
      const match =
        p.name.toLowerCase().includes(q.toLowerCase()) || p.mrn.toLowerCase().includes(q.toLowerCase());
      const accessOk = risk === "all" ? true : p.access === "none";
      return match && accessOk;
    });
  }, [q, risk, patients]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Patient search"
        description="Locate cohort members, inspect disclosure-safe demographics, and initiate governed access requests."
      />

      <EncryptionBanner variant="compact" />

      <Card>
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle>Advanced search</CardTitle>
            <CardDescription>Filter by identifier · combine with access-state presets.</CardDescription>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 size-4 text-muted" />
              <Input className="pl-10" placeholder="MRN or patient name" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Button
              type="button"
              variant={risk === "needs-access" ? "primary" : "outline"}
              className="gap-2"
              onClick={() => setRisk((r) => (r === "all" ? "needs-access" : "all"))}
            >
              <Filter className="size-4" />
              {risk === "needs-access" ? "Showing: needs access" : "Filter: needs access"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-muted-bg/80 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">MRN</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">DOB</th>
                <th className="px-4 py-3">Last visit</th>
                <th className="px-4 py-3">Access</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.mrn} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs">{p.mrn}</td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-muted">{p.dob}</td>
                  <td className="px-4 py-3">{p.lastVisit}</td>
                  <td className="px-4 py-3">
                    {p.access === "none" ? (
                      <Badge variant="warning">No active grant</Badge>
                    ) : (
                      <Badge variant="success">Approved · {p.accessDetail}</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <LinkButton href="/doctor/access/request" size="sm" variant="outline">
                      Request access
                    </LinkButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-muted">No patients match your filters.</div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}