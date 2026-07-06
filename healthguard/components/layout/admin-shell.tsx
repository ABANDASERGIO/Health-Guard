"use client";

import type { ReactNode } from "react";
import {
  Bell,
  Building2,
  LayoutDashboard,
  Settings,
  UserCircle2,
  Users,
  Stethoscope,
} from "lucide-react";
import { DashboardShell, type DashboardNavItem } from "@/components/layout/dashboard-shell";

const navItems: DashboardNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/admin/patients", label: "Patients", icon: Users },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/hospital-profile", label: "Hospital Profile", icon: Building2 },
  { href: "/admin/profile", label: "Profile", icon: UserCircle2 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <DashboardShell navItems={navItems} roleLabel="Hospital Administrator">
      {children}
    </DashboardShell>
  );
}
