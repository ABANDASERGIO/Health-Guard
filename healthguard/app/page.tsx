import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Brain,
  Lock,
  Shield,
  Stethoscope,
  Users,
} from "lucide-react";
import { EncryptionBanner } from "@/components/security/encryption-banner";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 spms-grid-bg opacity-50" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-8">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Shield className="size-6" />
          </span>
          <div>
          <p className="text-sm font-semibold leading-tight">HealthGuard</p>
          <p className="text-xs text-muted">Healthcare intelligence · Protected by design</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="rounded-xl px-4 py-2 text-sm font-medium text-muted hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/about"
            className="rounded-xl px-4 py-2 text-sm font-medium text-muted hover:text-foreground"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="rounded-xl px-4 py-2 text-sm font-medium text-muted hover:text-foreground"
          >
            Contact
          </Link>
          <Link
            href="/auth/register"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 hover:opacity-95"
          >
            Create access
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-6 md:pt-12">
        <div className="grid gap-16 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted shadow-sm">
              <Lock className="size-3.5 text-primary" aria-hidden />
              HIPAA-style controls · Role-separated workspaces
            </p>
            <h1 className="mt-8 text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
              Enterprise monitoring for modern hospitals.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted">
              A responsive platform for patients and clinicians to coordinate care, review vitals, approve secure access,
              and keep every interaction clear and easy to follow.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/25 hover:opacity-95"
              >
                Enter the workspace
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-3 text-sm font-semibold hover:bg-muted-bg"
              >
                Register organization user
              </Link>
            </div>

            <dl className="mt-14 grid gap-6 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  <Users className="size-4 text-primary" /> Roles
                </dt>
                <dd className="mt-3 text-2xl font-semibold">3 secure personas</dd>
                <dd className="mt-1 text-sm text-muted">Patient · Clinician · Administrator</dd>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  <Brain className="size-4 text-primary" /> AI assistant
                </dt>
                <dd className="mt-3 text-2xl font-semibold">Role-based AI</dd>
                <dd className="mt-1 text-sm text-muted">Separate assistants for patients and doctors</dd>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  <Activity className="size-4 text-primary" /> Monitoring
                </dt>
                <dd className="mt-3 text-2xl font-semibold">Live analytics</dd>
                <dd className="mt-1 text-sm text-muted">Charts, alerts, and audit timelines</dd>
              </div>
            </dl>
          </div>

          <div className="space-y-6">
            <EncryptionBanner />
            <div className="rounded-3xl border border-border bg-card p-8 shadow-xl">
              <div className="flex items-start gap-4">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                  <Stethoscope className="size-6" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold">Trusted care workflows</h2>
                  <p className="mt-2 text-sm text-muted">
                    Doctors request access, patients approve it directly, and everyone can trust that the process is tracked clearly.
                  </p>
                </div>
              </div>
              <div className="mt-8 grid gap-4 border-t border-border pt-8">
                <div className="flex items-center justify-between rounded-xl bg-muted-bg px-4 py-3">
                  <span className="text-sm font-medium">Doctor access pipeline</span>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-muted-bg px-4 py-3">
                  <span className="text-sm font-medium">Patient-controlled sharing</span>
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
                    Enabled
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
