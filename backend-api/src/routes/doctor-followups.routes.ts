import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.middleware.js";
import { getDoctorFollowUpPatientsController } from "../controllers/doctor-followups.controller.js";

export const doctorFollowUpsRouter = Router();


doctorFollowUpsRouter.use(authenticateToken);

doctorFollowUpsRouter.get(
  "/monitoring/follow-ups/:patientId",
  requireRole("DOCTOR"),
  getDoctorFollowUpPatientsController
);

