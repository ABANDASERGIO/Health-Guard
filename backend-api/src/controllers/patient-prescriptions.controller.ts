import type { Response } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { prisma } from "../prisma";

const GetActivePrescriptionsQuerySchema = z
  .object({
    // optional future use
    limit: z
      .string()
      .optional()
      .transform((v) => (v ? Number(v) : undefined)),
  })
  .optional();

// Patient-facing: fetch active prescriptions for the logged-in patient.
// Active is interpreted as: expires > now.
export async function getPatientActivePrescriptionsController(req: AuthenticatedRequest, res: Response) {
  const patientId = req.user?.id;
  if (!patientId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const parsed = GetActivePrescriptionsQuerySchema?.parse(req.query);
  const limit = typeof parsed?.limit === "number" && Number.isFinite(parsed.limit) ? Math.min(parsed.limit, 50) : 50;

  const now = new Date();

  // Prisma schema currently has Prescription without a direct doctorId.
  // For end-to-end doctor->patient, we can still return prescriptions as-is.
  // If you later add doctorId to Prescription, we can include doctor name here.
  const prescriptions = await prisma.prescription.findMany({
    where: {
      patientId,
      expires: { gt: now },
    },
    orderBy: { expires: "asc" },
    take: limit,
  });

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Active prescriptions retrieved",
    data: prescriptions,
  });
}

