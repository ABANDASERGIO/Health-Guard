"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";

function initialsFromName(name?: string | null) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase() || "P";
}

type Profile = {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  phone?: string | null;
  address?: string | null;
  emergencyContact?: string | null;
};

export default function PatientProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(null);

  const initials = useMemo(() => initialsFromName(profile?.name), [profile?.name]);

  useEffect(() => {
    (async () => {
      const { patientApi } = await import("@/lib/api-client");
      const res = await patientApi.getProfile();
      if (res.success && res.data) {
        setProfile(res.data as Profile);
      }
    })();
  }, []);

  const onPickProfileImage = async (file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProfilePreviewUrl(url);
  };

  const onSave = async () => {
    if (!profile) return;
    const { patientApi } = await import("@/lib/api-client");
    const res = await patientApi.updateProfile({
      name: profile.name,
      avatar: profilePreviewUrl || profile.avatar || undefined,
      phone: profile.phone || undefined,
      address: profile.address || undefined,
      emergencyContact: profile.emergencyContact || undefined,
    });
    if (res.success && res.data) {
      setProfile(res.data as Profile);
      setProfilePreviewUrl(null);
      setIsEditing(false);
    }
  };

  if (!profile) {
    return <div className="p-6">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <span className="text-sm font-bold">👤</span>
          </div>
          <h1 className="text-2xl font-semibold">Profile</h1>
        </div>
        <p className="mt-1 text-sm text-muted">Update your personal details.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-3xl border-border bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex size-20 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-3xl font-bold text-primary">
                    {profilePreviewUrl || profile.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profilePreviewUrl || profile.avatar || ""} alt="Profile" className="size-full object-cover" />
                    ) : (
                      <span className="leading-none">{initials}</span>
                    )}
                  </div>

                  {isEditing ? (
                    <label
                      className="absolute -bottom-1 -right-1 inline-flex size-10 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"
                      htmlFor="profile-upload"
                      title="Change profile picture"
                    >
                      <Camera className="size-5" />
                      <input
                        id="profile-upload"
                        className="hidden"
                        type="file"
                        accept="image/*"
                        onChange={(e) => onPickProfileImage(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Full Name</p>
                <p className="text-sm text-muted">{profile.name}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Email</p>
                <p className="text-sm text-muted">{profile.email}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Phone Number</p>
                <p className="text-sm text-muted">{profile.phone || "Not set"}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Address</p>
                <p className="text-sm text-muted">{profile.address || "Not set"}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Emergency Contact</p>
                <p className="text-sm text-muted">{profile.emergencyContact || "Not set"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border bg-card shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Your information</h2>
                <p className="mt-1 text-sm text-muted">Phone, address, emergency contact.</p>
              </div>

              <div className="flex items-center gap-3">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                ) : (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setIsEditing(false);
                        setProfilePreviewUrl(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={onSave}>
                      Save Changes
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} disabled={!isEditing} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profile.email} disabled />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={profile.phone || ""} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} disabled={!isEditing} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={profile.address || ""} onChange={(e) => setProfile({ ...profile, address: e.target.value })} disabled={!isEditing} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="emergency">Emergency Contact</Label>
                <Input
                  id="emergency"
                  value={profile.emergencyContact || ""}
                  onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                  disabled={!isEditing}
                />
              </div>

              {isEditing ? (
                <div className="rounded-2xl bg-muted-bg/40 p-4 text-sm text-muted">
                  Changes are saved securely.
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}