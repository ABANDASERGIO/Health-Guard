import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";
import { getDoctorNewPatientDocumentsController } from "../controllers/doctor-documents.controller";

export const doctorDocumentsRouter = Router();

doctorDocumentsRouter.use(authenticateToken);

doctorDocumentsRouter.get(
  "/monitoring/documents/:patientId/new",
  requireRole("DOCTOR"),
  getDoctorNewPatientDocumentsController
);

