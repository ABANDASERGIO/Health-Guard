"use client";

import { useMemo, useState } from "react";
import { ShieldOff, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EncryptionBanner } from "@/components/security/encryption-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { inviteDoctorSchema } from "@/validations/admin";
import type { z } from "zod";
import { personnel as seed } from "@/mock-data/admin";
import { useHospitalsStore } from "@/stores/hospitals-store";
import { useNotificationsStore } from "@/stores/notifications-store";

type Row = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: "doctor" | "nurse";
  hospital: string;
  status: "active" | "suspended" | "pending";
  roleLabel: string;
};

const labeled: Row[] = seed.map((p) => ({
  ...p,
  roleLabel: p.role === "doctor" ? "Physician" : "Nursing",
  status: p.status === "suspended" ? "suspended" : "active",
}));

type InviteForm = z.infer<typeof inviteDoctorSchema>;

export default function AdminPersonnelPage() {
  const hospitals = useHospitalsStore((s) => s.hospitals);
  const addNotification = useNotificationsStore((s) => s.addNotification);

  const [rows, setRows] = useState<Row[]>(labeled);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [hospitalSearch, setHospitalSearch] = useState("");

  const filteredHospitals = useMemo(() => {
    const q = hospitalSearch.trim().toLowerCase();
    if (!q) return hospitals;
    return hospitals.filter((h) => h.name.toLowerCase().includes(q) || h.region.toLowerCase().includes(q));
  }, [hospitals, hospitalSearch]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InviteForm>({
    resolver: zodResolver(inviteDoctorSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      hospitalId: "",
      hospitalLicenseCode: "",
    },
  });

  const hospitalId = watch("hospitalId");

  const toggle = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id && r.status !== "pending"
          ? { ...r, status: r.status === "active" ? ("suspended" as const) : ("active" as const) }
          : r
      )
    );
  };

  const cancelInvite = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const onInvite = async (values: InviteForm) => {
    await new Promise((r) => setTimeout(r, 400));
    const hospital = hospitals.find((h) => h.id === values.hospitalId);
    const row: Row = {
      id: `inv-${crypto.randomUUID().slice(0, 10)}`,
      name: values.fullName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      role: "doctor",
      hospital: hospital?.name ?? "Unknown facility",
      status: "pending",
      roleLabel: "Physician",
    };
    setRows((prev) => [row, ...prev]);
    addNotification({
      id: `adm-${crypto.randomUUID().slice(0, 8)}`,
      title: "Doctor invitation queued",
      description: `${row.name} invited to ${row.hospital} · license ${values.hospitalLicenseCode}`,
      type: "system",
      read: false,
      createdAt: new Date().toISOString(),
      audience: "admin",
    });
    reset();
    setHospitalSearch("");
    setInviteOpen(false);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Health personnel"
        description="Provision identities, attach hospitals, and suspend privileged accounts instantly."
        actions={
          <Button type="button" className="gap-2" onClick={() => setInviteOpen(true)}>
            <UserPlus className="size-4" /> Invite doctor
          </Button>
        }
      />

      <EncryptionBanner variant="compact" />

      <Card>
        <CardHeader>
          <CardTitle>Identity roster</CardTitle>
          <CardDescription>RBAC bindings replicate nightly to downstream EHR integrations (demo).</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-muted-bg/80 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Hospital</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-muted">{p.email ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{p.phone ?? "—"}</td>
                  <td className="px-4 py-3">{p.roleLabel}</td>
                  <td className="max-w-[220px] px-4 py-3 text-muted">{p.hospital}</td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        p.status === "active"
                          ? "success"
                          : p.status === "pending"
                            ? "warning"
                            : "danger"
                      }
                    >
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {p.status === "pending" ? (
                      <Button type="button" variant="outline" size="sm" onClick={() => cancelInvite(p.id)}>
                        Cancel invite
                      </Button>
                    ) : (
                      <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => toggle(p.id)}>
                        <ShieldOff className="size-4" />
                        {p.status === "active" ? "Suspend" : "Reactivate"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite doctor"
        description="Send a secure invitation tied to a verified facility and license code."
      >
        <form className="space-y-4" onSubmit={handleSubmit(onInvite)}>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" error={errors.fullName?.message} {...register("fullName")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" error={errors.email?.message} {...register("email")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" placeholder="+1 · digits only ok" error={errors.phone?.message} {...register("phone")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hospitalSearch">Find hospital</Label>
            <Input
              id="hospitalSearch"
              placeholder="Search by name or region…"
              value={hospitalSearch}
              onChange={(e) => setHospitalSearch(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hospitalId">Hospital</Label>
            <Select id="hospitalId" error={errors.hospitalId?.message} {...register("hospitalId")}>
              <option value="">Select a facility</option>
              {filteredHospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} · {h.region}
                </option>
              ))}
            </Select>
            {hospitalId ? (
              <p className="text-xs text-muted">
                License on file:{" "}
                <span className="font-mono font-medium text-foreground">
                  {hospitals.find((x) => x.id === hospitalId)?.licenseCode ?? "—"}
                </span>
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hospitalLicenseCode">Hospital license code (verification)</Label>
            <Input
              id="hospitalLicenseCode"
              placeholder="Enter facility license / CMS identifier"
              error={errors.hospitalLicenseCode?.message}
              {...register("hospitalLicenseCode")}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Send invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
