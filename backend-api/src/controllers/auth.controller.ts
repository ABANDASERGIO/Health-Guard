import type { Request, Response } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { PrismaClient, Role } from "@prisma/client";

import {
  registerService,
  loginService,
  verifyOtpService,
  requestOtpService,
  requestPasswordResetService,
  verifyPasswordResetOtpService,
  resetPasswordService,
} from "../services/auth.service.js";


const prisma = new PrismaClient();
const isDev = process.env.NODE_ENV !== "production";


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

    // Safe, user-friendly messages (avoid leaking internal details)
    // Prisma unique constraint error commonly appears as code "P2002".
    const isUniqueViolation = err?.code === "P2002";
    if (isUniqueViolation) {
      return res.status(409).json({
        success: false,
        statusCode: 409,
        message: "Email already registered",
        error: "Email already registered",
      });
    }

    const message = err?.message || "Unable to complete registration. Please try again later.";

    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      error: message,
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
    const isPrismaKnown = typeof err?.code === "string";
    const defaultMessage = isPrismaKnown ? "Unable to sign in right now. Please try again later." : (err?.message || "Login failed");
    const actualMessage = err?.message || defaultMessage;

    console.error("[loginController] login failure", {
      message: actualMessage,
      statusCode,
      code: err?.code,
      stack: err?.stack,
      error: err,
    });

    return res.status(statusCode).json({
      success: false,
      statusCode,
      message: defaultMessage,
      error: isDev ? actualMessage : defaultMessage,
    });
  }
}

const RequestOtpSchema = z.object({
  email: z.string().email(),
  purpose: z.string().min(1).optional().default("EMAIL_VERIFICATION"),
});

export async function requestOtpController(req: Request, res: Response) {
  try {
    const body = RequestOtpSchema.parse(req.body);
    const data = await requestOtpService({ email: body.email, purpose: body.purpose });

    // Dev note: auth.service returns the OTP code. In production you’d send it out-of-band.
    return res.status(200).json({ success: true, statusCode: 200, message: "OTP requested", data });
  } catch (err: any) {
    const statusCode = err?.statusCode || 400;

    const isPrismaKnown = typeof err?.code === "string";
    const message = isPrismaKnown ? "Unable to request OTP right now. Please try again later." : (err?.message || "OTP request failed");

    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      error: message,
    });
  }
}

const RequestPasswordResetSchema = z.object({
  email: z.string().email(),
});

export async function requestPasswordResetController(req: Request, res: Response) {
  try {
    const body = RequestPasswordResetSchema.parse(req.body);
    const data = await requestPasswordResetService(body);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Password reset instructions sent",
      data,
    });
  } catch (err: any) {
    const statusCode = err?.statusCode || 400;

    const isPrismaKnown = typeof err?.code === "string";
    const message = isPrismaKnown ? "Unable to send password reset instructions right now. Please try again later." : (err?.message || "Password reset request failed");

    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      error: message,
    });
  }
}

const VerifyPasswordResetOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6).regex(/^\d+$/),
});

export async function verifyPasswordResetOtpController(req: Request, res: Response) {
  try {
    const body = VerifyPasswordResetOtpSchema.parse(req.body);
    const data = await verifyPasswordResetOtpService(body);

    return res.status(200).json({ success: true, statusCode: 200, message: "OTP verified", data });
  } catch (err: any) {
    const statusCode = err?.statusCode || 400;

    const isPrismaKnown = typeof err?.code === "string";
    const message = isPrismaKnown ? "OTP verification failed. Please try again later." : (err?.message || "OTP verification failed");

    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      error: message,
    });
  }
}

const ResetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6).regex(/^\d+$/),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
});

export async function resetPasswordController(req: Request, res: Response) {
  try {
    const body = ResetPasswordSchema.parse(req.body);

    if (body.password !== body.confirmPassword) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Passwords do not match",
        error: "Passwords do not match",
      });
    }

    const data = await resetPasswordService(body);

    return res.status(200).json({ success: true, statusCode: 200, message: "Password reset successful", data });
  } catch (err: any) {
    const statusCode = err?.statusCode || 400;

    const isPrismaKnown = typeof err?.code === "string";
    const message = isPrismaKnown ? "Unable to reset password right now. Please try again later." : (err?.message || "Password reset failed");

    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      error: message,
    });
  }
}

const VerifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6).regex(/^\d+$/),
  purpose: z.string().min(1).optional().default("EMAIL_VERIFICATION"),
});

export async function verifyOtpController(req: Request, res: Response) {
  try {
    const body = VerifyOtpSchema.parse(req.body);

    // For this project step: verify code + mark consumed.
    // If you later implement email/SMS dispatch, this endpoint will connect to it.
    const data = await verifyOtpService(body);

    return res.status(200).json({ success: true, statusCode: 200, message: "OTP verified", data });
  } catch (err: any) {
    const statusCode = err?.statusCode || 400;

    const isPrismaKnown = typeof err?.code === "string";
    const message = isPrismaKnown ? "OTP verification failed. Please try again later." : (err?.message || "OTP verification failed");

    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      error: message,
    });
  }
}


export async function refreshTokenController(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "No refresh token provided",
        error: "No refresh token provided",
      });
    }

const token = authHeader.slice(7);
    const record = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!record) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Invalid refresh token",
        error: "Invalid refresh token",
      });
    }

    if (record.expiresAt.getTime() < Date.now()) {
      await prisma.refreshToken.delete({ where: { id: record.id } });
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Refresh token expired",
        error: "Refresh token expired",
      });
    }

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET || "dev_refresh_secret") as { sub: string; role: Role; userId?: string };
    const secret = (process.env.JWT_ACCESS_SECRET || "dev_access_secret") as jwt.Secret;
    const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as jwt.SignOptions["expiresIn"];
    const accessToken = jwt.sign({ sub: payload.sub, role: payload.role, userId: payload.sub }, secret, { expiresIn });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Token refreshed",
      data: { accessToken },
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Invalid refresh token",
      error: "Invalid refresh token",
    });
  }
}

export async function logoutController(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      await prisma.refreshToken.deleteMany({ where: { token } });
    }
  } catch (err) {
    console.error("Logout cleanup failed:", err);
  }

  return res.status(200).json({ success: true, statusCode: 200, message: "Logged out" });
}


