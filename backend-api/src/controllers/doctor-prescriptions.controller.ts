import type { Response } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { prisma } from "../prisma";

const GetPrescriptionsParamsSchema = z.object({
  patientId: z.string().min(1),
});

const PrescriptionDetailParamsSchema = z.object({
  patientId: z.string().min(1),
  prescriptionId: z.string().min(1),
});

const PrescriptionBodySchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(500),
  drug: z.string().min(1),
  dose: z.string().min(1),
  sig: z.string().min(1),
  refills: z.number().int().min(0).default(0),
  // Accept ISO string; frontend can send Date.toISOString()
  expires: z.string().min(1),
});

const UpdatePrescriptionBodySchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().min(1).max(500).optional(),
  drug: z.string().min(1).optional(),
  dose: z.string().min(1).optional(),
  sig: z.string().min(1).optional(),
  refills: z.number().int().min(0).optional(),
  expires: z.string().min(1).optional(),
});

function ensurePatientAccess(doctorId: string, patientId: string) {
  return prisma.accessRequest.findFirst({
    where: { patientId, doctorId, status: "APPROVED" },
  });
}

// Step 4: Active Prescriptions.
// There is no explicit "active" flag in schema, so we interpret active as:
// - Access APPROVED for this doctor + patient
// - expires > now
export async function getDoctorActivePrescriptionsController(req: AuthenticatedRequest, res: Response) {
  const doctorId = req.user?.id;
  if (!doctorId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const parsed = GetPrescriptionsParamsSchema.parse(req.params);
  const { patientId } = parsed;

  const access = await ensurePatientAccess(doctorId, patientId);

  if (!access) {
    return res.status(403).json({ success: false, statusCode: 403, message: "Access not approved", error: "Access not approved" });
  }

  const now = new Date();
  const prescriptions = await prisma.prescription.findMany({
    where: {
      patientId,
      expires: { gt: now },
    },
    orderBy: { expires: "asc" },
    take: 50,
  });

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Active prescriptions retrieved",
    data: prescriptions,
  });
}

// Doctor -> create a prescription for a patient (feeds patient active list)
export async function createPrescriptionController(req: AuthenticatedRequest, res: Response) {
  const doctorId = req.user?.id;
  if (!doctorId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const { patientId } = GetPrescriptionsParamsSchema.parse(req.params);
  const parsed = PrescriptionBodySchema.parse(req.body);

  const access = await ensurePatientAccess(doctorId, patientId);

  if (!access) {
    return res.status(403).json({ success: false, statusCode: 403, message: "Access not approved", error: "Access not approved" });
  }

  const expiresDate = new Date(parsed.expires);
  if (Number.isNaN(expiresDate.getTime())) {
    return res.status(400).json({ success: false, statusCode: 400, message: "Invalid expires date", error: "Invalid expires date" });
  }

  const prescription = await prisma.prescription.create({
    data: {
      patientId,
      title: parsed.title,
      description: parsed.description,
      drug: parsed.drug,
      dose: parsed.dose,
      sig: parsed.sig,
      refills: parsed.refills,
      expires: expiresDate,
    },
  });

  return res.status(201).json({
    success: true,
    statusCode: 201,
    message: "Prescription created",
    data: prescription,
  });
}

export async function updatePrescriptionController(req: AuthenticatedRequest, res: Response) {
  const doctorId = req.user?.id;
  if (!doctorId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const { patientId, prescriptionId } = PrescriptionDetailParamsSchema.parse(req.params);
  const parsed = UpdatePrescriptionBodySchema.parse(req.body);

  const access = await ensurePatientAccess(doctorId, patientId);

  if (!access) {
    return res.status(403).json({ success: false, statusCode: 403, message: "Access not approved", error: "Access not approved" });
  }

  const existing = await prisma.prescription.findFirst({
    where: { id: prescriptionId, patientId },
  });

  if (!existing) {
    return res.status(404).json({ success: false, statusCode: 404, message: "Prescription not found", error: "Prescription not found" });
  }

  const expiresDate = parsed.expires ? new Date(parsed.expires) : existing.expires;
  if (parsed.expires && Number.isNaN(expiresDate.getTime())) {
    return res.status(400).json({ success: false, statusCode: 400, message: "Invalid expires date", error: "Invalid expires date" });
  }

  const updated = await prisma.prescription.update({
    where: { id: prescriptionId },
    data: {
      title: parsed.title ?? existing.title,
      description: parsed.description ?? existing.description,
      drug: parsed.drug ?? existing.drug,
      dose: parsed.dose ?? existing.dose,
      sig: parsed.sig ?? existing.sig,
      refills: parsed.refills ?? existing.refills,
      expires: expiresDate,
    },
  });

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Prescription updated",
    data: updated,
  });
}

export async function deletePrescriptionController(req: AuthenticatedRequest, res: Response) {
  const doctorId = req.user?.id;
  if (!doctorId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const { patientId, prescriptionId } = PrescriptionDetailParamsSchema.parse(req.params);

  const access = await ensurePatientAccess(doctorId, patientId);

  if (!access) {
    return res.status(403).json({ success: false, statusCode: 403, message: "Access not approved", error: "Access not approved" });
  }

  const existing = await prisma.prescription.findFirst({
    where: { id: prescriptionId, patientId },
  });

  if (!existing) {
    return res.status(404).json({ success: false, statusCode: 404, message: "Prescription not found", error: "Prescription not found" });
  }

  await prisma.prescription.delete({ where: { id: prescriptionId } });

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Prescription deleted",
  });
}


