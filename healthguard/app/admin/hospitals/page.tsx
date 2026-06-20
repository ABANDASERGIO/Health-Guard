"use client";

import { useState } from "react";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { EncryptionBanner } from "@/components/security/encryption-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import type { HospitalRecord } from "@/stores/hospitals-store";
import { useHospitalsStore } from "@/stores/hospitals-store";

const emptyForm = (): Omit<HospitalRecord, "id"> & { id?: string } => ({
  name: "",
  region: "",
  beds: 200,
  status: "active",
  address: "",
  email: "",
  phone: "",
  licenseCode: "",
});

export default function AdminHospitalsPage() {
  const hospitals = useHospitalsStore((s) => s.hospitals);
  const upsertHospital = useHospitalsStore((s) => s.upsertHospital);
  const removeHospital = useHospitalsStore((s) => s.removeHospital);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());

  const startAdd = () => {
    setEditingId(null);
    setForm(emptyForm());
    setOpen(true);
  };

  const startEdit = (h: HospitalRecord) => {
    setEditingId(h.id);
    setForm({
      id: h.id,
      name: h.name,
      region: h.region,
      beds: h.beds,
      status: h.status,
      address: h.address,
      email: h.email,
      phone: h.phone,
      licenseCode: h.licenseCode,
    });
    setOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) return;
    const record: HospitalRecord = {
      id: editingId ?? `hosp-${crypto.randomUUID().slice(0, 8)}`,
      name: form.name.trim(),
      region: form.region.trim(),
      beds: Number(form.beds) || 0,
      status: form.status,
      address: form.address.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      licenseCode: form.licenseCode.trim(),
    };
    upsertHospital(record);
    setOpen(false);
  };

  const remove = (id: string) => {
    if (!confirm("Remove hospital directory entry?")) return;
    removeHospital(id);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Hospital management"
        description="Maintain licensed facilities, contact points, and operational states feeding doctor routing rules."
        actions={
          <Button type="button" className="gap-2" onClick={startAdd}>
            <Plus className="size-4" /> Add hospital
          </Button>
        }
      />

      <EncryptionBanner variant="compact" />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            Facility registry
          </CardTitle>
          <CardDescription>Updates sync to personnel invite forms and doctor registration references.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-muted-bg/80 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Facility</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">License</th>
                <th className="px-4 py-3">Beds</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.map((h) => (
                <tr key={h.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{h.name}</td>
                  <td className="px-4 py-3 text-muted">{h.region}</td>
                  <td className="max-w-[200px] px-4 py-3 text-xs text-muted">
                    <div className="truncate">{h.email}</div>
                    <div className="truncate">{h.phone}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{h.licenseCode}</td>
                  <td className="px-4 py-3">{h.beds}</td>
                  <td className="px-4 py-3">
                    <Badge variant={h.status === "active" ? "success" : "warning"}>{h.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button type="button" variant="ghost" size="sm" className="gap-1" onClick={() => startEdit(h)}>
                      <Pencil className="size-4" /> Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-danger"
                      onClick={() => remove(h.id)}
                    >
                      <Trash2 className="size-4" /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editingId ? "Edit hospital" : "Add hospital"}
        description="Facility license code and contacts appear on verification workflows."
      >
        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div className="space-y-2">
            <Label htmlFor="name">Facility name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                value={form.region}
                onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="licenseCode">Hospital license code</Label>
              <Input
                id="licenseCode"
                value={form.licenseCode}
                onChange={(e) => setForm((f) => ({ ...f, licenseCode: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Street, city, state / province"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="beds">Licensed beds</Label>
              <Input
                id="beds"
                type="number"
                value={form.beds === 0 ? "" : form.beds}
                onChange={(e) => setForm((f) => ({ ...f, beds: Number(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as HospitalRecord["status"] }))}
              >
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={save}>
              Save facility
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
