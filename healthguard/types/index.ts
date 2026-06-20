export type UserRole = "patient" | "doctor" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  hospitalId?: string;
  /** Primary hospital affiliation name (doctors). */
  hospitalName?: string;
  patientId?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  type: "access" | "health" | "message" | "security" | "system";
  read: boolean;
  createdAt: string;
}

export interface AccessRequest {
  id: string;
  doctorName: string;
  doctorId: string;
  reason: string;
  priority: "low" | "normal" | "high" | "critical";
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  otp?: string;
}

export interface ActivityLogEntry {
  id: string;
  actor: string;
  action: string;
  resource: string;
  timestamp: string;
  ip?: string;
}

export interface VitalReading {
  id: string;
  date: string;
  temperature?: number;
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  weight?: number;
  symptoms?: string;
}
