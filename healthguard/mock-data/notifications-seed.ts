import type { NotificationItem } from "@/types";
import type { UserRole } from "@/types";

export type SeededNotification = NotificationItem & { audience: UserRole };

export const notificationsSeed: SeededNotification[] = [
  {
    id: "pn-1",
    title: "New access request",
    description: "Dr. Morgan Ellis requested access to your records.",
    type: "access",
    read: false,
    createdAt: "2026-05-11T09:20:00Z",
    audience: "patient",
  },
  {
    id: "pn-2",
    title: "Blood pressure insight",
    description: "Your average systolic increased slightly this week.",
    type: "health",
    read: false,
    createdAt: "2026-05-10T07:00:00Z",
    audience: "patient",
  },
  {
    id: "pn-3",
    title: "Secure message",
    description: "Dr. Okonkwo: annual wellness reminder.",
    type: "message",
    read: true,
    createdAt: "2026-05-09T18:30:00Z",
    audience: "patient",
  },
  {
    id: "dn-1",
    title: "Patient vitals uploaded",
    description: "Jordan Rivera (MRN-88421) submitted home vitals · review trending BP.",
    type: "health",
    read: false,
    createdAt: "2026-05-12T09:05:00Z",
    audience: "doctor",
  },
  {
    id: "dn-2",
    title: "Access request approved",
    description: "Patient approved PHI access · OTP window active for 24h.",
    type: "access",
    read: false,
    createdAt: "2026-05-11T14:30:00Z",
    audience: "doctor",
  },
  {
    id: "dn-3",
    title: "Critical alert acknowledged",
    description: "Escalation queue cleared for MRN-77102.",
    type: "system",
    read: true,
    createdAt: "2026-05-10T16:00:00Z",
    audience: "doctor",
  },
  {
    id: "an-1",
    title: "Security audit export ready",
    description: "Weekly PHI access report is available for download.",
    type: "security",
    read: false,
    createdAt: "2026-05-12T08:00:00Z",
    audience: "admin",
  },
  {
    id: "an-2",
    title: "New hospital onboarded",
    description: "Riverside Medical Center completed directory verification.",
    type: "system",
    read: true,
    createdAt: "2026-05-09T11:15:00Z",
    audience: "admin",
  },
];
