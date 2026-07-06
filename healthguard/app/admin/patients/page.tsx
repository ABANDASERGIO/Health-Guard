"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { EncryptionBanner } from "@/components/security/encryption-banner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { adminApi } from "@/lib/api-client";

type AdminPatient = {
  id: string;
  name: string;
  assignedDoctor: string;
  medicalDocuments: number;
  appointments: number;
  accessStatus: "Approved" | "Pending";
};

export default function HospitalAdminPatientsPage() {
  const [patients, setPatients] = useState<AdminPatient[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getPatients();
      if (response.success && Array.isArray(response.data)) {
        setPatients(response.data);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error("Failed to load hospital patients", error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    const interval = window.setInterval(fetchPatients, 120000);
    return () => window.clearInterval(interval);
  }, []);

  const filteredPatients = useMemo(() => {
    const q = query.toLowerCase().trim();
    return patients.filter((patient) => {
      const haystack = `${patient.name} ${patient.assignedDoctor} ${patient.accessStatus}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query, patients]);

  return (
    <div className="space-y-8">
      <PageHeader title="Patients" description="View patients with active access to doctors in this hospital." />
      <EncryptionBanner variant="compact" />

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle>Patients under hospital care</CardTitle>
            <CardDescription>
              Each entry shows the assigned doctor, document count, appointment count, and access status.
            </CardDescription>
            <p className="mt-2 text-xs text-muted">
              Live updates refresh every 2 munites. Last updated {lastUpdated || "—"}.
            </p>
          </div>
          <div className="flex w-full items-center gap-2 md:max-w-sm">
            <Search className="size-4 text-muted" />
            <Input placeholder="Search patients" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-muted-bg/80 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Assigned Doctor</th>
                <th className="px-4 py-3">Documents</th>
                <th className="px-4 py-3">Appointments</th>
                <th className="px-4 py-3">Access Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted">
                    Loading patients…
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted">
                    No patients match your search.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{patient.name}</td>
                    <td className="px-4 py-3 text-muted">{patient.assignedDoctor}</td>
                    <td className="px-4 py-3">{patient.medicalDocuments}</td>
                    <td className="px-4 py-3">{patient.appointments}</td>
                    <td className="px-4 py-3">
                      <Badge variant={patient.accessStatus === "Approved" ? "success" : "warning"}>
                        {patient.accessStatus}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
