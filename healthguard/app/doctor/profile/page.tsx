"use client";

import { useEffect, useState } from "react";
import { Camera, UserRound } from "lucide-react";

import { EncryptionBanner } from "@/components/security/encryption-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";

type DoctorProfile = {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  phone?: string | null;
  specialty?: string | null;
  hospital?: { name: string } | null;
};

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Doctor profile fields (name/avatar) can be edited from this page.
  // Settings currently focuses on password/notifications.


  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const { doctorApi } = await import("@/lib/api-client");
      const res = await doctorApi.getProfile();
      if (res.success && res.data) {
        setProfile(res.data as DoctorProfile);
      } else {
        setError(res.error || "Failed to load profile");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const t = window.setInterval(() => {
      void load();
    }, 30_000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Profile"
        description="Doctor identity and workspace context. Auto-refreshes in real time."
      />

      <EncryptionBanner variant="compact" />

      {error ? (
        <Card>
          <CardContent className="p-6 text-sm text-danger">{error}</CardContent>
        </Card>
      ) : null}

      {loading && !profile ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted">Loading profile…</CardContent>
        </Card>
      ) : null}

      {profile ? (
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="rounded-3xl border-border bg-card shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-3xl font-bold text-primary">
                  {profile.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatar} alt="Doctor avatar" width={80} height={80} className="h-full w-full object-cover" />
                  ) : (
                    <UserRound className="size-8" />
                  )}
                </div>


                <div>
                  <p className="text-2xl font-semibold">{profile.name}</p>
                  <p className="mt-1 text-sm text-muted">{profile.email}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline">Doctor</Badge>
                    <Badge>Hospital: {profile.hospital?.name ?? "Not set"}</Badge>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3 rounded-2xl bg-muted-bg/40 p-4">
                <div>
                  <p className="text-xs font-medium text-muted">Specialty</p>
                  <p className="mt-1 text-sm">{profile.specialty ?? "Not specified"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted">Phone</p>
                  <p className="mt-1 text-sm">{profile.phone ?? "Not specified"}</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-muted-bg/40 p-4 text-sm text-muted">
                <div className="flex items-center gap-2">
                  <Camera className="size-4" />
                  <span>Your profile can be updated.</span>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  className="mt-3 w-full"
                  onClick={() => window.location.assign("/doctor/profile/edit")}
                >
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-border bg-card shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold">Security</h2>
              <p className="mt-1 text-sm text-muted">
                Change password from Settings. Logout ends your session.
              </p>

              <div className="mt-6 space-y-3">
<Button type="button" variant="outline" onClick={() => window.location.assign("/doctor/settings")}>
                
                  Go to Settings
                </Button>
                <Button type="button" variant="outline" onClick={() => window.location.reload()}
                >
                  Refresh now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

