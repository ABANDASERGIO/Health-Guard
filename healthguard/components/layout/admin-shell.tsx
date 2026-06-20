"use client";

import type { ReactNode } from "react";
import {
  Bell,
  Building2,
  LayoutDashboard,
  ScrollText,
  UsersRound,
} from "lucide-react";
import { DashboardShell, type DashboardNavItem } from "@/components/layout/dashboard-shell";

const navItems: DashboardNavItem[] = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  { href: "/admin/hospitals", label: "Hospitals", icon: Building2 },
  { href: "/admin/personnel", label: "Personnel", icon: UsersRound },
  { href: "/admin/logs", label: "System logs", icon: ScrollText },
];

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <DashboardShell navItems={navItems} roleLabel="Administrator">
      {children}
    </DashboardShell>
  );
}
