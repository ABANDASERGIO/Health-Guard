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

export const hospitalAdminProfile = {
  id: "ha-001",
  name: "Alicia Bennett",
  role: "Hospital Administrator",
  email: "abennett@metrogeneral.org",
  phone: "+1 (555) 010-2048",
  hospitalId: "hosp-metro",
  hospitalName: "Metro General Hospital",
};

export const hospitalAdminHospital = {
  id: "hosp-metro",
  name: "Metro General Hospital",
  address: "1200 Harbor Avenue, Suite 400",
  phone: "+1 (555) 010-2000",
  email: "admin@metrogeneral.org",
  logo: "/vercel.svg",
  description: "Regional teaching hospital specializing in cardiology, oncology, and urgent care.",
};

export const hospitalDoctors = [
  {
    id: "doc-001",
    name: "Dr. Morgan Ellis",
    specialty: "Cardiology",
    email: "mellis@metrogeneral.org",
    phone: "+1 (555) 010-2101",
    status: "active" as const,
    assignedPatients: 18,
    appointments: 12,
  },
  {
    id: "doc-002",
    name: "Dr. Priya Shah",
    specialty: "Oncology",
    email: "pshah@metrogeneral.org",
    phone: "+1 (555) 010-2102",
    status: "active" as const,
    assignedPatients: 15,
    appointments: 8,
  },
  {
    id: "doc-003",
    name: "Dr. Sam Okonkwo",
    specialty: "Primary Care",
    email: "sokonkwo@metrogeneral.org",
    phone: "+1 (555) 010-2103",
    status: "inactive" as const,
    assignedPatients: 9,
    appointments: 3,
  },
];

export const hospitalPatients = [
  {
    id: "pat-001",
    name: "Jordan Rivera",
    assignedDoctor: "Dr. Morgan Ellis",
    medicalDocuments: 4,
    appointments: 2,
    accessStatus: "Approved" as const,
  },
  {
    id: "pat-002",
    name: "Taylor Brooks",
    assignedDoctor: "Dr. Priya Shah",
    medicalDocuments: 6,
    appointments: 3,
    accessStatus: "Pending" as const,
  },
  {
    id: "pat-003",
    name: "Casey Nguyen",
    assignedDoctor: "Dr. Sam Okonkwo",
    medicalDocuments: 2,
    appointments: 1,
    accessStatus: "Approved" as const,
  },
];

export const hospitalNotifications = [
  {
    id: "hn-1",
    title: "Doctor logged in",
    description: "Dr. Morgan Ellis signed in from the cardiology unit.",
    time: "12 min ago",
    type: "info" as const,
    read: false,
  },
  {
    id: "hn-2",
    title: "New doctor created",
    description: "Dr. Sam Okonkwo was added to Metro General Hospital.",
    time: "1 hour ago",
    type: "success" as const,
    read: false,
  },
  {
    id: "hn-3",
    title: "Doctor account deactivated",
    description: "Dr. Priya Shah’s access was temporarily suspended.",
    time: "2 hours ago",
    type: "warning" as const,
    read: true,
  },
];
