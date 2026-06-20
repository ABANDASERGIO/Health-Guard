# HealthGuard backend-api task checklist

- [ ] Update Prisma schema to split `User` into `Patient`, `Doctor`, `Administrator` tables
- [ ] Update auth.service.ts to create/login against the correct table by role
- [ ] Delete/reset DB tables (drop existing User/Hospital data) to match the new schema
- [ ] Run `prisma migrate` (or `prisma db push` + generate) and restart backend
- [ ] Test frontend flows: register/login for PATIENT, DOCTOR, ADMIN
- [ ] Confirm hospital linkage rules: DOCTOR/ADMIN linked to Hospital; PATIENT not linked

