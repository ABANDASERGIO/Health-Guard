import type { Request, Response } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../prisma.js";
import { aiService } from "../services/ai.service.js";


const VitalsSchema = z.object({
  temperature: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
  systolic: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
  diastolic: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
  heartRate: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
  weight: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
  symptoms: z.string().optional(),
});

const AccessRequestActionSchema = z.object({
  otp: z.string().length(6).optional(),
});

const UpdateProfileSchema = z.object({
  name: z.string().optional(),
  avatar: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
});

const AiMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1),
});

export async function getProfileController(req: AuthenticatedRequest, res: Response) {
  const patientId = req.user?.id;
  if (!patientId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true, email: true, name: true, avatar: true, phone: true, address: true, emergencyContact: true },
  });

  if (!patient) {
    return res.status(404).json({ success: false, statusCode: 404, message: "Patient not found", error: "Patient not found" });
  }

  return res.status(200).json({ success: true, statusCode: 200, message: "Profile retrieved", data: patient });
}

export async function updateProfileController(req: AuthenticatedRequest, res: Response) {
  const patientId = req.user?.id;
  if (!patientId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const parsed = UpdateProfileSchema.parse(req.body);

  const updated = await prisma.patient.update({
    where: { id: patientId },
    data: parsed,
    select: { id: true, email: true, name: true, avatar: true, phone: true, address: true, emergencyContact: true },
  });

  return res.status(200).json({ success: true, statusCode: 200, message: "Profile updated", data: updated });
}

export async function getVitalsController(req: AuthenticatedRequest, res: Response) {
  const patientId = req.user?.id;
  if (!patientId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const vitals = await prisma.vitalReading.findMany({
    where: { patientId },
    orderBy: { date: "desc" },
    take: 50,
  });

  return res.status(200).json({ success: true, statusCode: 200, message: "Vitals retrieved", data: vitals });
}

export async function recordVitalController(req: AuthenticatedRequest, res: Response) {
  const patientId = req.user?.id;
  if (!patientId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const parsed = VitalsSchema.parse(req.body);

  const vital = await prisma.vitalReading.create({
    data: {
      patientId,
      temperature: parsed.temperature,
      systolic: parsed.systolic,
      diastolic: parsed.diastolic,
      heartRate: parsed.heartRate,
      weight: parsed.weight,
      symptoms: parsed.symptoms,
    },
  });

  return res.status(201).json({ success: true, statusCode: 201, message: "Vital recorded", data: vital });
}

export async function getAccessRequestsController(req: AuthenticatedRequest, res: Response) {
  const patientId = req.user?.id;
  if (!patientId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const requests = await prisma.accessRequest.findMany({
    where: { patientId },
    include: {
      doctor: {
        select: {
          name: true,
          hospital: {
            select: { name: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const mapped = requests.map((r) => ({
    id: r.id,
    doctorName: r.doctor.name,
    doctorHospital: r.doctor.hospital?.name ?? "",
    doctorId: r.doctorId,
    reason: r.reason,
    priority: r.priority.toLowerCase() as "low" | "normal" | "high" | "critical",
    status: r.status.toLowerCase() as "pending" | "approved" | "rejected",
    requestedAt: r.createdAt.toISOString(),
    otp: r.otp,
  }));

  return res.status(200).json({ success: true, statusCode: 200, message: "Access requests retrieved", data: mapped });
}

export async function approveAccessRequestController(req: AuthenticatedRequest, res: Response) {
  const patientId = req.user?.id;
  const requestId = req.params.id;

  if (!patientId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const request = await prisma.accessRequest.findUnique({ where: { id: requestId } });
  if (!request || request.patientId !== patientId) {
    return res.status(404).json({ success: false, statusCode: 404, message: "Access request not found", error: "Access request not found" });
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));

  await prisma.accessRequest.update({
    where: { id: requestId },
    data: { status: "APPROVED", otp },
  });

  // Create doctor notification
  const requestWithDoctor = await prisma.accessRequest.findUnique({
    where: { id: requestId },
    include: { doctor: { include: { hospital: true } } },
  });

  await prisma.notification.create({
    data: {
      audience: "DOCTOR",
      type: "access",
      title: "Access request approved",
      description: `Your access request was approved by the patient. (Doctor: ${requestWithDoctor?.doctor?.name ?? ""} · Hospital: ${requestWithDoctor?.doctor?.hospital?.name ?? ""})`,
      link: `/doctor/access/status?state=granted`,
    },
  });

  return res.status(200).json({ success: true, statusCode: 200, message: "Access request approved", data: { otp } });
}

export async function rejectAccessRequestController(req: AuthenticatedRequest, res: Response) {
  const patientId = req.user?.id;
  const requestId = req.params.id;

  if (!patientId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const request = await prisma.accessRequest.findUnique({ where: { id: requestId } });
  if (!request || request.patientId !== patientId) {
    return res.status(404).json({ success: false, statusCode: 404, message: "Access request not found", error: "Access request not found" });
  }

  await prisma.accessRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED" },
  });

  // Create doctor notification
  const requestWithDoctor = await prisma.accessRequest.findUnique({
    where: { id: requestId },
    include: { doctor: { include: { hospital: true } } },
  });

  await prisma.notification.create({
    data: {
      audience: "DOCTOR",
      type: "access",
      title: "Access request rejected",
      description: `Your access request was rejected by the patient. (Doctor: ${requestWithDoctor?.doctor?.name ?? ""} · Hospital: ${requestWithDoctor?.doctor?.hospital?.name ?? ""})`,
      link: `/doctor/access/status?state=pending`,
    },
  });

  return res.status(200).json({ success: true, statusCode: 200, message: "Access request rejected" });
}

export async function revokeAccessRequestController(req: AuthenticatedRequest, res: Response) {
  const patientId = req.user?.id;
  const requestId = req.params.id;

  if (!patientId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const request = await prisma.accessRequest.findUnique({ where: { id: requestId } });
  if (!request || request.patientId !== patientId) {
    return res.status(404).json({ success: false, statusCode: 404, message: "Access request not found", error: "Access request not found" });
  }

  await prisma.accessRequest.delete({ where: { id: requestId } });

  return res.status(200).json({ success: true, statusCode: 200, message: "Access request revoked" });
}

export async function getMedicalRecordsController(req: AuthenticatedRequest, res: Response) {
  const patientId = req.user?.id;
  if (!patientId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const [medicalHistory, diagnoses, prescriptions, documents, doctorNotes] = await Promise.all([
    prisma.medicalHistory.findMany({ where: { patientId }, orderBy: { date: "desc" } }),
    prisma.diagnosis.findMany({ where: { patientId } }),
    prisma.prescription.findMany({ where: { patientId } }),
    prisma.document.findMany({ where: { patientId }, orderBy: { createdAt: "desc" } }),
    prisma.doctorNote.findMany({ where: { patientId }, orderBy: { date: "desc" } }),
  ]);

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Medical records retrieved",
    data: { medicalHistory, diagnoses, prescriptions, documents, doctorNotes },
  });
}

export async function getActivityLogsController(req: AuthenticatedRequest, res: Response) {
  const patientId = req.user?.id;
  if (!patientId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

// Create a single PrismaClient per process (prisma instance is module-scoped).
// This endpoint was timing out on connection pool; be defensive.
  const logs = await prisma.activityLog.findMany({
    where: { patientId },
    orderBy: { createdAt: "desc" },
    take: 100,
  }).catch(() => [] as any);

  return res.status(200).json({ success: true, statusCode: 200, message: "Activity logs retrieved", data: logs });
}

export async function getAppointmentsController(req: AuthenticatedRequest, res: Response) {
  const patientId = req.user?.id;
  if (!patientId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const appointments = await prisma.appointment.findMany({
    where: { patientId },
    orderBy: { datetime: "asc" },
  });

  return res.status(200).json({ success: true, statusCode: 200, message: "Appointments retrieved", data: appointments });
}

const CreateAppointmentSchema = z.object({
  specialty: z.string().min(1),
  provider: z.string().min(1),
  // frontend uses type="datetime-local" which sends a local value like "2026-07-04T22:53"
  // (no timezone / trailing Z). Accept it as an ISO-like local datetime.
  datetime: z.string().refine((v) => {
    // Allow both: local "YYYY-MM-DDTHH:mm" and full ISO "...Z"
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z)?$/.test(v);
  }, { message: "Invalid ISO datetime" }),
  location: z.string().min(1),
  appointmentType: z.string().min(1).optional(),
  reason: z.string().min(1),
});

export async function createAppointmentController(req: AuthenticatedRequest, res: Response) {
  const patientId = req.user?.id;
  if (!patientId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const parsed = CreateAppointmentSchema.parse(req.body);

  const appointment = await prisma.appointment.create({
    data: {
      patientId,
      specialty: parsed.specialty,
      provider: parsed.provider,
      datetime: new Date(parsed.datetime),
      location: parsed.location,
      encrypted: true,
      // Step 2 note: schema currently lacks these fields; once Prisma migration is applied, set them here.
      // appointmentType: parsed.appointmentType ?? "GENERAL",
      // status: "PENDING",
      // reason: parsed.reason,
    },
  });

  return res.status(201).json({
    success: true,
    statusCode: 201,
    message: "Appointment created",
    data: appointment,
  });
}

export async function patientAiChatController(req: AuthenticatedRequest, res: Response) {
  try {
    const parsed = z.object({
      messages: z.array(AiMessageSchema).min(1),
      temperature: z.number().optional(),
      maxOutputTokens: z.number().optional(),
    }).parse(req.body);

    const response = await aiService.chat(parsed.messages, {
      temperature: parsed.temperature,
      maxOutputTokens: parsed.maxOutputTokens,
    });

    return res.status(200).json({ success: true, statusCode: 200, message: "AI chat response generated", data: { text: response } });
  } catch (error: any) {
    console.error("Patient AI chat error:", error?.message ?? error);
    return res.status(500).json({ success: false, statusCode: 500, message: error?.message ?? "Failed to generate AI chat response", error: error?.message ?? "Failed to generate AI chat response" });
  }
}

export async function patientAiSummarizeController(req: AuthenticatedRequest, res: Response) {
  try {
    const parsed = z.object({
      text: z.string().min(1),
      temperature: z.number().optional(),
      maxOutputTokens: z.number().optional(),
    }).parse(req.body);

    const response = await aiService.summarize(parsed.text, {
      temperature: parsed.temperature,
      maxOutputTokens: parsed.maxOutputTokens,
    });

    return res.status(200).json({ success: true, statusCode: 200, message: "AI summary generated", data: { summary: response } });
  } catch (error: any) {
    console.error("Patient AI summarize error:", error?.message ?? error);
    return res.status(500).json({ success: false, statusCode: 500, message: error?.message ?? "Failed to summarize text", error: error?.message ?? "Failed to summarize text" });
  }
}

