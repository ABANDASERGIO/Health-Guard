import type { AccessRequest, ActivityLogEntry, NotificationItem, VitalReading } from "@/types";

export const patientSummaryCards = [
  {
    label: "Active prescriptions",
    value: "4",
    trend: "+1 refill due",
    status: "neutral" as const,
  },
  {
    label: "Open alerts",
    value: "2",
    trend: "Review BP trend",
    status: "warning" as const,
  },
  {
    label: "Next appointment",
    value: "May 18",
    trend: "Cardiology · 10:30 AM",
    status: "neutral" as const,
  },
  {
    label: "Records encrypted",
    value: "100%",
    trend: "PHI protected",
    status: "success" as const,
  },
];

export const patientActivities = [
  {
    id: "1",
    title: "Lab results uploaded",
    detail: "Complete metabolic panel — verified",
    time: "2 hours ago",
    icon: "lab" as const,
  },
  {
    id: "2",
    title: "Prescription renewed",
    detail: "Lisinopril 10mg · 90 days",
    time: "Yesterday",
    icon: "rx" as const,
  },
  {
    id: "3",
    title: "Vitals logged",
    detail: "BP 128/82 · HR 72",
    time: "Yesterday",
    icon: "vitals" as const,
  },
];

export const patientHealthAlerts = [
  {
    id: "a1",
    severity: "warning" as const,
    title: "Blood pressure trending upward",
    detail: "Average systolic increased 6 mmHg over 14 days.",
  },
  {
    id: "a2",
    severity: "info" as const,
    title: "Annual wellness visit due",
    detail: "Schedule within the next 30 days.",
  },
];

export const upcomingAppointments = [
  {
    id: "ap1",
    specialty: "Cardiology",
    provider: "Dr. Morgan Ellis",
    datetime: "2026-05-18T10:30:00",
    location: "Metro General · Wing B",
    encrypted: true,
  },
  {
    id: "ap2",
    specialty: "Primary Care",
    provider: "Dr. Sam Okonkwo",
    datetime: "2026-06-02T14:00:00",
    location: "Telehealth · Secure video",
    encrypted: true,
  },
];

export const medicalHistory = [
  {
    id: "mh1",
    date: "2025-11-02",
    event: "Hypertension management plan updated",
    facility: "Metro General",
  },
  {
    id: "mh2",
    date: "2024-08-14",
    event: "Appendectomy — uncomplicated recovery",
    facility: "Riverside Surgical",
  },
];

export const diagnoses = [
  {
    code: "I10",
    name: "Essential (primary) hypertension",
    status: "Active",
    since: "2023",
  },
  {
    code: "E78.5",
    name: "Hyperlipidemia, unspecified",
    status: "Monitoring",
    since: "2024",
  },
];

export const prescriptions = [
  {
    drug: "Lisinopril",
    dose: "10 mg",
    sig: "Once daily",
    refills: 2,
    expires: "2026-08-01",
  },
  {
    drug: "Atorvastatin",
    dose: "20 mg",
    sig: "Once daily at bedtime",
    refills: 3,
    expires: "2027-01-15",
  },
];

export const doctorNotes = [
  {
    id: "n1",
    author: "Dr. Morgan Ellis",
    date: "2026-04-28",
    note:
      "Encourage home BP monitoring twice weekly. Discuss sodium intake and exercise.",
    encrypted: true,
  },
];

export const uploadedDocuments = [
  {
    id: "d1",
    name: "CMP-Labs-May-2026.pdf",
    type: "Laboratory",
    uploadedAt: "2026-05-08",
    protected: true,
  },
  {
    id: "d2",
    name: "Cardiology-Referral.pdf",
    type: "Referral",
    uploadedAt: "2026-04-30",
    protected: true,
  },
];

export const vitalsHistory: VitalReading[] = [
  {
    id: "v1",
    date: "2026-05-10",
    temperature: 36.8,
    systolic: 130,
    diastolic: 84,
    heartRate: 74,
    weight: 82.4,
  },
  {
    id: "v2",
    date: "2026-05-07",
    temperature: 36.6,
    systolic: 128,
    diastolic: 82,
    heartRate: 72,
    weight: 82.6,
  },
  {
    id: "v3",
    date: "2026-05-03",
    temperature: 36.9,
    systolic: 132,
    diastolic: 86,
    heartRate: 76,
    weight: 82.5,
  },
];

export const patientAccessRequests: AccessRequest[] = [
  {
    id: "req-101",
    doctorName: "Dr. Morgan Ellis",
    doctorId: "doc-001",
    reason: "Follow-up cardiology review and medication adjustment.",
    priority: "normal",
    status: "pending",
    requestedAt: "2026-05-11T09:15:00",
  },
  {
    id: "req-088",
    doctorName: "Dr. Priya Shah",
    doctorId: "doc-014",
    reason: "Second opinion on lipid panel interpretation.",
    priority: "low",
    status: "approved",
    requestedAt: "2026-05-02T11:40:00",
    otp: "482913",
  },
];

export const patientActivityLogs: ActivityLogEntry[] = [
  {
    id: "log1",
    actor: "Dr. Morgan Ellis",
    action: "Viewed encrypted vitals summary",
    resource: "MRN-88421",
    timestamp: "2026-05-11T14:22:00Z",
    ip: "10.0.14.2",
  },
  {
    id: "log2",
    actor: "You",
    action: "Approved PHI access request",
    resource: "req-088",
    timestamp: "2026-05-02T16:05:00Z",
    ip: "104.xx.xx.xx",
  },
  {
    id: "log3",
    actor: "System",
    action: "Successful MFA login",
    resource: "Account security",
    timestamp: "2026-05-12T08:01:00Z",
  },
];

export const patientNotifications: NotificationItem[] = [
  {
    id: "n1",
    title: "New access request",
    description: "Dr. Morgan Ellis requested access to your records.",
    type: "access",
    read: false,
    createdAt: "2026-05-11T09:20:00Z",
  },
  {
    id: "n2",
    title: "Blood pressure insight",
    description: "Your average systolic increased slightly this week.",
    type: "health",
    read: false,
    createdAt: "2026-05-10T07:00:00Z",
  },
  {
    id: "n3",
    title: "Secure message",
    description: "Dr. Okonkwo: annual wellness reminder.",
    type: "message",
    read: true,
    createdAt: "2026-05-09T18:30:00Z",
  },
];

export const aiInsights = [
  {
    id: "i1",
    title: "Blood pressure pattern",
    severity: "warning" as const,
    body:
      "Readings suggest elevated systolic trend — correlate with sodium intake and sleep.",
  },
  {
    id: "i2",
    title: "Symptom correlation",
    severity: "info" as const,
    body: "Reported fatigue aligns with recent medication change timing.",
  },
  {
    id: "i3",
    title: "Temperature stability",
    severity: "success" as const,
    body: "No fever pattern detected across logged readings.",
  },
];

export const suggestedAiPrompts = [
  "Explain my latest blood pressure trend in plain language.",
  "What questions should I ask my cardiologist?",
  "Summarize lifestyle changes that support heart health.",
  "Are my logged symptoms consistent with dehydration?",
];
