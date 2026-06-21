import type { Request, Response } from "express";
import { z } from "zod";

import { registerService, loginService, verifyOtpService, requestOtpService, requestPasswordResetService, verifyPasswordResetOtpService, resetPasswordService } from "../services/auth.service";


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
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message: err?.message || "OTP request failed",
      error: err?.message || "OTP request failed",
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
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message: err?.message || "Password reset request failed",
      error: err?.message || "Password reset request failed",
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
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message: err?.message || "OTP verification failed",
      error: err?.message || "OTP verification failed",
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
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message: err?.message || "Password reset failed",
      error: err?.message || "Password reset failed",
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
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message: err?.message || "OTP verification failed",
      error: err?.message || "OTP verification failed",
    });
  }
}


export async function refreshTokenController(_req: Request, res: Response) {
  // Not implemented yet: depends on how you store refresh token (cookie vs localStorage)
  return res.status(501).json({ success: false, statusCode: 501, message: "Not implemented", error: "Not implemented" });
}

export async function logoutController(_req: Request, res: Response) {
  // If you switch to cookie-based refresh, clear cookies here.
  return res.status(200).json({ success: true, statusCode: 200, message: "Logged out" });
}


