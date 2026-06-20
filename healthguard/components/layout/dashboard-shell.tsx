"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, PanelLeftClose, PanelLeft, Search, Shield } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SessionTimeoutModal } from "@/components/security/session-timeout-modal";
import { useSessionTimeout } from "@/hooks/use-session-timeout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function DashboardShell({
  navItems,
  children,
  roleLabel,
}: {
  navItems: DashboardNavItem[];
  children: React.ReactNode;
  roleLabel: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { showWarning, extendSession } = useSessionTimeout(
    () => {
      logout();
      router.push("/auth/login?reason=timeout");
    },
    Boolean(user)
  );

  const initials = useMemo(() => {
    if (!user?.name) return "U";
    const parts = user.name.split(" ");
    return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
  }, [user?.name]);

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/10 bg-sidebar text-sidebar shadow-xl transition-[width] duration-300 lg:static",
          sidebarOpen ? "w-72" : "w-[72px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-4">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Shield className="size-5" aria-hidden />
          </div>
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div
                key="brand"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="min-w-0"
              >
                <p className="truncate text-sm font-semibold text-white">Secure Patient Monitoring</p>
                <p className="truncate text-xs text-slate-400">Doctor Operations Console</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-hover text-white shadow-inner"
                    : "text-slate-300 hover:bg-sidebar-hover hover:text-white"
                )}
              >
                <Icon className={cn("size-5 shrink-0", active ? "text-primary" : "text-slate-400")} />
                {sidebarOpen ? <span className="truncate">{item.label}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="hidden w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400 hover:bg-sidebar-hover hover:text-white lg:flex"
          >
            {sidebarOpen ? (
              <>
                <PanelLeftClose className="size-4" /> Collapse
              </>
            ) : (
              <>
                <PanelLeft className="size-4" /> Expand
              </>
            )}
          </button>
        </div>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="flex min-h-screen flex-1 flex-col lg:pl-0">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-card/75 md:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </Button>

          <div className="hidden max-w-xl flex-1 items-center gap-2 rounded-xl border border-border bg-muted-bg/60 px-3 py-2 md:flex">
            <Search className="size-4 text-muted" />
            <input
              readOnly
              placeholder="Search records, patients, or audit IDs…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
            />
            <kbd className="hidden rounded border border-border bg-card px-1.5 py-0.5 text-[10px] text-muted lg:inline">
              /
            </kbd>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Badge variant="primary" className="hidden sm:inline-flex">
              {roleLabel}
            </Badge>
            <ThemeToggle />
            <NotificationsDropdown />
            <div className="hidden items-center gap-3 rounded-xl border border-border bg-muted-bg/50 px-2 py-1.5 sm:flex">
              <div className="text-right leading-tight">
                <p className="max-w-[140px] truncate text-sm font-medium">{user?.name ?? "Guest"}</p>
                <p className="max-w-[140px] truncate text-xs text-muted">{user?.email}</p>
              </div>
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-xs font-semibold text-primary">
                {initials.toUpperCase()}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              type="button"
              className="gap-2"
              onClick={() => {
                logout();
                router.push("/auth/login");
              }}
            >
              <LogOut className="size-4" />
              <span className="hidden md:inline">Sign out</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 md:px-8">
          <div className="mx-auto max-w-7xl space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <SessionTimeoutModal open={showWarning} onExtend={extendSession} onLogout={() => logout()} />
    </div>
  );
}
