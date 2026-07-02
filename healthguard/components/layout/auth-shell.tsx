"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { EncryptionBanner } from "@/components/security/encryption-banner";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 spms-grid-bg opacity-60" />
      <div className="pointer-events-none absolute -left-40 top-20 size-[520px] rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-20 size-[480px] rounded-full bg-accent/15 blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Shield className="size-6" aria-hidden />
          </span>
          <span className="text-sm font-semibold leading-tight">
            Secure Patient
            <br />
            Monitoring System
          </span>
        </Link>
        <ThemeToggle />
      </header>

      <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-6 pb-16 lg:grid-cols-[1.05fr_minmax(0,520px)] lg:items-start">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="hidden space-y-6 lg:block"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Hospital-grade security</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">{title}</h1>
            <p className="mt-4 max-w-xl text-lg text-muted">{description}</p>
          </div>
          <EncryptionBanner />
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-foreground">Compliance-ready UX patterns</p>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li>Clear session status and account safety cues</li>
              <li>Role-specific workspaces designed for care teams</li>
              <li>Protected presentation for sensitive health details</li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.05 }}
          className="rounded-3xl border border-border bg-card p-8 shadow-xl shadow-black/5 dark:shadow-black/40"
        >
          <div className="mb-8 lg:hidden">
            <h2 className="text-2xl font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted">{description}</p>
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
