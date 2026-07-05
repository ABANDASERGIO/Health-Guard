import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";
import { getDoctorAppointmentsController, updateAppointmentStatusController } from "../controllers/doctor-appointments.controller";

export const doctorAppointmentsRouter = Router();

doctorAppointmentsRouter.use(authenticateToken);

doctorAppointmentsRouter.get(
  "/monitoring/appointments/:patientId",
  requireRole("DOCTOR"),
  getDoctorAppointmentsController
);

// Doctor-controlled appointment lifecycle
// POST /api/doctor/monitoring/appointments/:appointmentId/status
// Body: { status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "MISSED" }

doctorAppointmentsRouter.post(
  "/monitoring/appointments/:appointmentId/status",
  requireRole("DOCTOR"),
  updateAppointmentStatusController
);






