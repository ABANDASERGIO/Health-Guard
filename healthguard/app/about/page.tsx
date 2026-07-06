import Link from "next/link";
import { Shield, Stethoscope, Brain, Lock, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col gap-2">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted">
            <Shield className="size-3.5 text-primary" aria-hidden />
            About HealthGuard
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Secure care workflows, built for real-world monitoring</h1>
          <p className="max-w-2xl text-muted">
            HealthGuard is a role-based care platform that keeps patient information secure while giving patients,
            clinicians, and administrators the tools they need to work together with confidence.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-7 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Stethoscope className="size-6" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Secure access & approvals</h2>
                <p className="mt-2 text-sm text-muted">
                  Doctors request access, patients approve with a secure code, and every action is logged for transparency.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-7 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Brain className="size-6" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">AI-assisted insights</h2>
                <p className="mt-2 text-sm text-muted">
                  Summarize vitals and support clinical decisions with an assistant designed for each care role.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-7 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Lock className="size-6" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Security-first design</h2>
                <p className="mt-2 text-sm text-muted">
                  Security controls, session timeout handling, and strict role separation help reduce risk.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-7 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Users className="size-6" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">Built for every persona</h2>
                <p className="mt-2 text-sm text-muted">
                  Patient, Doctor, and Admin workflows are separate so users only see what they should.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-3xl border border-border bg-muted-bg/50 p-7">
          <h3 className="text-lg font-semibold">Want to try it?</h3>
          <p className="mt-2 text-sm text-muted">Create an account and explore the dashboards for patients, doctors, and hospital administrators.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/25 hover:opacity-95"
            >
              Create access
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center rounded-2xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-muted-bg"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

