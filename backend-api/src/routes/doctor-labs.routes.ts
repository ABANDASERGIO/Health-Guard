import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";
import { getDoctorPendingLabResultsController } from "../controllers/doctor-labs.controller";

export const doctorLabsRouter = Router();

doctorLabsRouter.use(authenticateToken);

doctorLabsRouter.get(
  "/monitoring/labs/:patientId/pending",
  requireRole("DOCTOR"),
  getDoctorPendingLabResultsController
);

