"use client";

import { useEffect, useState } from "react";
import { UserCircle2, Save } from "lucide-react";
import { EncryptionBanner } from "@/components/security/encryption-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { ToastItem, ToastViewport } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/auth-store";
import { adminApi } from "@/lib/api-client";

type AdminProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  hospitalId: string;
  createdAt: string;
};

export default function HospitalAdminOwnProfilePage() {
  const userRole = useAuthStore((s) => s.user?.role);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, variant: ToastItem["variant"]) => {
    const id = Date.now();
    setToasts((current) => [...current, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAdminProfile();
      if (response.success && response.data) {
        setProfile(response.data as AdminProfile);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      }
    } catch (error) {
      console.error("Failed to load admin profile", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    const interval = window.setInterval(fetchProfile, 60000);
    return () => window.clearInterval(interval);
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await adminApi.updateAdminProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || undefined,
        avatar: profile.avatar || undefined,
      });
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      showToast("Profile updated successfully!", "success");
    } catch (error) {
      console.error("Failed to save admin profile", error);
      showToast("Failed to update profile. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Profile" description="Your hospital administrator account details." />
        <p className="text-sm text-muted">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Profile" description="Your hospital administrator account details." />
      <EncryptionBanner variant="compact" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle2 className="size-5 text-primary" />
            Account overview
          </CardTitle>
          <CardDescription>View and edit the identity and role information attached to this hospital administrator account.</CardDescription>
          <p className="mt-2 text-xs text-muted">Live updates refresh every 60 seconds. Last updated {lastUpdated || "—"}.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {profile?.avatar && (
            <div className="space-y-2">
              <label className="text-sm text-muted">Avatar</label>
              <div className="flex items-center gap-4">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="h-16 w-16 rounded-full object-cover border border-border"
                />
                <div>
                  <label className="text-sm font-medium">Avatar URL</label>
                  <Input
                    value={profile.avatar || ""}
                    onChange={(e) => setProfile((current) => (current ? { ...current, avatar: e.target.value } : null))}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={profile?.name || ""}
                onChange={(e) => setProfile((current) => (current ? { ...current, name: e.target.value } : null))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Input value={userRole || "ADMIN"} disabled className="bg-muted" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={profile?.email || ""}
                onChange={(e) => setProfile((current) => (current ? { ...current, email: e.target.value } : null))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={profile?.phone || ""}
                onChange={(e) => setProfile((current) => (current ? { ...current, phone: e.target.value } : null))}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="button" className="gap-2" onClick={handleSave} disabled={saving}>
              <Save className="size-4" /> {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ToastViewport toasts={toasts} />
    </div>
  );
}
