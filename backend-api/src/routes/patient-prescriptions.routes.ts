import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.middleware.js";
import { getPatientActivePrescriptionsController } from "../controllers/patient-prescriptions.controller.js";

export const patientPrescriptionsRouter = Router();


patientPrescriptionsRouter.use(authenticateToken);

patientPrescriptionsRouter.get(
  "/prescriptions/active",
  requireRole("PATIENT"),
  getPatientActivePrescriptionsController
);

