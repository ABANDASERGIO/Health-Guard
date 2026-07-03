"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { EncryptionBanner } from "@/components/security/encryption-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NotificationsList } from "@/components/notifications/notifications-list";
import { useNotificationsStore } from "@/stores/notifications-store";
import { PageHeader } from "@/components/ui/page-header";

import { useNotificationsSettingsStore } from "@/stores/notifications-settings-store";
import { authApi, clearAuthToken } from "@/lib/api-client";

export default function DoctorSettingsPage() {
  const router = useRouter();

  const enabled = useNotificationsSettingsStore((s) => s.enabled);
  const setEnabled = useNotificationsSettingsStore((s) => s.setEnabled);


  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    clearAuthToken();
    router.push("/auth/login");
  };

  // Keep notifications UI responsive: when toggled off, we stop fetching.
  // (Backend endpoints exist for fetching notifications, but there is no backend preference store yet.)
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Doctor account security, notifications, and workspace information."
      />

      <EncryptionBanner variant="compact" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border-border bg-card shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Account</h2>
            <div className="mt-4 space-y-3">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => router.push("/auth/change-password")}
              >
                Change Password
              </Button>

              <Button type="button" variant="secondary" className="w-full" onClick={handleLogout}>
                Logout
              </Button>

              <div className="rounded-2xl bg-muted-bg/40 p-4 text-sm text-muted">
                Use logout to end your session securely.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border bg-card shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Notifications</h2>
            <div className="mt-4 space-y-3">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => setEnabled(!enabled)}
              >
                Notifications: {enabled ? "On" : "Off"}
              </Button>


              <div className="rounded-2xl bg-muted-bg/40 p-4 text-sm text-muted">
                <Badge variant="outline">Frontend toggle</Badge>
                <div className="mt-2">Controls whether the doctor notifications UI fetches/shows items.</div>
              </div>

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
              <Button type="button" variant="secondary">About Us</Button>
            </Link>
            <Link href="/contact" className="inline-flex">
              <Button type="button" variant="secondary">Contact Us</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

