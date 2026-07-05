"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { patientApi } from "@/lib/api-client";

type Prescription = {
  id: string;
  patientId: string;
  title?: string;
  description?: string;
  drug: string;
  dose: string;
  sig: string;
  refills: number;
  expires: string | Date;
};

export function ActivePrescriptionsCard() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  const load = async () => {
    const res = await patientApi.getActivePrescriptions();
    if (res.success && Array.isArray(res.data)) {
      setPrescriptions(res.data as Prescription[]);
    }
  };

  useEffect(() => {
    let mounted = true;
    void (async () => {
      if (!mounted) return;
      await load();
    })();

    const t = window.setInterval(() => {
      void (async () => {
        if (!mounted) return;
        await load();
      })();
    }, 30000);

    return () => {
      mounted = false;
      window.clearInterval(t);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Active prescriptions</CardTitle>
        <CardDescription>Prescriptions issued by your doctor that are still active.</CardDescription>
      </CardHeader>
      <CardContent>
        {prescriptions.length === 0 ? (
          <p className="text-sm text-muted">No active prescriptions found.</p>
        ) : (
          <ul className="space-y-2">
            {prescriptions.slice(0, 5).map((rx) => (
              <li key={rx.id} className="rounded-lg border bg-card px-3 py-2">
                <div className="text-sm font-semibold">{rx.title?.trim() ? rx.title : rx.drug}</div>
                {rx.description ? <div className="mt-1 text-xs text-muted">{rx.description}</div> : null}
                <div className="mt-1 text-xs text-muted">Drug: {rx.drug}</div>
                <div className="text-xs text-muted">Dose: {rx.dose}</div>
                <div className="text-xs text-muted">SIG: {rx.sig}</div>
                <div className="text-xs text-muted">
                  Expires: {rx.expires ? new Date(rx.expires).toLocaleDateString() : "—"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

