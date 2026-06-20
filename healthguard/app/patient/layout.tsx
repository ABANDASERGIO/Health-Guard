import type { ReactNode } from "react";
import { PatientShell } from "@/components/layout/patient-shell";

export default function PatientLayout({ children }: { children: ReactNode }) {
  return <PatientShell>{children}</PatientShell>;
}
