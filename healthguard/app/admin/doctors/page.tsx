"use client";

import { useEffect, useState } from "react";
import { Plus, Search, ShieldCheck, ShieldOff, UserRound } from "lucide-react";
import { EncryptionBanner } from "@/components/security/encryption-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Select } from "@/components/ui/select";
import { ToastItem, ToastViewport } from "@/components/ui/toast";

type DoctorRecord = {
  id: string;
  name: string;
  email: string;
  specialty?: string | null;
  phone?: string | null;
  status: "active" | "inactive";
  assignedPatients: number;
  appointments?: number;
};

export default function HospitalAdminDoctorsPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [form, setForm] = useState({
    name: "",
    specialty: "",
    email: "",
    phone: "",
    status: "active" as "active" | "inactive",
    password: "",
    confirmPassword: "",
  });

  const showToast = (message: string, variant: ToastItem["variant"]) => {
    const id = Date.now();
    setToasts((current) => [...current, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3000);
  };

  const refetchDoctors = async () => {
    setLoading(true);

    try {
      const { adminApi } = await import("@/lib/api-client");
      const res = await adminApi.getDoctors(query.trim() || undefined, statusFilter === "all" ? undefined : statusFilter);

      if (res.success && Array.isArray(res.data)) {
        setDoctors(res.data as DoctorRecord[]);
      }
    } catch (error) {
      console.error("[AdminDoctors] Failed to fetch doctors", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void refetchDoctors();
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [query, statusFilter]);

  const filteredDoctors = doctors;

  const openCreate = () => {
    setEditingId(null);
    setForm({
      name: "",
      specialty: "",
      email: "",
      phone: "",
      status: "active",
      password: "",
      confirmPassword: "",
    });
    setOpen(true);
  };

  const openEdit = (doctor: (typeof doctors)[number]) => {
    setEditingId(doctor.id);
    setForm({
      name: doctor.name,
      specialty: doctor.specialty ?? "",
      email: doctor.email,
      phone: doctor.phone ?? "",
      status: doctor.status,
      password: "",
      confirmPassword: "",
    });
    setOpen(true);
  };

  const saveDoctor = async () => {
    if (!form.name.trim() || !form.email.trim()) return;

    if (!editingId) {
      if (!form.password.trim() || !form.confirmPassword.trim()) return;
      if (form.password !== form.confirmPassword) return;
    }

    setLoading(true);

    try {
      const { adminApi } = await import("@/lib/api-client");

      if (editingId) {
        const res = await adminApi.updateDoctor(editingId, {
          name: form.name,
          email: form.email,
          specialty: form.specialty || undefined,
          phone: form.phone || undefined,
          status: form.status,
        });

        if (res.success && res.data) {
          const updatedDoctor = res.data as DoctorRecord;
          setDoctors((current) => current.map((doctor) => (doctor.id === editingId ? { ...doctor, ...updatedDoctor } : doctor)));
          showToast("Doctor updated successfully", "success");
        }
      } else {
        const res = await adminApi.createDoctor({
          name: form.name,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
          specialty: form.specialty || undefined,
          phone: form.phone || undefined,
          status: form.status,
        });

        if (res.success && res.data) {
          const createdDoctor = res.data as DoctorRecord;
          setDoctors((current) => [{ ...createdDoctor, assignedPatients: 0, appointments: 0 }, ...current]);
          showToast("Doctor created successfully", "success");
        }
      }
      setOpen(false);
    } catch (error) {
      console.error("[AdminDoctors] Save doctor failed", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDoctor = async (doctor: DoctorRecord) => {
    setLoading(true);
    try {
      const { adminApi } = await import("@/lib/api-client");
      await adminApi.updateDoctor(doctor.id, {
        status: doctor.status === "active" ? "inactive" : "active",
      });
      await refetchDoctors();
    } catch (error) {
      console.error("[AdminDoctors] Toggle doctor failed", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDoctor = async (id: string) => {
    if (!confirm("Remove this doctor from this hospital?")) return;
    setLoading(true);

    try {
      const { adminApi } = await import("@/lib/api-client");
      await adminApi.deleteDoctor(id);
      await refetchDoctors();
      showToast("Doctor deleted successfully", "success");
    } catch (error) {
      console.error("[AdminDoctors] Delete doctor failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Doctors"
        description="Manage the doctors assigned to this hospital only."
        actions={
          <Button type="button" className="gap-2" onClick={openCreate}>
            <Plus className="size-4" /> Add doctor
          </Button>
        }
      />

      <EncryptionBanner variant="compact" />

      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle>Hospital doctor roster</CardTitle>
            <CardDescription>Search, filter, manage, and review doctor performance for this facility.</CardDescription>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-2 md:w-full md:max-w-2xl">
            <div className="flex w-full items-center gap-2 md:max-w-sm">
              <Search className="size-4 text-muted" />
              <Input placeholder="Search doctors" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="w-full md:max-w-xs">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive") }>
                <option value="all">All statuses</option>
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-muted-bg/80 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Specialty</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Patients</th>
                <th className="px-4 py-3">Appointments</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="border-t border-border">
                  <td colSpan={7} className="px-4 py-10 text-center text-muted">Loading doctors...</td>
                </tr>
              ) : filteredDoctors.length === 0 ? (
                <tr className="border-t border-border">
                  <td colSpan={7} className="px-4 py-10 text-center text-muted">No doctors match your criteria.</td>
                </tr>
              ) : (
                filteredDoctors.map((doctor) => (
                  <tr key={doctor.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <UserRound className="size-4" />
                        </div>
                        <div>
                          <div className="font-medium">{doctor.name}</div>
                          <div className="text-xs text-muted">{doctor.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{doctor.specialty}</td>
                    <td className="px-4 py-3 text-muted">{doctor.phone}</td>
                    <td className="px-4 py-3">{doctor.assignedPatients}</td>
                    <td className="px-4 py-3">{doctor.appointments}</td>
                    <td className="px-4 py-3">
                      <Badge variant={doctor.status === "active" ? "success" : "warning"}>{doctor.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button type="button" variant="ghost" size="sm" className="gap-1" onClick={() => openEdit(doctor)}>
                        Edit
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="gap-1" onClick={() => toggleDoctor(doctor)}>
                        {doctor.status === "active" ? <ShieldOff className="size-4" /> : <ShieldCheck className="size-4" />}
                        {doctor.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="gap-1 text-danger" onClick={() => deleteDoctor(doctor.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <ToastViewport toasts={toasts} />
      <Modal open={open} onClose={() => setOpen(false)} title={editingId ? "Edit doctor" : "Add doctor"} description="Manage doctors attached to this hospital.">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Specialty</label>
              <Input value={form.specialty} onChange={(e) => setForm((current) => ({ ...current, specialty: e.target.value }))} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} />
            </div>
          </div>
          {!editingId && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Confirm password</label>
                <Input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm((current) => ({ ...current, confirmPassword: e.target.value }))}
                />
              </div>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm"
              value={form.status}
              onChange={(e) => setForm((current) => ({ ...current, status: e.target.value as "active" | "inactive" }))}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="button" onClick={saveDoctor}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
