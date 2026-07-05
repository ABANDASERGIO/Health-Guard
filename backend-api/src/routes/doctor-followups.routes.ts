import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";
import { getDoctorFollowUpPatientsController } from "../controllers/doctor-followups.controller";

export const doctorFollowUpsRouter = Router();

doctorFollowUpsRouter.use(authenticateToken);

doctorFollowUpsRouter.get(
  "/monitoring/follow-ups/:patientId",
  requireRole("DOCTOR"),
  getDoctorFollowUpPatientsController
);

