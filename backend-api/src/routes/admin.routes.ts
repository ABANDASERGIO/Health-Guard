import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";
import {
  getDashboardStatsController,
  getHospitalsController,
  createHospitalController,
  deleteHospitalController,
  getPersonnelController,
  invitePersonnelController,
  getSystemLogsController,
  getLoginHistoryController,
} from "../controllers/admin.controller";

export const adminRouter = Router();

adminRouter.use(authenticateToken);

adminRouter.get("/dashboard/stats", requireRole("ADMIN"), getDashboardStatsController);

adminRouter.get("/hospitals", requireRole("ADMIN"), getHospitalsController);
adminRouter.post("/hospitals", requireRole("ADMIN"), createHospitalController);
adminRouter.delete("/hospitals/:id", requireRole("ADMIN"), deleteHospitalController);

adminRouter.get("/personnel", requireRole("ADMIN"), getPersonnelController);
adminRouter.post("/personnel/invite", requireRole("ADMIN"), invitePersonnelController);

adminRouter.get("/logs/system", requireRole("ADMIN"), getSystemLogsController);
adminRouter.get("/logs/login", requireRole("ADMIN"), getLoginHistoryController);