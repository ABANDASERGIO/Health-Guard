import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";
import {
  createPrescriptionController,
  deletePrescriptionController,
  getDoctorActivePrescriptionsController,
  updatePrescriptionController,
} from "../controllers/doctor-prescriptions.controller";

export const doctorPrescriptionsRouter = Router();

doctorPrescriptionsRouter.use(authenticateToken);

doctorPrescriptionsRouter.get(
  "/monitoring/prescriptions/:patientId/active",
  requireRole("DOCTOR"),
  getDoctorActivePrescriptionsController
);

doctorPrescriptionsRouter.post(
  "/monitoring/prescriptions/:patientId",
  requireRole("DOCTOR"),
  createPrescriptionController
);

doctorPrescriptionsRouter.put(
  "/monitoring/prescriptions/:patientId/:prescriptionId",
  requireRole("DOCTOR"),
  updatePrescriptionController
);

doctorPrescriptionsRouter.delete(
  "/monitoring/prescriptions/:patientId/:prescriptionId",
  requireRole("DOCTOR"),
  deletePrescriptionController
);


