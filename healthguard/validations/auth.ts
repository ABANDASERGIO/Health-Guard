import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["patient", "doctor", "admin"], {
    message: "Select your role",
  }),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "Include an uppercase letter")
      .regex(/[0-9]/, "Include a number"),
    confirmPassword: z.string(),
    role: z.enum(["patient", "doctor", "admin"]),
    hospitalName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .superRefine((data, ctx) => {
    if (data.role === "doctor") {
      const h = data.hospitalName?.trim() ?? "";
      if (h.length < 2) {
        ctx.addIssue({
          code: "custom",
          message: "Hospital name is required for doctors",
          path: ["hospitalName"],
        });
      }
    }
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export const otpSchema = z.object({
  code: z
    .string()
    .length(6, "Enter the 6-digit code")
    .regex(/^\d+$/, "Digits only"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const accessRequestSchema = z.object({
  patientId: z.string().min(1, "Patient ID is required"),
  reason: z.string().min(10, "Provide a detailed reason (10+ characters)"),
  priority: z.enum(["low", "normal", "high", "critical"]),
  notes: z.string().optional(),
});

export const vitalsSchema = z
  .object({
    temperature: z.string().optional(),
    systolic: z.string().optional(),
    diastolic: z.string().optional(),
    heartRate: z.string().optional(),
    weight: z.string().optional(),
    symptoms: z.string().max(500).optional(),
  })
  .superRefine((data, ctx) => {
    const fields = [data.temperature, data.systolic, data.diastolic, data.heartRate, data.weight, data.symptoms];
    const filled = fields.some((v) => v !== undefined && String(v).trim().length > 0);
    if (!filled) {
      ctx.addIssue({
        code: "custom",
        message: "Enter at least one measurement or symptom note.",
        path: ["symptoms"],
      });
    }
  });
