import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";
import {
  getDashboardStatsController,
  getDoctorsController,
  getPatientsController,
  createDoctorController,
  updateDoctorController,
  deleteDoctorController,
  getHospitalsController,
  getHospitalProfileController,
  updateHospitalProfileController,
  createHospitalController,
  deleteHospitalController,
  getPersonnelController,
  invitePersonnelController,
  getSystemLogsController,
  getLoginHistoryController,
  getAdminProfileController,
  updateAdminProfileController,
} from "../controllers/admin.controller";

export const adminRouter = Router();

adminRouter.use(authenticateToken);

adminRouter.get("/dashboard/stats", requireRole("ADMIN"), getDashboardStatsController);
adminRouter.get("/doctors", requireRole("ADMIN"), getDoctorsController);
adminRouter.get("/patients", requireRole("ADMIN"), getPatientsController);
adminRouter.post("/doctors", requireRole("ADMIN"), createDoctorController);
adminRouter.put("/doctors/:id", requireRole("ADMIN"), updateDoctorController);
adminRouter.delete("/doctors/:id", requireRole("ADMIN"), deleteDoctorController);

adminRouter.get("/hospitals", requireRole("ADMIN"), getHospitalsController);
adminRouter.get("/hospital", requireRole("ADMIN"), getHospitalProfileController);
adminRouter.put("/hospital", requireRole("ADMIN"), updateHospitalProfileController);
adminRouter.post("/hospitals", requireRole("ADMIN"), createHospitalController);
adminRouter.delete("/hospitals/:id", requireRole("ADMIN"), deleteHospitalController);

adminRouter.get("/personnel", requireRole("ADMIN"), getPersonnelController);
adminRouter.post("/personnel/invite", requireRole("ADMIN"), invitePersonnelController);

adminRouter.get("/logs/system", requireRole("ADMIN"), getSystemLogsController);
adminRouter.get("/logs/login", requireRole("ADMIN"), getLoginHistoryController);

adminRouter.get("/profile", requireRole("ADMIN"), getAdminProfileController);
adminRouter.put("/profile", requireRole("ADMIN"), updateAdminProfileController);

// Admin AI endpoints removed — admin access to AI disabled per security policy