export const doctorSummaryCards = [
  { label: "Assigned patients", value: "48", trend: "+3 this week", status: "neutral" as const },
  { label: "Pending access", value: "5", trend: "Awaiting OTP", status: "warning" as const },
  { label: "Critical alerts", value: "2", trend: "Requires review", status: "danger" as const },
  { label: "Avg. response", value: "18m", trend: "SLA met", status: "success" as const },
];

export const doctorRecentActivity = [
  { id: "1", title: "Updated care plan", detail: "MRN-77102 · Hypertension", time: "35m ago" },
  { id: "2", title: "Prescription sent", detail: "MRN-88421 · Lisinopril refill", time: "2h ago" },
  { id: "3", title: "Lab review completed", detail: "MRN-91003 · CMP", time: "Yesterday" },
];

export const assignedPatientsPreview = [
  {
    id: "pat-001",
    mrn: "MRN-88421",
    name: "Jordan Rivera",
    risk: "moderate",
    lastVitals: "BP 130/84 · HR 74",
    alert: true,
  },
  {
    id: "pat-002",
    mrn: "MRN-77102",
    name: "Taylor Brooks",
    risk: "high",
    lastVitals: "BP 148/92 · HR 88",
    alert: true,
  },
  {
    id: "pat-003",
    mrn: "MRN-91003",
    name: "Casey Nguyen",
    risk: "low",
    lastVitals: "BP 118/76 · HR 68",
    alert: false,
  },
];

export const patientSearchResults = [
  {
    mrn: "MRN-88421",
    name: "Jordan Rivera",
    dob: "1988-03-12",
    sex: "M",
    lastVisit: "2026-04-28",
    access: "approved_until",
    accessDetail: "2026-05-20",
  },
  {
    mrn: "MRN-77102",
    name: "Taylor Brooks",
    dob: "1976-11-03",
    sex: "F",
    lastVisit: "2026-05-01",
    access: "none",
    accessDetail: undefined,
  },
];

export const intelligentAlerts = [
  {
    id: "ia1",
    level: "critical" as const,
    patient: "Taylor Brooks · MRN-77102",
    message: "Sustained elevated BP with orthostatic symptoms reported.",
  },
  {
    id: "ia2",
    level: "warning" as const,
    patient: "Jordan Rivera · MRN-88421",
    message: "14-day systolic trend +6 mmHg vs baseline.",
  },
];

export const monitoringVitalsSeries = [
  { date: "May 03", systolic: 132, diastolic: 86, hr: 76 },
  { date: "May 07", systolic: 128, diastolic: 82, hr: 72 },
  { date: "May 10", systolic: 130, diastolic: 84, hr: 74 },
];
