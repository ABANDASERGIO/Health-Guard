"use client";

import { useMemo, useState } from "react";
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

export default function PatientProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  // TODO: Replace with real patient profile from backend.
  const [fullName, setFullName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@example.com");
  const [phone, setPhone] = useState("+1 (555) 123-4567");
  const [address, setAddress] = useState("221B Health St, City");
  const [emergencyContact, setEmergencyContact] = useState("Jane Doe (+1 (555) 987-6543)");

  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(null);

  const initials = useMemo(() => initialsFromName(fullName), [fullName]);

  const onPickProfileImage = async (file: File | null) => {
    if (!file) return;
    // Preview only for now; hook to backend when available.
    const url = URL.createObjectURL(file);
    setProfilePreviewUrl(url);
  };

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
                    {profilePreviewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profilePreviewUrl} alt="Profile" className="size-full object-cover" />
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
                <p className="text-sm text-muted">{fullName}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Email</p>
                <p className="text-sm text-muted">{email}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Phone Number</p>
                <p className="text-sm text-muted">{phone}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Address</p>
                <p className="text-sm text-muted">{address}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Emergency Contact</p>
                <p className="text-sm text-muted">{emergencyContact}</p>
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
                    <Button
                      onClick={() => {
                        // TODO: persist to backend
                        setIsEditing(false);
                      }}
                    >
                      Save Changes
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={!isEditing} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!isEditing} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!isEditing} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} disabled={!isEditing} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="emergency">Emergency Contact</Label>
                <Input
                  id="emergency"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              {isEditing ? (
                <div className="rounded-2xl bg-muted-bg/40 p-4 text-sm text-muted">
                  Changes are UI-only placeholders. Save Changes will be wired to backend when available.
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

