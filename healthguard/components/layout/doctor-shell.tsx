"use client";

import type { ReactNode } from "react";
import {
  AlertTriangle,
  Bell,
  KeyRound,
  LayoutDashboard,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";
import { DashboardShell, type DashboardNavItem } from "@/components/layout/dashboard-shell";

const navItems: DashboardNavItem[] = [
  { href: "/doctor/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/doctor/notifications", label: "Notifications", icon: Bell },
  { href: "/doctor/patients", label: "Patient search", icon: Users },
  { href: "/doctor/access/request", label: "Access requests", icon: KeyRound },
  { href: "/doctor/alerts", label: "Doctor alerts", icon: AlertTriangle },
  { href: "/doctor/monitoring/pat-001", label: "Patient monitoring", icon: Stethoscope },
  { href: "/doctor/ai-assistant", label: "AI Clinical Assistant", icon: Sparkles },
];

export function DoctorShell({ children }: { children: ReactNode }) {
  return (
    <DashboardShell navItems={navItems} roleLabel="Doctor workspace">
      {children}
    </DashboardShell>
  );
}
