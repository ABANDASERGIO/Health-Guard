"use client";

import { format } from "date-fns";
import { ChevronDown, FileText, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
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
import type { VitalReading } from "@/types";

type MedicalHistoryItem = {
  id: string;
  date: string;
  event: string;
  facility: string;
};

type Diagnosis = {
  code: string;
  name: string;
  status: string;
  since?: string;
};

type Prescription = {
  drug: string;
  dose: string;
  sig: string;
  refills: number;
  expires: string;
};

type Document = {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  protected: boolean;
};

type DoctorNote = {
  id: string;
  author: string;
  date: string;
  note: string;
  encrypted?: boolean;
};

const HR_CHART_H = 240;

export default function PatientRecordsPage() {
  const [expanded, setExpanded] = useState<string | null>("notes");
  const [vitals, setVitals] = useState<VitalReading[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryItem[]>([]);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [doctorNotes, setDoctorNotes] = useState<DoctorNote[]>([]);

  useEffect(() => {
    (async () => {
      const { patientApi } = await import("@/lib/api-client");
      const [vitalsRes, recordsRes] = await Promise.all([
        patientApi.getVitals(1, 20),
        patientApi.getMedicalRecords(1, 50),
      ]);

      if (vitalsRes.success && Array.isArray(vitalsRes.data)) {
        setVitals(vitalsRes.data as VitalReading[]);
      }

      if (recordsRes.success && recordsRes.data) {
        const data = recordsRes.data as any;
        setMedicalHistory(data.medicalHistory || []);
        setDiagnoses(data.diagnoses || []);
        setPrescriptions(data.prescriptions || []);
        setDocuments(data.documents || []);
        setDoctorNotes(data.doctorNotes || []);
      }
    })();
  }, []);

  const chartData = vitals.map((v) => ({
    date: format(new Date(v.date), "MMM d"),
    hr: v.heartRate,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Medical records"
        description="Structured PHI with encrypted artifact labeling, longitudinal vitals, and clinician commentary gated behind approved access."
      />
      <EncryptionBanner variant="compact" />

      <Card>
        <CardHeader>
          <CardTitle>Vitals history</CardTitle>
          <CardDescription>Trend visualization for heart rate alongside tabular vitals.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8 lg:grid-cols-2">
          {vitals.length > 0 ? (
            <ClientChart height={HR_CHART_H}>
              <ResponsiveContainer width="100%" height={HR_CHART_H}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="hr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="var(--muted)" domain={[60, "auto"]} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, borderColor: "var(--border)", background: "var(--card)" }}
                  />
                  <Area type="monotone" dataKey="hr" stroke="#2563eb" fillOpacity={1} fill="url(#hr)" name="Heart rate" />
                </AreaChart>
              </ResponsiveContainer>
            </ClientChart>
          ) : (
            <p className="text-sm text-muted">No vitals recorded.</p>
          )}
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted-bg/80 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Temp °C</th>
                  <th className="px-4 py-3">BP</th>
                  <th className="px-4 py-3">HR</th>
                  <th className="px-4 py-3">Wt kg</th>
                </tr>
              </thead>
              <tbody>
                {vitals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-muted">No vitals data.</td>
                  </tr>
                ) : (
                  vitals.map((row) => (
                    <tr key={row.id} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{row.date}</td>
                      <td className="px-4 py-3">{row.temperature}</td>
                      <td className="px-4 py-3">
                        {row.systolic}/{row.diastolic}
                      </td>
                      <td className="px-4 py-3">{row.heartRate}</td>
                      <td className="px-4 py-3">{row.weight}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Medical history</CardTitle>
            <CardDescription>Major encounters with provenance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {medicalHistory.length === 0 ? (
              <p className="text-sm text-muted">No medical history recorded.</p>
            ) : (
              medicalHistory.map((m) => (
                <div key={m.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{m.event}</p>
                    <Badge variant="outline">{m.date}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted">{m.facility}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diagnoses</CardTitle>
            <CardDescription>Problem list · ICD-10 examples.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted-bg/80 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Condition</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {diagnoses.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-muted">No diagnoses.</td>
                  </tr>
                ) : (
                  diagnoses.map((d) => (
                    <tr key={d.code} className="border-t border-border">
                      <td className="px-4 py-3 font-mono text-xs">{d.code}</td>
                      <td className="px-4 py-3">{d.name}</td>
                      <td className="px-4 py-3">
                        <Badge variant="primary">{d.status}</Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prescriptions</CardTitle>
            <CardDescription>Active medication therapy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {prescriptions.length === 0 ? (
              <p className="text-sm text-muted">No prescriptions.</p>
            ) : (
              prescriptions.map((p) => (
                <div key={p.drug} className="rounded-xl border border-border bg-muted-bg/40 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold">
                      {p.drug} · {p.dose}
                    </p>
                    <Badge variant="outline">{p.sig}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    Refills {p.refills} · Expires {p.expires}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uploaded documents</CardTitle>
            <CardDescription>Encrypted artifacts at rest.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {documents.length === 0 ? (
              <p className="text-sm text-muted">No documents uploaded.</p>
            ) : (
              documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 size-5 text-primary" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-xs text-muted">
                        {doc.type} · Uploaded {doc.uploadedAt}
                      </p>
                    </div>
                  </div>
                  {doc.protected ? (
                    <Badge variant="success" className="gap-1">
                      <Lock className="size-3" /> PHI
                    </Badge>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <button
          type="button"
          className="w-full text-left"
          onClick={() => setExpanded((e) => (e === "notes" ? null : "notes"))}
        >
          <CardHeader className="cursor-pointer">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Doctor notes</CardTitle>
                <CardDescription>Expandable encrypted commentary.</CardDescription>
              </div>
              <ChevronDown
                className={`size-5 shrink-0 transition-transform ${expanded === "notes" ? "rotate-180" : ""}`}
              />
            </div>
          </CardHeader>
        </button>
        {expanded === "notes" ? (
          <CardContent className="space-y-4 border-t border-border pt-4">
            {doctorNotes.length === 0 ? (
              <p className="text-sm text-muted">No doctor notes.</p>
            ) : (
              doctorNotes.map((n) => (
                <div key={n.id} className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{n.author}</p>
                    <Badge variant="outline">{n.date}</Badge>
                    {n.encrypted ? (
                      <Badge variant="success" className="gap-1">
                        <Lock className="size-3" /> Encrypted note
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm text-muted">{n.note}</p>
                </div>
              ))
            )}
          </CardContent>
        ) : null}
      </Card>
    </div>
  );
}