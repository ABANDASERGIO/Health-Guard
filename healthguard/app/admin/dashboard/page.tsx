"use client";

import { useEffect, useState } from "react";
import { Plus, Users, UserPlus2 } from "lucide-react";
import { EncryptionBanner } from "@/components/security/encryption-banner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { LinkButton } from "@/components/ui/link-button";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  type: string;
  read: boolean;
  link?: string | null;
  createdAt: string;
};

type DashboardStats = {
  totalDoctors: number;
  activeDoctors: number;
  inactiveDoctors: number;
  patientsUnderCare: number;
  recentNotifications: NotificationItem[];
};

const statsOrder = [
  { label: "Total Doctors", key: "totalDoctors" },
  { label: "Active Doctors", key: "activeDoctors" },
  { label: "Inactive Doctors", key: "inactiveDoctors" },
  { label: "Patients Under Care", key: "patientsUnderCare" },
] as const;

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { adminApi } = await import("@/lib/api-client");
      const res = await adminApi.getDashboardStats();
      if (res.success && res.data) {
        setStats(res.data as DashboardStats);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Hospital dashboard"
        description="View your hospital’s doctors, patient access, and latest notifications in real time."
        actions={
          <LinkButton href="/admin/doctors" variant="secondary">
            Manage doctors
          </LinkButton>
        }
      />

      <EncryptionBanner variant="compact" />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading || !stats ? (
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="h-4 rounded bg-muted/50" />
                <CardTitle>
                  <span className="block h-12 rounded bg-muted/50" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-4 rounded bg-muted/50" />
              </CardContent>
            </Card>
          ))
        ) : (
          statsOrder.map((item) => (
            <Card key={item.label}>
              <CardHeader className="pb-2">
                <CardDescription>{item.label}</CardDescription>
                <CardTitle className="text-3xl">{stats[item.key]}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted">Updated live from hospital records.</p>
                <Badge variant="outline" className="mt-3">
                  {item.label}
                </Badge>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent notifications</CardTitle>
            <CardDescription>Latest events for your hospital’s doctors and operations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!loading && stats?.recentNotifications.length === 0 ? (
              <p className="text-sm text-muted">No notifications available.</p>
            ) : (
              stats?.recentNotifications.map((notification) => (
                <div key={notification.id} className="rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted">{notification.description}</p>
                    </div>
                    <Badge variant={notification.read ? "outline" : "primary"}>
                      {notification.read ? "Read" : "New"}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Jump straight to common hospital administration workflows.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <LinkButton href="/admin/doctors" variant="secondary" className="w-full justify-start gap-2 flex">
              <Plus className="size-4" /> Add doctor
            </LinkButton>
            <LinkButton href="/admin/doctors" variant="outline" className="w-full justify-start gap-2 flex">
              <Users className="size-4" /> View doctors
            </LinkButton>
            <LinkButton href="/admin/patients" variant="outline" className="w-full justify-start gap-2 flex">
              <UserPlus2 className="size-4" /> View patients
            </LinkButton>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
