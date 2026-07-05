 "use client";

import { useParams } from "next/navigation";
import { Calendar, ClipboardPlus, FileText, Pill, RefreshCw, FlaskConical, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { EncryptionBanner } from "@/components/security/encryption-banner";
import { VitalsTrendChart } from "@/components/charts/vitals-trend-chart";
import { AnalyticsBarChart } from "@/components/charts/analytics-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import AddPrescriptionForm from "./AddPrescriptionForm";

type PrescriptionItem = {
  id: string;
  title?: string;
  description?: string;
  drug?: string;
  dose?: string;
  sig?: string;
  refills?: number;
  expires?: string;
};

const adherence = [
  { name: "Week 1", value: 88 },
  { name: "Week 2", value: 92 },
  { name: "Week 3", value: 85 },
  { name: "Week 4", value: 90 },
];

type VitalSeries = {
  date: string;
  systolic: number;
  diastolic: number;
  hr?: number;
};

export default function DoctorMonitoringPage() {
  const params = useParams<{ patientId: string }>();
  const patientId = params.patientId;
  const [showAddPrescription, setShowAddPrescription] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<PrescriptionItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; prescriptionId?: string }>({ open: false });
  const [deletingPrescription, setDeletingPrescription] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);

  const [labs, setLabs] = useState<any[]>([]);
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [vitals, setVitals] = useState<VitalSeries[]>([]);

  const resolveDocumentUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return `${baseUrl.replace(/\/$/, "")}${url.startsWith("/") ? url : `/${url}`}`;
  };

  const openDocument = (url?: string) => {
    const resolved = resolveDocumentUrl(url);
    if (!resolved) return;
    window.open(resolved, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    (async () => {
      if (!patientId) return;
      const { doctorApi } = await import("@/lib/api-client");
      const res = await doctorApi.getMonitoringSessions(patientId);
      if (res.success && Array.isArray(res.data)) {
        const mapped = (res.data as any[]).map((v) => ({
          date: v.date,
          systolic: v.systolic ?? 0,
          diastolic: v.diastolic ?? 0,
          hr: v.heartRate ?? 0,
        }));
        setVitals(mapped);
      }

      // appointments (Step 1 wiring)
      const apptRes = await doctorApi.getDoctorAppointments(patientId);
      if (apptRes.success && Array.isArray(apptRes.data)) {
        setAppointments(apptRes.data);
      }

      // follow-ups (Step 3 wiring)
      const followRes = await doctorApi.getFollowUpPatients(patientId);
      if (followRes.success && Array.isArray(followRes.data)) {
        setFollowUps(followRes.data);
      }

      // prescriptions (Step 4 wiring)
      const presRes = await doctorApi.getActivePrescriptions(patientId);
      if (presRes.success && Array.isArray(presRes.data)) {
        setPrescriptions(presRes.data);
      }

      // documents (Step 5 wiring)
      const docsRes = await doctorApi.getNewPatientDocuments(patientId);
      if (docsRes.success && Array.isArray(docsRes.data)) {
        setDocuments(docsRes.data);
      }






    })();
  }, [patientId]);

  return (
    <div className="space-y-8">

      <PageHeader
        title="Patient monitoring"
        description={`Longitudinal review · cohort member ${patientId?.toUpperCase() ?? ""}`}
      />

      <EncryptionBanner variant="compact" />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Upcoming Appointments + Pending Laboratory Results */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-5 text-primary" />
                Upcoming Appointments
              </CardTitle>
              <CardDescription>Scheduled clinical visits for this patient.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Appointment statistics */}
              {(() => {
                const list = appointments ?? [];
                const counts = {
                  SCHEDULED: list.filter((a: any) => (a.status ?? "SCHEDULED") === "SCHEDULED").length,
                  COMPLETED: list.filter((a: any) => (a.status ?? "SCHEDULED") === "COMPLETED").length,
                  CANCELLED: list.filter((a: any) => (a.status ?? "SCHEDULED") === "CANCELLED").length,
                  MISSED: list.filter((a: any) => (a.status ?? "SCHEDULED") === "MISSED").length,
                };

                return (
                  <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-lg border bg-muted-bg/50 px-3 py-2">
                      <div className="text-xs text-muted">Scheduled</div>
                      <div className="text-lg font-semibold">{counts.SCHEDULED}</div>
                    </div>
                    <div className="rounded-lg border bg-muted-bg/50 px-3 py-2">
                      <div className="text-xs text-muted">Completed</div>
                      <div className="text-lg font-semibold">{counts.COMPLETED}</div>
                    </div>
                    <div className="rounded-lg border bg-muted-bg/50 px-3 py-2">
                      <div className="text-xs text-muted">Cancelled</div>
                      <div className="text-lg font-semibold">{counts.CANCELLED}</div>
                    </div>
                    <div className="rounded-lg border bg-muted-bg/50 px-3 py-2">
                      <div className="text-xs text-muted">Missed</div>
                      <div className="text-lg font-semibold">{counts.MISSED}</div>
                    </div>
                  </div>
                );
              })()}

              {(appointments ?? []).length === 0 ? (
                <p className="text-sm text-muted">No appointments found.</p>
              ) : (
                <ul className="space-y-3">
                  {(appointments ?? []).slice(0, 5).map((ap: any) => (
                    <li key={ap.id} className="rounded-lg border bg-card px-3 py-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-semibold">{ap.specialty || ap.appointmentType || "Appointment"}</div>

                        {/* Appointment status badge */}
                        <div className="flex items-center gap-2">
                          <Badge variant="primary" className="gap-1">
                            <span className="font-semibold">
                              {String(ap.status ?? ap.appointmentStatus ?? ap.state ?? "SCHEDULED").replace(/_/g, " ")}
                            </span>
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-1 text-xs text-muted">{ap.provider || "Provider"}</div>
                      <div className="mt-2 text-xs font-medium text-muted">
                        {ap.datetime ? new Date(ap.datetime).toLocaleString() : "—"}
                      </div>
                      <div className="mt-1 text-xs text-muted">{ap.location || "Location"}</div>

                      {/* Appointment status actions */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={async () => {
                            const { doctorApi } = await import("@/lib/api-client");
                            await doctorApi.updateAppointmentStatus(ap.id, "COMPLETED");
                            const apptRes = await doctorApi.getDoctorAppointments(patientId);
                            if (apptRes.success && Array.isArray(apptRes.data)) setAppointments(apptRes.data);
                          }}
                        >
                          Mark Completed
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={async () => {
                            const { doctorApi } = await import("@/lib/api-client");
                            await doctorApi.updateAppointmentStatus(ap.id, "CANCELLED");
                            const apptRes = await doctorApi.getDoctorAppointments(patientId);
                            if (apptRes.success && Array.isArray(apptRes.data)) setAppointments(apptRes.data);
                          }}
                        >
                          Cancel
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={async () => {
                            const { doctorApi } = await import("@/lib/api-client");
                            await doctorApi.updateAppointmentStatus(ap.id, "MISSED");
                            const apptRes = await doctorApi.getDoctorAppointments(patientId);
                            if (apptRes.success && Array.isArray(apptRes.data)) setAppointments(apptRes.data);
                          }}
                        >
                          Mark Missed
                        </Button>
                      </div>
                    </li>
                  ))}

                </ul>
              )}

            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="size-5 text-primary" />
                Pending Laboratory Results
              </CardTitle>
              <CardDescription>Lab work that still needs review.</CardDescription>
            </CardHeader>
            <CardContent>
              {appointments ? null : null}
              <ul className="space-y-2">
                {(labs ?? []).length === 0 ? (
                  <li className="text-sm text-muted">No pending lab results found.</li>
                ) : (
                  (labs ?? []).slice(0, 5).map((lab) => (
                    <li key={lab.id} className="rounded-lg border bg-card px-3 py-2">
                      <div className="text-sm font-semibold">{lab.title ?? lab.name ?? "Lab result"}</div>
                      <div className="text-xs text-muted">{new Date(lab.createdAt ?? lab.date ?? Date.now()).toLocaleString()}</div>
                    </li>
                  ))
                )}
              </ul>
            </CardContent>
          </Card>


          {/* Follow-up Patients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="size-5 text-primary" />
                Follow-up Patients
              </CardTitle>
              <CardDescription>Patients requiring additional review/next steps.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">Pending backend implementation. (No doctor API for follow-ups yet.)</p>
              {(followUps ?? []).length === 0 ? (
                <p className="text-sm text-muted">No follow-ups found.</p>
              ) : (
                <ul className="space-y-2">
                  {(followUps ?? []).slice(0, 5).map((p) => (
                    <li key={p.id} className="rounded-lg border bg-card px-3 py-2">
                      <div className="text-sm font-semibold">{p.name ?? "Patient"}</div>
                      <div className="text-xs text-muted">{p.email ?? ""}</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

        </div>


        {/* Right column: Active Prescriptions + New Patient Documents */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="size-5 text-primary" />
                Active Prescriptions
              </CardTitle>
              <CardDescription>Prescriptions issued by the doctor that are still active.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex items-center justify-between gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    setEditingPrescription(null);
                    setShowAddPrescription(true);
                  }}
                >
                  <span className="inline-flex items-center">+</span>
                  Add prescription
                </Button>
              </div>

              <Modal
                open={showAddPrescription}
                onClose={() => {
                  setShowAddPrescription(false);
                  setEditingPrescription(null);
                }}
                title={editingPrescription ? "Edit prescription" : "Add prescription"}
                description={editingPrescription ? "Update the prescription details below and save your changes." : "Create a new prescription for this patient. It will appear in their active prescriptions once saved."}
              >
                <AddPrescriptionForm
                  onCancel={() => {
                    setShowAddPrescription(false);
                    setEditingPrescription(null);
                  }}
                  onCreate={async (data) => {
                    const { doctorApi } = await import("@/lib/api-client");
                    if (editingPrescription?.id) {
                      await doctorApi.updatePrescription(patientId, editingPrescription.id, data);
                    } else {
                      await doctorApi.createPrescription(patientId, data);
                    }
                    const presRes = await doctorApi.getActivePrescriptions(patientId);
                    if (presRes.success && Array.isArray(presRes.data)) {
                      setPrescriptions(presRes.data as PrescriptionItem[]);
                    }
                    setShowAddPrescription(false);
                    setEditingPrescription(null);
                  }}
                  initialValues={editingPrescription ? {
                    title: editingPrescription.title ?? "",
                    description: editingPrescription.description ?? "",
                    drug: editingPrescription.drug ?? "",
                    dose: editingPrescription.dose ?? "",
                    sig: editingPrescription.sig ?? "",
                    refills: editingPrescription.refills ?? 0,
                    expires: editingPrescription.expires ? new Date(editingPrescription.expires).toISOString().slice(0, 10) : "",
                  } : undefined}
                  submitLabel={editingPrescription ? "Save changes" : "Create"}
                />
              </Modal>


              {(prescriptions ?? []).length === 0 ? (
                <p className="text-sm text-muted">No active prescriptions found.</p>
              ) : (
                <ul className="space-y-2">
                  {(prescriptions ?? []).slice(0, 5).map((rx) => (
                    <li key={rx.id} className="rounded-lg border bg-card px-3 py-2">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold">{rx.title?.trim() ? rx.title : (rx.drug ?? "Prescription")}</div>
                          {rx.description ? <div className="mt-1 text-xs text-muted">{rx.description}</div> : null}
                          <div className="mt-1 text-xs text-muted">
                            Drug: {rx.drug ?? "—"}
                          </div>
                          <div className="text-xs text-muted">
                            Expires: {rx.expires ? new Date(rx.expires).toLocaleDateString() : "—"}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" size="sm" variant="secondary" onClick={() => {
                            setEditingPrescription(rx);
                            setShowAddPrescription(true);
                          }}>
                            Edit
                          </Button>
                          <Button type="button" size="sm" variant="secondary" onClick={() => {
                            setConfirmDelete({ open: true, prescriptionId: rx.id });
                          }}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>




          <ConfirmDialog
            open={confirmDelete.open}
            title="Delete prescription?"
            description="This prescription will be removed from the patient’s active list. This action cannot be undone."
            confirmLabel="Yes, delete"
            cancelLabel="Cancel"
            confirmVariant="danger"
            loading={deletingPrescription}
            onConfirm={async () => {
              if (!confirmDelete.prescriptionId) return;
              setDeletingPrescription(true);
              try {
                const { doctorApi } = await import("@/lib/api-client");
                await doctorApi.deletePrescription(patientId, confirmDelete.prescriptionId);
                const presRes = await doctorApi.getActivePrescriptions(patientId);
                if (presRes.success && Array.isArray(presRes.data)) {
                  setPrescriptions(presRes.data as PrescriptionItem[]);
                }
              } finally {
                setDeletingPrescription(false);
                setConfirmDelete({ open: false });
              }
            }}
            onCancel={() => setConfirmDelete({ open: false })}
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5 text-primary" />
                New Patient Documents
              </CardTitle>
              <CardDescription>Recent uploads (lab reports, X-rays, referrals, prescriptions).</CardDescription>
            </CardHeader>
            <CardContent>
              {(documents ?? []).length === 0 ? (
                <p className="text-sm text-muted">No new documents found.</p>
              ) : (
                <ul className="space-y-2">
                  {(documents ?? []).slice(0, 5).map((d: any) => (
                    <li
                      key={d.id}
                      className={`rounded-lg border bg-card px-3 py-2 ${d.url ? "cursor-pointer transition hover:bg-muted-bg/50" : ""}`}
                      onClick={() => openDocument(d.url)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold">{d.name ?? "Document"}</div>
                          <div className="text-xs text-muted">
                            {d.createdAt ? new Date(d.createdAt).toLocaleString() : "—"}
                          </div>
                          {d.type ? <div className="mt-1 text-[11px] text-muted">{d.type}</div> : null}
                        </div>
                        {d.url ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDocument(d.url);
                            }}
                            className="shrink-0 rounded-full border border-border bg-muted-bg px-2.5 py-1 text-[10px] font-semibold text-primary transition hover:bg-primary/10"
                          >
                            View
                          </button>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>


          {/* Keep Doctor updates UI out of the monitoring dashboard for now */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardPlus className="size-5 text-primary" />
                Doctor updates
              </CardTitle>
              <CardDescription>Add diagnoses, Rx, and commentary.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dx">Diagnosis</Label>
                <Input id="dx" placeholder="ICD-10 · free text" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rx">Prescription</Label>
                <Input id="rx" placeholder="Drug · dose · SIG" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Doctor notes</Label>
                <Textarea id="notes" rows={5} placeholder="Structured note stored securely for the patient record." />
              </div>
              <Button type="button" className="w-full gap-2" disabled>
                <Pill className="size-4" />
                Save to chart (API not wired)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}