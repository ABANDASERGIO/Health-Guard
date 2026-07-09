import type { Request, Response } from "express";
import { z } from "zod";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../prisma.js";
import { aiService } from "../services/ai.service.js";


const RequestAccessSchema = z.object({
  patientId: z.string().min(1),
  reason: z.string().min(10),
  priority: z.string().optional().default("NORMAL"),
});

const UpdateDoctorProfileSchema = z.object({
  name: z.string().min(1).optional(),
  avatar: z.string().optional(),
  phone: z.string().optional(),
  specialty: z.string().optional(),
});

const AiMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1),
});

export async function getProfileController(req: AuthenticatedRequest, res: Response) {
  const doctorId = req.user?.id;
  if (!doctorId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      phone: true,
      specialty: true,
      hospital: {
        select: { id: true, name: true },
      },
    },
  });

  if (!doctor) {
    return res.status(404).json({ success: false, statusCode: 404, message: "Doctor not found", error: "Doctor not found" });
  }

  return res.status(200).json({ success: true, statusCode: 200, message: "Profile retrieved", data: doctor });
}

export async function getPatientsController(req: AuthenticatedRequest, res: Response) {
  const doctorId = req.user?.id;
  if (!doctorId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const doctor = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: { hospital: true },
  });

  if (!doctor) {
    return res.status(404).json({ success: false, statusCode: 404, message: "Doctor not found", error: "Doctor not found" });
  }

  const patients = await prisma.patient.findMany({
    take: 50,
    select: { id: true, name: true, email: true, avatar: true },
  });

  return res.status(200).json({ success: true, statusCode: 200, message: "Patients retrieved", data: patients });
}

export async function requestAccessController(req: AuthenticatedRequest, res: Response) {
  const doctorId = req.user?.id;
  if (!doctorId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const parsed = RequestAccessSchema.parse(req.body);

  const existing = await prisma.accessRequest.findFirst({
    where: { patientId: parsed.patientId, doctorId, status: "PENDING" },
  });

  if (existing) {
    return res.status(200).json({ success: true, statusCode: 200, message: "Access request already pending", data: existing });
  }

  const request = await prisma.accessRequest.create({
    data: {
      patientId: parsed.patientId,
      doctorId,
      reason: parsed.reason,
      priority: parsed.priority.toUpperCase(),
      status: "PENDING",
    },
  });

  // Create patient notification (no internal ids)
  const doctorWithHospital = await prisma.doctor.findUnique({
    where: { id: doctorId },
    include: { hospital: true },
  });


  await prisma.notification.create({
    data: {
      audience: "PATIENT",
      type: "access",
      title: "New access request",
      description: `${doctorWithHospital?.name ?? "A doctor"} (${doctorWithHospital?.hospital?.name ?? "their hospital"}) requested access to your medical records.`,
      link: `/patient/access-requests`,
    },
  });

  return res.status(201).json({ success: true, statusCode: 201, message: "Access request created", data: request });
}
export async function doctorAiChatController(req: AuthenticatedRequest, res: Response) {
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
    console.error("Doctor AI chat error:", error?.message ?? error);
    return res.status(500).json({ success: false, statusCode: 500, message: error?.message ?? "Failed to generate AI chat response", error: error?.message ?? "Failed to generate AI chat response" });
  }
}

export async function doctorAiSummarizeController(req: AuthenticatedRequest, res: Response) {
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
    console.error("Doctor AI summarize error:", error?.message ?? error);
    return res.status(500).json({ success: false, statusCode: 500, message: error?.message ?? "Failed to summarize text", error: error?.message ?? "Failed to summarize text" });
  }
}
export async function getAccessRequestsController(req: AuthenticatedRequest, res: Response) {
  const doctorId = req.user?.id;
  if (!doctorId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const requests = await prisma.accessRequest.findMany({
    where: { doctorId },
    include: { patient: { select: { name: true, id: true } } },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({ success: true, statusCode: 200, message: "Access requests retrieved", data: requests });
}

export async function getMonitoringSessionsController(req: AuthenticatedRequest, res: Response) {
  const doctorId = req.user?.id;
  const patientId = req.params.patientId;

  if (!doctorId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const access = await prisma.accessRequest.findFirst({
    where: { patientId, doctorId, status: "APPROVED" },
  });

  if (!access) {
    return res.status(403).json({ success: false, statusCode: 403, message: "Access not approved", error: "Access not approved" });
  }

  const vitals = await prisma.vitalReading.findMany({
    where: { patientId },
    orderBy: { date: "desc" },
    take: 50,
  });

  return res.status(200).json({ success: true, statusCode: 200, message: "Vitals retrieved", data: vitals });
}

export async function startMonitoringController(req: AuthenticatedRequest, res: Response) {
  const doctorId = req.user?.id;
  if (!doctorId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const { patientId } = req.body;

  const access = await prisma.accessRequest.findFirst({
    where: { patientId, doctorId, status: "APPROVED" },
  });

  if (!access) {
    return res.status(403).json({ success: false, statusCode: 403, message: "Access not approved", error: "Access not approved" });
  }

  return res.status(200).json({ success: true, statusCode: 200, message: "Monitoring session started" });
}

export async function updateProfileController(req: AuthenticatedRequest, res: Response) {
  const doctorId = req.user?.id;
  if (!doctorId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const parsed = UpdateDoctorProfileSchema.parse(req.body);

  const updated = await prisma.doctor.update({
    where: { id: doctorId },
    data: parsed,
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      phone: true,
      specialty: true,
    },
  });

  return res.status(200).json({ success: true, statusCode: 200, message: "Profile updated", data: updated });
}

export async function createAlertController(req: AuthenticatedRequest, res: Response) {
  const doctorId = req.user?.id;
  if (!doctorId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const { patientId, title, description, severity } = req.body;

  const alert = await prisma.alert.create({
    data: {
      doctorId,
      patientId,
      title,
      description,
      severity: severity.toUpperCase(),
    },
  });

  return res.status(201).json({ success: true, statusCode: 201, message: "Alert created", data: alert });
}