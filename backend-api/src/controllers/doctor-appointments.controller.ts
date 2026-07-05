import type { Response } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { prisma } from "../prisma";


const GetAppointmentsParamsSchema = z.object({
  patientId: z.string().min(1),
});

const UpdateAppointmentStatusParamsSchema = z.object({
  appointmentId: z.string().min(1),
});

const UpdateAppointmentStatusBodySchema = z.object({
  status: z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "MISSED"]),
});

export async function getDoctorAppointmentsController(req: AuthenticatedRequest, res: Response) {
  const doctorId = req.user?.id;
  if (!doctorId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const parsed = GetAppointmentsParamsSchema.parse(req.params);
  const { patientId } = parsed;

  // Gate access: only allow if doctor has APPROVED access for this patient.
  const access = await prisma.accessRequest.findFirst({
    where: { patientId, doctorId, status: "APPROVED" },
  });

  if (!access) {
    return res.status(403).json({ success: false, statusCode: 403, message: "Access not approved", error: "Access not approved" });
  }

  const appointments = await prisma.appointment.findMany({
    where: { patientId },
    orderBy: { datetime: "asc" },
    take: 50,
  });

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Appointments retrieved",
    data: appointments,
  });
}

export async function updateAppointmentStatusController(req: AuthenticatedRequest, res: Response) {
  const doctorId = req.user?.id;
  if (!doctorId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const { appointmentId } = UpdateAppointmentStatusParamsSchema.parse(req.params);
  const { status } = UpdateAppointmentStatusBodySchema.parse(req.body);

  const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) {
    return res.status(404).json({ success: false, statusCode: 404, message: "Appointment not found", error: "Appointment not found" });
  }

  // Gate access: only allow if doctor has APPROVED access for this patient.
  const access = await prisma.accessRequest.findFirst({
    where: { patientId: appointment.patientId, doctorId, status: "APPROVED" },
  });

  if (!access) {
    return res.status(403).json({ success: false, statusCode: 403, message: "Access not approved", error: "Access not approved" });
  }

  const updated = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status },
  });

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Appointment updated",
    data: updated,
  });
}



