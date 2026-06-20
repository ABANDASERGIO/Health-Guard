import type { Request, Response } from "express";
import { z } from "zod";

import { registerService, loginService } from "../services/auth.service";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  name: z.string().min(1),
  role: z.string().min(1),
  hospitalId: z.string().optional(),
  hospitalName: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerController(req: Request, res: Response) {
  try {
    const body = RegisterSchema.parse(req.body);

    if (body.password !== body.confirmPassword) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Passwords do not match",
        error: "Passwords do not match",
      });
    }

    const data = await registerService(body);
    return res.status(201).json({ success: true, statusCode: 201, message: "Registered successfully", data });
  } catch (err: any) {
    const statusCode = err?.statusCode || 400;
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message: err?.message || "Registration failed",
      error: err?.message || "Registration failed",
    });
  }
}

export async function loginController(req: Request, res: Response) {
  try {
    const body = LoginSchema.parse(req.body);
    const data = await loginService(body);
    return res.status(200).json({ success: true, statusCode: 200, message: "Login successful", data });
  } catch (err: any) {
    const statusCode = err?.statusCode || 401;
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message: err?.message || "Login failed",
      error: err?.message || "Login failed",
    });
  }
}

// Stubs (frontend currently routes exist; implement later once register/login works)
export async function verifyOtpController(_req: Request, res: Response) {
  return res.status(501).json({ success: false, statusCode: 501, message: "Not implemented", error: "Not implemented" });
}

export async function refreshTokenController(_req: Request, res: Response) {
  return res.status(501).json({ success: false, statusCode: 501, message: "Not implemented", error: "Not implemented" });
}

export async function logoutController(_req: Request, res: Response) {
  return res.status(200).json({ success: true, statusCode: 200, message: "Logged out" });
}

