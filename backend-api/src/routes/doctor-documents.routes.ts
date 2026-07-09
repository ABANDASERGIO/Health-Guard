import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.middleware.js";
import { getDoctorNewPatientDocumentsController } from "../controllers/doctor-documents.controller.js";

export const doctorDocumentsRouter = Router();


doctorDocumentsRouter.use(authenticateToken);

doctorDocumentsRouter.get(
  "/monitoring/documents/:patientId/new",
  requireRole("DOCTOR"),
  getDoctorNewPatientDocumentsController
);

