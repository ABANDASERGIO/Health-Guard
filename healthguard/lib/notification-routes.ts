import type { UserRole } from "@/types";

export function notificationsPathForRole(role: UserRole | undefined): string {
  if (!role) return "/auth/login";
  if (role === "patient") return "/patient/notifications";
  if (role === "doctor") return "/doctor/notifications";
  return "/admin/notifications";
}
