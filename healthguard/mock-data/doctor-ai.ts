export const doctorAiInsights = [
  {
    id: "di1",
    title: "Cohort BP trend",
    severity: "warning" as const,
    body: "3 assigned patients show systolic drift >5 mmHg over 14 days — review before rounds.",
  },
  {
    id: "di2",
    title: "Access window",
    severity: "info" as const,
    body: "MRN-88421 OTP session active · chart views are audit-logged until expiry.",
  },
  {
    id: "di3",
    title: "Escalation queue",
    severity: "danger" as const,
    body: "MRN-77102 flagged critical — orthostatic symptoms with sustained elevated BP.",
  },
];

export const doctorSuggestedAiPrompts = [
  "Summarize Jordan Rivera (MRN-88421) vitals for a handoff note.",
  "Draft differential considerations for recurring fatigue with stable labs.",
  "What follow-up questions should I ask for elevated BP trend?",
  "Outline a concise care-plan update for hypertension management.",
];

export const doctorAiConversations = [
  { id: "dc1", title: "MRN-88421 handoff summary", updated: "Today" },
  { id: "dc2", title: "Hypertension protocol reminder", updated: "Yesterday" },
  { id: "dc3", title: "Drug interaction check", updated: "May 09" },
];

export const doctorAiStarterMessage =
  "Hello — I am your Clinical Decision Support assistant. I can help summarize assigned patient trends, draft documentation language, and surface evidence-based considerations. This channel is encrypted and separate from patient-facing AI transcripts.";

export const doctorAiDemoResponses = [
  "For MRN-88421: home BP averages 128–132/82–86 over 14 days with stable heart rate. Consider reinforcing lifestyle counseling and reviewing timing of antihypertensive dosing before escalation.",
  "Fatigue with stable CMP and recent medication change may reflect orthostatic effects or sleep disruption — document orthostatic vitals and medication reconciliation in the note.",
  "Suggested documentation: 'Discussed home BP log, reinforced sodium restriction and activity goals, plan repeat labs in 8 weeks unless symptoms worsen.'",
  "No major interaction flags between Lisinopril and Atorvastatin in standard references — still verify renal function and patient-reported adverse effects at visit.",
];
