"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PatientSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage security, notifications, and preferences.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border-border bg-card shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Account</h2>
            <div className="mt-4 space-y-3">
              <Button type="button" variant="secondary" className="w-full" disabled>
                Change Password
              </Button>
              <Button type="button" variant="secondary" className="w-full" disabled>
                Logout
              </Button>

              <div className="rounded-2xl bg-muted-bg/40 p-4 text-sm text-muted">
                These controls are placeholders. Wire them to backend endpoints next.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border bg-card shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Preferences</h2>
            <div className="mt-4 space-y-3">
              <Button type="button" variant="secondary" className="w-full" disabled>
                Notification Toggle (On/Off)
              </Button>
              <Button type="button" variant="secondary" className="w-full" disabled>
                Dark Mode Toggle
              </Button>
            </div>

            <div className="mt-5 rounded-2xl bg-muted-bg/40 p-4 text-sm text-muted">
              UI-only demo switches. Backend wiring can be added when endpoints are ready.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl border-border bg-card shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold">About</h2>
          <p className="mt-1 text-sm text-muted">Quick links to HealthGuard information.</p>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/about" className="inline-flex">
              <Button type="button" variant="secondary">
                About Us
              </Button>
            </Link>
            <Link href="/contact" className="inline-flex">
              <Button type="button" variant="secondary">
                Contact Us
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

