import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";
import {
  getProfileController,
  getPatientsController,
  requestAccessController,
  getAccessRequestsController,
  getMonitoringSessionsController,
  startMonitoringController,
  createAlertController,
  updateProfileController,
  doctorAiChatController,
  doctorAiSummarizeController,
} from "../controllers/doctor.controller";

export const doctorRouter = Router();

doctorRouter.use(authenticateToken);

doctorRouter.get("/profile", requireRole("DOCTOR"), getProfileController);

doctorRouter.get("/patients", requireRole("DOCTOR"), getPatientsController);

doctorRouter.post("/access-requests", requireRole("DOCTOR"), requestAccessController);
doctorRouter.get("/access-requests", requireRole("DOCTOR"), getAccessRequestsController);
doctorRouter.get("/monitoring/:patientId", requireRole("DOCTOR"), getMonitoringSessionsController);
doctorRouter.post("/monitoring/start", requireRole("DOCTOR"), startMonitoringController);
doctorRouter.post("/alerts", requireRole("DOCTOR"), createAlertController);

doctorRouter.put("/profile", requireRole("DOCTOR"), updateProfileController);
doctorRouter.post("/ai/chat", requireRole("DOCTOR"), doctorAiChatController);
doctorRouter.post("/ai/summarize", requireRole("DOCTOR"), doctorAiSummarizeController);
