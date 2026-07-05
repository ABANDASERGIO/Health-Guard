import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";
import {
  getProfileController,
  updateProfileController,
  getVitalsController,
  recordVitalController,
  getAccessRequestsController,
  approveAccessRequestController,
  rejectAccessRequestController,
  revokeAccessRequestController,
  getMedicalRecordsController,
  getActivityLogsController,
  getAppointmentsController,
  createAppointmentController,
} from "../controllers/patient.controller";

export const patientRouter = Router();

patientRouter.use(authenticateToken);

patientRouter.get("/profile", requireRole("PATIENT"), getProfileController);

patientRouter.put("/profile", requireRole("PATIENT"), updateProfileController);

patientRouter.get("/vitals", requireRole("PATIENT"), getVitalsController);
patientRouter.post("/vitals", requireRole("PATIENT"), recordVitalController);

patientRouter.get("/access-requests", requireRole("PATIENT"), getAccessRequestsController);
patientRouter.post("/access-requests/:id/approve", requireRole("PATIENT"), approveAccessRequestController);
patientRouter.post("/access-requests/:id/reject", requireRole("PATIENT"), rejectAccessRequestController);
patientRouter.delete("/access-requests/:id", requireRole("PATIENT"), revokeAccessRequestController);

patientRouter.get("/medical-records", requireRole("PATIENT"), getMedicalRecordsController);

patientRouter.get("/activity", requireRole("PATIENT"), getActivityLogsController);

patientRouter.get("/appointments", requireRole("PATIENT"), getAppointmentsController);

patientRouter.post("/appointments", requireRole("PATIENT"), createAppointmentController);
