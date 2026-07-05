import type { Response } from "express";
import { z } from "zod";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

import type { AuthenticatedRequest } from "../middleware/auth.middleware";

const prisma = new PrismaClient();

const UploadDocSchema = z.object({
  type: z.string().min(1),
  name: z.string().min(1),
});

function ensureUploadDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

export async function uploadPatientDocumentController(req: AuthenticatedRequest, res: Response) {
  const patientId = req.user?.id;
  if (!patientId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const parsedBody = UploadDocSchema.safeParse((req.body ?? {}) as any);
  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: "Invalid request",
      error: parsedBody.error.message,
    });
  }

  const file = (req as any).file as { filename?: string } | undefined;
  if (!file?.filename) {
    return res.status(400).json({ success: false, statusCode: 400, message: "Missing file", error: "Missing file" });
  }

  const uploadsDir = path.join(process.cwd(), "uploads");
  ensureUploadDir(uploadsDir);

  const fileUrl = `/uploads/${file.filename}`;

  const created = await prisma.document.create({
    data: {
      patientId,
      name: parsedBody.data.name,
      type: parsedBody.data.type,
      url: fileUrl,
      fileId: file.filename,
    },
    select: { id: true, name: true, type: true, url: true, fileId: true, createdAt: true, patientId: true },
  });

  return res.status(201).json({
    success: true,
    statusCode: 201,
    message: "Document uploaded",
    data: created,
  });
}

export async function deletePatientDocumentController(req: AuthenticatedRequest, res: Response) {
  const patientId = req.user?.id;
  if (!patientId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const documentId = req.params.id;
  if (!documentId) {
    return res.status(400).json({ success: false, statusCode: 400, message: "Document ID is required", error: "Document ID is required" });
  }

  const existing = await prisma.document.findFirst({
    where: { id: documentId, patientId },
  });

  if (!existing) {
    return res.status(404).json({ success: false, statusCode: 404, message: "Document not found", error: "Document not found" });
  }

  const filePath = path.join(process.cwd(), "uploads", existing.fileId || "");
  if (existing.fileId && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkErr) {
      console.error("Failed to delete document file:", unlinkErr);
    }
  }

  await prisma.document.delete({ where: { id: documentId } });

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Document deleted",
    data: { id: documentId },
  });
}

