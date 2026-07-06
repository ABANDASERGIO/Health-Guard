"use client";

import { useEffect, useState } from "react";
import { Building2, Save } from "lucide-react";
import { EncryptionBanner } from "@/components/security/encryption-banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { adminApi } from "@/lib/api-client";

type HospitalProfile = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  description?: string | null;
};

export default function HospitalAdminProfilePage() {
  const [hospital, setHospital] = useState<HospitalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getHospitalProfile();
      if (response.success && response.data) {
        setHospital(response.data as HospitalProfile);
        setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      }
    } catch (error) {
      console.error("Failed to load hospital profile", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!hospital) return;
    setSaving(true);
    try {
      await adminApi.updateHospitalProfile({
        name: hospital.name,
        email: hospital.email || undefined,
        phone: hospital.phone || undefined,
        address: hospital.address || undefined,
        description: hospital.description || undefined,
      });
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (error) {
      console.error("Failed to save hospital profile", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Hospital Profile" description="View and edit this hospital's administrative profile." />
        <p className="text-sm text-muted">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Hospital Profile" description="View and edit this hospital’s administrative profile." />
      <EncryptionBanner variant="compact" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            Facility details
          </CardTitle>
          <CardDescription>The hospital administrator can update contact details and public profile information for this facility.</CardDescription>
          <p className="mt-2 text-xs text-muted">Last updated {lastUpdated || "—"}.</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Hospital name</label>
              <Input
                value={hospital?.name || ""}
                onChange={(e) => setHospital((current) => (current ? { ...current, name: e.target.value } : null))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                value={hospital?.phone || ""}
                onChange={(e) => setHospital((current) => (current ? { ...current, phone: e.target.value } : null))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              value={hospital?.email || ""}
              onChange={(e) => setHospital((current) => (current ? { ...current, email: e.target.value } : null))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>
            <Input
              value={hospital?.address || ""}
              onChange={(e) => setHospital((current) => (current ? { ...current, address: e.target.value } : null))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="min-h-24 w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
              value={hospital?.description || ""}
              onChange={(e) => setHospital((current) => (current ? { ...current, description: e.target.value } : null))}
            />
          </div>
          <div className="flex justify-end">
            <Button type="button" className="gap-2" onClick={handleSave} disabled={saving}>
              <Save className="size-4" /> {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
