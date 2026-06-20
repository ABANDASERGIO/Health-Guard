export const adminSummaryCards = [
  { label: "Patients", value: "12,480", trend: "+1.2% MoM", status: "neutral" as const },
  { label: "Doctors", value: "842", trend: "Active licenses", status: "success" as const },
  { label: "Hospitals", value: "36", trend: "3 pending onboarding", status: "warning" as const },
  { label: "Security score", value: "96", trend: "HIPAA-aligned controls", status: "success" as const },
];

export const hospitals = [
  {
    id: "hosp-metro",
    name: "Metro General Hospital",
    region: "Northeast",
    beds: 620,
    status: "active" as const,
  },
  {
    id: "hosp-riverside",
    name: "Riverside Medical Center",
    region: "Midwest",
    beds: 410,
    status: "active" as const,
  },
  {
    id: "hosp-lakeside",
    name: "Lakeside Community Hospital",
    region: "West",
    beds: 180,
    status: "maintenance" as const,
  },
];

export const personnel = [
  {
    id: "doc-001",
    name: "Dr. Morgan Ellis",
    role: "doctor" as const,
    hospital: "Metro General Hospital",
    status: "active" as const,
  },
  {
    id: "nrs-044",
    name: "Jamie Porter, RN",
    role: "nurse" as const,
    hospital: "Metro General Hospital",
    status: "active" as const,
  },
  {
    id: "doc-014",
    name: "Dr. Priya Shah",
    role: "doctor" as const,
    hospital: "Riverside Medical Center",
    status: "suspended" as const,
  },
];

export const systemLogs = [
  {
    id: "sl1",
    ts: "2026-05-12T08:01:12Z",
    level: "info" as const,
    source: "Auth",
    message: "Successful SSO login · admin role",
    actor: "adm-001",
  },
  {
    id: "sl2",
    ts: "2026-05-12T07:58:40Z",
    level: "warn" as const,
    source: "Access",
    message: "Rejected PHI export attempt — insufficient scope",
    actor: "doc-014",
  },
  {
    id: "sl3",
    ts: "2026-05-12T07:44:09Z",
    level: "error" as const,
    source: "Security",
    message: "Multiple failed MFA attempts · IP throttled",
    actor: "unknown",
  },
];
