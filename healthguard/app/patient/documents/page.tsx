"use client";

import { useEffect, useState } from "react";
import { FileText, Image as ImageIcon, ShieldCheck, Sparkles, Upload, Trash } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type DocType = "pdf" | "image" | "lab" | "xray" | "prescription" | "referral";

type UploadDoc = {
  id: string;
  type: DocType;
  name: string;
  createdAt: string;
  url?: string;
  previewUrl?: string;
};

const typeMeta: Record<
  DocType,
  { label: string; icon: React.ReactNode; accept: string; description: string }
> = {
  pdf: {
    label: "PDF",
    icon: <FileText className="size-5" />,
    accept: "application/pdf",
    description: "Diagnosis timelines, reports, and structured documents.",
  },
  image: {
    label: "Images",
    icon: <ImageIcon className="size-5" />,
    accept: "image/*",
    description: "Scans and photos related to care documentation.",
  },
  lab: {
    label: "Laboratory Results",
    icon: <Sparkles className="size-5" />,
    accept: "application/pdf,image/*",
    description: "Labs and tests you want available for review.",
  },
  xray: {
    label: "X-rays",
    icon: <ImageIcon className="size-5" />,
    accept: "image/*",
    description: "Upload medical images for reference.",
  },
  prescription: {
    label: "Prescriptions",
    icon: <FileText className="size-5" />,
    accept: "application/pdf,image/*",
    description: "Medication instructions and prescriptions.",
  },
  referral: {
    label: "Referral Letters",
    icon: <ShieldCheck className="size-5" />,
    accept: "application/pdf,image/*",
    description: "Referrals to specialists and care coordination.",
  },
};

function formatDate(d: Date) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

