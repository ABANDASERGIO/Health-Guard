import type { Response } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../prisma.js";


const GetDocumentsParamsSchema = z.object({
  patientId: z.string().min(1),
});

// Step 5: "New Patient Documents" (doctor-side view)
// No dedicated "new" flag exists, so we interpret "new" as:
// - patient has APPROVED access for this doctor
// - documents created within the last 14 days
export async function getDoctorNewPatientDocumentsController(req: AuthenticatedRequest, res: Response) {
  const doctorId = req.user?.id;
  if (!doctorId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const parsed = GetDocumentsParamsSchema.parse(req.params);
  const { patientId } = parsed;

  const access = await prisma.accessRequest.findFirst({
    where: { patientId, doctorId, status: "APPROVED" },
  });

  if (!access) {
    return res.status(403).json({ success: false, statusCode: 403, message: "Access not approved", error: "Access not approved" });
  }

  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

  const docs = await prisma.document.findMany({
    where: {
      patientId,
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      patientId: true,
      name: true,
      type: true,
      url: true,
      fileId: true,
      createdAt: true,
    },
  });

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "New patient documents retrieved",
    data: docs,
  });
}

