import type { Response } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../middleware/auth.middleware";
import { prisma } from "../prisma";


const GetFollowUpsParamsSchema = z.object({
  patientId: z.string().min(1),
});

// Step 3: "Follow-up Patients".
// The project schema doesn't have a dedicated FollowUp model.
// We interpret "follow-up needed" as:
// - patients whose AccessRequest is APPROVED for the doctor AND
// - have at least one medical record of type indicating pending review.
// The doctor-UI uses this within the context of a selected patientId route.
// We therefore return the selected patient if it matches criteria.

export async function getDoctorFollowUpPatientsController(req: AuthenticatedRequest, res: Response) {
  const doctorId = req.user?.id;
  if (!doctorId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const parsed = GetFollowUpsParamsSchema.parse(req.params);
  const { patientId } = parsed;

  const access = await prisma.accessRequest.findFirst({
    where: { patientId, doctorId, status: "APPROVED" },
  });

  if (!access) {
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "No follow-ups",
      data: [],
    });
  }

  // Heuristic: treat these medical record types as requiring follow-up review.
  const pendingRecordTypes = ["LAB", "LAB_RESULT", "LAB_REPORT", "DIAGNOSIS", "PRESCRIPTION"];

  const pendingRecordCount = await prisma.medicalRecord.count({
    where: {
      patientId,
      type: { in: pendingRecordTypes },
    },
  });

  if (pendingRecordCount === 0) {
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "No follow-ups",
      data: [],
    });
  }

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true, name: true, email: true, avatar: true },
  });

  if (!patient) {
    return res.status(404).json({ success: false, statusCode: 404, message: "Patient not found", error: "Patient not found" });
  }

  // Return a small list; UI will render.
  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Follow-up patients retrieved",
    data: [
      {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        avatar: patient.avatar,
        priority: "NORMAL",
      },
    ],
  });
}

