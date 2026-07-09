import type { Response } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../prisma.js";


const GetPendingLabsParamsSchema = z.object({
  patientId: z.string().min(1),
});

// Note: In this project schema there is no dedicated LabResult model.
// We treat MedicalRecord entries of type like "LAB" / "LAB_RESULT" / "LAB_REPORT" as "pending laboratory results".
export async function getDoctorPendingLabResultsController(req: AuthenticatedRequest, res: Response) {
  const doctorId = req.user?.id;
  if (!doctorId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const parsed = GetPendingLabsParamsSchema.parse(req.params);
  const { patientId } = parsed;

  // Gate access: only allow if doctor has APPROVED access for this patient.
  const access = await prisma.accessRequest.findFirst({
    where: { patientId, doctorId, status: "APPROVED" },
  });

  if (!access) {
    return res.status(403).json({ success: false, statusCode: 403, message: "Access not approved", error: "Access not approved" });
  }

  const labs = await prisma.medicalRecord.findMany({
    where: {
      patientId,
      type: {
        in: ["LAB", "LAB_RESULT", "LAB_REPORT"],
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Pending laboratory results retrieved",
    data: labs,
  });
}

