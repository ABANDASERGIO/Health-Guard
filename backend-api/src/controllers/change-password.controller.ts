import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";
import { changePasswordService } from "../services/change-password.service.js";

function getBearerToken(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7);
}

export async function changePasswordController(req: Request, res: Response) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Access token required",
        error: "Access token required",
      });
    }

    const secret = process.env.JWT_ACCESS_SECRET || "dev_access_secret";
    const payload = jwt.verify(token, secret) as { sub: string; role: Role; userId?: string };

    if (!payload?.sub || !payload?.role) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Invalid access token",
        error: "Invalid access token",
      });
    }

    const data = await changePasswordService({
      userId: payload.sub,
      role: payload.role,
      input: req.body,
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Password changed successfully",
      data,
    });
  } catch (err: any) {
    const statusCode = typeof err?.statusCode === "number" ? err.statusCode : 500;
    const message = err?.message || "Password change failed";

    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      error: message,
    });
  }
}

