import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";
import multer from "multer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMulter = any;
import path from "path";
import fs from "fs";

import { uploadPatientDocumentController, deletePatientDocumentController } from "../controllers/document.controller";

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = (multer as AnyMulter).diskStorage({
  destination: (_req: any, _file: any, cb: any) => cb(null, uploadsDir),
  filename: (_req: any, file: any, cb: any) => {

    const safeName = file.originalname.replace(/[^a-z0-9._-]/gi, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const upload = (multer as AnyMulter)({ storage });

export const documentRouter = Router();

documentRouter.use(authenticateToken);

documentRouter.post(
  "/patient/documents",
  requireRole("PATIENT"),
  upload.single("file"),
  uploadPatientDocumentController
);

documentRouter.delete(
  "/patient/documents/:id",
  requireRole("PATIENT"),
  deletePatientDocumentController
);

