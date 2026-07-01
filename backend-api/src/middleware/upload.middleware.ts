import type { Request } from "express";

// Typed helper used by routes after multer parsing.
export type MulterFile = Express.Multer.File;

export function requireMulterFile(req: Request, fieldName: string) {
  const file = (req as any).file || (req as any).files?.[fieldName] || (req as any).files?.[0];
  if (!file) {
    const err: any = new Error(`Missing required file: ${fieldName}`);
    err.statusCode = 400;
    throw err;
  }
  return file as MulterFile;
}