export default function PatientDocumentsPage() {
  const [activeType, setActiveType] = useState<DocType>("pdf");
  const [uploading, setUploading] = useState(false);
  const [docs, setDocs] = useState<UploadDoc[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; documentId?: string }>({ open: false });

  useEffect(() => {
    (async () => {
      const { patientApi } = await import("@/lib/api-client");
      const res = await patientApi.getMedicalRecords();
      if (res.success && res.data) {
        const data = res.data as any;
        const mapped = (data.documents || []).map((d: any) => {
          const rawType = String(d.type || "pdf").toLowerCase();
          const normalizedType = (Object.keys(typeMeta) as DocType[]).includes(rawType as DocType)
            ? (rawType as DocType)
            : "pdf";

          return {
            id: d.id,
            type: normalizedType,
            name: d.name,
            createdAt: formatDate(new Date(d.createdAt || Date.now())),
            url: resolveDocumentUrl(d.url),
          };
        });
        setDocs(mapped);
      }
    })();
  }, []);

  const activeMeta = typeMeta[activeType];

  const onPickFile = async (file: File | null) => {
    if (!file) return;

    setUploading(true);

    try {
      const { patientApi } = await import("@/lib/api-client");
      const response = await patientApi.uploadDocument(file, activeType, file.name);

      if (response.success && response.data) {
        const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
        const next: UploadDoc = {
          id: response.data.id,
          type: response.data.type as DocType,
          name: response.data.name,
          createdAt: formatDate(new Date(response.data.createdAt)),
          url: response.data.url,
          previewUrl,
        };
        setDocs((prev) => [next, ...prev]);
      } else {
        console.error("Document upload failed", response.error || response.message);
      }
    } catch (error) {
      console.error("Document upload error", error);
    } finally {
      setUploading(false);
    }
  };

  const resolveDocumentUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return `${baseUrl.replace(/\/$/, "")}${url.startsWith("/") ? url : `/${url}`}`;
  };

  const onDeleteDocument = async (id: string) => {
    setConfirmDelete({ open: true, documentId: id });
  };

  const openDocument = (url?: string) => {
    const resolved = resolveDocumentUrl(url);
    if (!resolved) return;
    window.open(resolved, "_blank");
  };

  const cancelDeleteDocument = () => {
    setConfirmDelete({ open: false });
  };

  const confirmDeleteDocument = async () => {
    if (!confirmDelete.documentId) return;

    try {
      const { patientApi } = await import("@/lib/api-client");
      const response = await patientApi.deleteDocument(confirmDelete.documentId);
      if (response.success) {
        setDocs((prev) => prev.filter((doc) => doc.id !== confirmDelete.documentId));
      } else {
        console.error("Failed to delete document", response.error || response.message);
      }
    } catch (error) {
      console.error("Document delete error", error);
    } finally {
      setConfirmDelete({ open: false });
    }
  };

  const filteredDocs = docs.filter((d) => d.type === activeType);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Documents</h1>
          <p className="mt-1 text-sm text-muted">
            Upload care documents and review them in clean, previewable cards.
          </p>
        </div>

        <div className="hidden sm:block">
          <div className="rounded-2xl border border-border bg-card px-4 py-3">
            <p className="text-sm font-medium">Security</p>
            <p className="mt-1 text-xs text-muted">Protected and role-aware access in the platform.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Upload</h2>
          <p className="mt-1 text-sm text-muted">{activeMeta.description}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {(Object.keys(typeMeta) as DocType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveType(t)}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                  t === activeType
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card hover:bg-muted-bg"
                }`}
              >
                {typeMeta[t].label}
              </button>
            ))}
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold">Select {activeMeta.label}</label>
            <div className="mt-3 rounded-2xl border border-dashed border-border bg-muted-bg/30 p-5">
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Upload className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">Choose a file</p>
                    <p className="text-xs text-muted">Accepted: {activeMeta.accept}</p>
                  </div>
                </div>

                <div className="w-full sm:w-auto">
                  <input
                    className="hidden"
                    id="doc-upload"
                    type="file"
                    accept={activeMeta.accept}
                    onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                    disabled={uploading}
                  />
                  <label
                    htmlFor="doc-upload"
                    className={`inline-flex cursor-pointer items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold ${
                      uploading
                        ? "bg-muted-bg text-muted"
                        : "bg-primary text-primary-foreground hover:opacity-95"
                    }`}
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-muted-bg/40 p-4">
            <p className="text-sm font-semibold">Tip</p>
            <p className="mt-1 text-sm text-muted">
              After uploading, your document appears immediately in the list for review and sharing with your care team.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Uploaded documents</h2>
          <p className="mt-1 text-sm text-muted">Preview where possible. Filter by type using the Upload panel.</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {filteredDocs.length > 0 ? (
              filteredDocs.map((d) => (
                <div
                  key={d.id}
                  className="group overflow-hidden rounded-3xl border border-border bg-background shadow-sm"
                >
                  <div
                    className={`flex flex-col gap-4 ${d.url ? "cursor-pointer" : ""}`}
                    onClick={() => openDocument(d.url)}
                  >
                    <div className="flex items-start justify-between gap-4 p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          {typeMeta[d.type].icon}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{d.name}</p>
                          <p className="mt-1 text-xs text-muted">{d.createdAt}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {d.url ? (
                          <a
                            href={d.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-full border border-border bg-muted-bg px-3 py-1 text-[11px] font-semibold text-primary transition hover:bg-primary/10"
                          >
                            View
                          </a>
                        ) : null}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteDocument(d.id);
                          }}
                          className="inline-flex items-center gap-2 rounded-full border border-danger/30 bg-danger/10 px-3 py-1 text-[11px] font-semibold text-danger transition hover:bg-danger/20"
                        >
                          <Trash className="size-4" />
                          Delete
                        </button>
                      </div>
                    </div>

                    <span className="rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold text-primary mx-4">
                      {typeMeta[d.type].label}
                    </span>

                    {d.previewUrl ? (
                      <div className="relative">
                        <img
                          src={d.previewUrl}
                          alt={d.name}
                          className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>
                    ) : (
                      <div className="p-4">
                        <div className="rounded-2xl bg-muted-bg/50 px-4 py-3 text-xs text-muted">
                          Preview not available for this file type. Upload an image/PDF to show a preview.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="sm:col-span-2">
                <div className="rounded-3xl border border-border bg-muted-bg/30 p-6 text-sm text-muted">
                  No documents yet for {activeMeta.label}. Upload one on the left.
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={confirmDelete.open}
        title="Delete document"
        description="This action will permanently remove the selected document. Are you sure you want to continue?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        loading={false}
        onConfirm={confirmDeleteDocument}
        onCancel={cancelDeleteDocument}
      />
    </div>
  );
}