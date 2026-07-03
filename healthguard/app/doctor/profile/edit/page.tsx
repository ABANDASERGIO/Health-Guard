"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { EncryptionBanner } from "@/components/security/encryption-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { doctorApi } from "@/lib/api-client";

const editSchema = z.object({
  name: z.string().min(1, "Name is required"),
  avatar: z.string().optional(),
});

type FormValues = z.infer<typeof editSchema>;

export default function DoctorProfileEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await doctorApi.getProfile();
        if (!res.success || !res.data) {
          throw new Error(res.error || "Failed to load profile");
        }
        if (!mounted) return;
        setName(res.data.name ?? "");
        setAvatar(res.data.avatar ?? "");
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : "Failed to load profile");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const onSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const parsed: FormValues = editSchema.parse({
        name: name.trim(),
        avatar: avatar.trim() ? avatar.trim() : undefined,
      });

      const res = await doctorApi.updateProfile(parsed);
      if (!res.success) {
        throw new Error(res.error || "Profile update failed");
      }

      router.push("/doctor/profile");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Edit Profile" description="Update your doctor name and avatar." />

      <EncryptionBanner variant="compact" />

      <Card className="rounded-3xl border-border bg-card shadow-sm">
        <CardContent className="p-6">
          {error ? (
            <div className="mb-4 rounded-xl border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
              {error}
            </div>
          ) : null}

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading || saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="doctor-email">Email</Label>
                <Input id="doctor-email" value={""} disabled />
                <p className="text-xs text-muted">Email is managed by the account system.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={""} disabled />
                <p className="text-xs text-muted">No phone field is currently supported for doctors in the backend.</p>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl bg-muted-bg/40 p-4">
              <Label>Image Upload</Label>
              <p className="text-sm text-muted">Pick an image and we’ll store it as a preview URL (front-end only).</p>

              <div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-primary"
                  disabled={loading || saving}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = URL.createObjectURL(file);
                    setAvatar(url);
                  }}
                />
              </div>

              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="Doctor avatar preview" className="mt-3 size-24 rounded-full object-cover border border-border bg-card" />
              ) : (
                <div className="mt-3 rounded-full border border-border bg-card p-4 text-sm text-muted">No image selected</div>
              )}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                variant="secondary"
                className="sm:w-1/3"
                onClick={() => router.back()}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="sm:w-2/3"
                onClick={onSave}
                loading={saving}
                disabled={loading}
              >
                Save changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

