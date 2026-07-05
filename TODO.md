# HealthGuard - TODO

## Patient appointment request (doctor access flow)
- [ ] Add backend POST endpoint for patient to create appointments
- [ ] Update Prisma schema Appointment model (appointmentType/status/reason) and create migration
- [ ] Implement backend service/controller logic:
  - Validate input
  - Create Appointment with server-controlled status="PENDING"
  - Set encrypted=true default
- [ ] Implement frontend create appointment UI in `healthguard/app/patient/dashboard/page.tsx` (or new component)
  - Replace the placeholder button/alert
  - POST to backend via `patientApi`
  - Refresh appointments list after success
- [ ] Ensure doctor access request + notification flow (if required by the requested feature)

## End-to-end realtime prescriptions (doctor -> patient)
- [x] Doctor can fetch active prescriptions for a patient: `GET /api/doctor/monitoring/prescriptions/:patientId/active`
- [ ] Add patient-facing endpoint to fetch active prescriptions for the logged-in patient (include doctor name)
- [ ] Add backend POST endpoint to create prescription (doctor -> patient) with fields in Prisma `Prescription`
- [ ] Implement doctor frontend “Add prescription” form (replace alert) to call create endpoint
- [ ] Implement patient frontend to fetch and poll active prescriptions from patient-facing endpoint

## Auth OTP + password reset
- [ ] (No action) OTP works well per user feedback.

