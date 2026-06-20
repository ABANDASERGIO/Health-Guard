import type { ReactNode } from "react";
import { DoctorShell } from "@/components/layout/doctor-shell";

export default function DoctorLayout({ children }: { children: ReactNode }) {
  return <DoctorShell>{children}</DoctorShell>;
}
