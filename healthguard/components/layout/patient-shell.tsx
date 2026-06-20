"use client";

import type { ReactNode } from "react";
import {
  Activity,
  Bell,
  FileStack,
  HeartPulse,
  LayoutDashboard,
  ScrollText,
  ShieldCheck,
  Sparkles,
  User,
  Settings,
} from "lucide-react";
import { DashboardShell, type DashboardNavItem } from "@/components/layout/dashboard-shell";

const navItems: DashboardNavItem[] = [
  { href: "/patient/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patient/records", label: "Medical Records", icon: FileStack },
  { href: "/patient/documents", label: "Documents", icon: Activity },
  { href: "/patient/access-requests", label: "Access Requests", icon: ShieldCheck },
  { href: "/patient/activity", label: "Access History", icon: ScrollText },
  { href: "/patient/ai-assistant", label: "AI Assistant", icon: Sparkles },
  { href: "/patient/notifications", label: "Notifications", icon: Bell },
  { href: "/patient/profile", label: "Profile", icon: User },
  { href: "/patient/settings", label: "Settings", icon: Settings },
];

export function PatientShell({ children }: { children: ReactNode }) {
  return (
    <DashboardShell navItems={navItems} roleLabel="Patient workspace">
      {children}
    </DashboardShell>
  );
}
