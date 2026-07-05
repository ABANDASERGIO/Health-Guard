"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AddPrescriptionForm({
  onCancel,
  onCreate,
  title = "Add prescription",
  description = "Enter the medication details below and submit to add it to the patient’s active prescriptions.",
  initialValues,
  submitLabel = "Create",
}: {
  onCancel: () => void;
  onCreate: (data: {
    title: string;
    description: string;
    drug: string;
    dose: string;
    sig: string;
    refills: number;
    expires: string;
  }) => Promise<void> | void;
  title?: string;
  description?: string;
  initialValues?: {
    title?: string;
    description?: string;
    drug?: string;
    dose?: string;
    sig?: string;
    refills?: number;
    expires?: string;
  };
  submitLabel?: string;
}) {
  const getDefaultExpires = () => {
    const d = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return d.toISOString().slice(0, 10);
  };

  const [drug, setDrug] = useState(initialValues?.drug ?? "");
  const [dose, setDose] = useState(initialValues?.dose ?? "");
  const [sig, setSig] = useState(initialValues?.sig ?? "");
  const [refills, setRefills] = useState<number>(initialValues?.refills ?? 0);
  const [titleValue, setTitleValue] = useState(initialValues?.title ?? "");
  const [descriptionValue, setDescriptionValue] = useState(initialValues?.description ?? "");
  const [expires, setExpires] = useState<string>(initialValues?.expires ?? getDefaultExpires());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialValues) {
      setDrug("");
      setDose("");
      setSig("");
      setRefills(0);
      setTitleValue("");
      setDescriptionValue("");
      setExpires(getDefaultExpires());
      return;
    }

    setDrug(initialValues.drug ?? "");
    setDose(initialValues.dose ?? "");
    setSig(initialValues.sig ?? "");
    setRefills(initialValues.refills ?? 0);
    setTitleValue(initialValues.title ?? "");
    setDescriptionValue(initialValues.description ?? "");
    setExpires(initialValues.expires ?? getDefaultExpires());
  }, [initialValues]);

  return (
    <Card className="mt-3">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={titleValue} onChange={(e) => setTitleValue(e.target.value)} placeholder="e.g. Antibiotic plan" />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={descriptionValue} onChange={(e) => setDescriptionValue(e.target.value)} placeholder="e.g. Use as directed for the full course." rows={3} />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="drug">Drug</Label>
            <Input id="drug" value={drug} onChange={(e) => setDrug(e.target.value)} placeholder="e.g. Amoxicillin" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dose">Dose</Label>
            <Input id="dose" value={dose} onChange={(e) => setDose(e.target.value)} placeholder="e.g. 500mg" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sig">SIG</Label>
            <Input id="sig" value={sig} onChange={(e) => setSig(e.target.value)} placeholder="e.g. Take one tablet daily" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="refills">Refills</Label>
            <Input
              id="refills"
              type="number"
              min={0}
              value={String(refills)}
              onChange={(e) => setRefills(Math.max(0, Number(e.target.value || 0)))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expires">Expires</Label>
            <Input id="expires" type="date" value={expires} onChange={(e) => setExpires(e.target.value)} />
          </div>
        </div>

        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={async () => {
              setError(null);
              if (!titleValue.trim()) return setError("Title is required");
              if (!drug.trim()) return setError("Drug is required");
              if (!dose.trim()) return setError("Dose is required");
              if (!sig.trim()) return setError("SIG is required");
              if (!expires) return setError("Expires date is required");

              setSubmitting(true);
              try {
                // Convert YYYY-MM-DD into ISO string (end of day UTC is fine for expiry gating)
                const expiresIso = new Date(`${expires}T00:00:00.000Z`).toISOString();

                await onCreate({
                  title: titleValue.trim(),
                  description: descriptionValue.trim(),
                  drug: drug.trim(),
                  dose: dose.trim(),
                  sig: sig.trim(),
                  refills: Number.isFinite(refills) ? refills : 0,
                  expires: expiresIso,
                });
              } catch (e: any) {
                setError(e?.message || "Failed to create prescription");
              } finally {
                setSubmitting(false);
              }
            }}
            disabled={submitting}
          >
            {submitting ? "Saving..." : submitLabel}
          </Button>

          <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

