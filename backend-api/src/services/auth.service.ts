import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { sendPasswordResetEmail } from "./email.service";

const prisma = new PrismaClient();

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

const RequestPasswordResetSchema = z.object({
  email: z.string().email(),
});

const VerifyPasswordResetOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6).regex(/^\d+$/),
});

const ResetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6).regex(/^\d+$/),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
});

type RegisterInput = z.infer<typeof RegisterSchema>;
type LoginInput = z.infer<typeof LoginSchema>;
type UserRecord = {
  model: "Patient" | "Doctor" | "Administrator";
  user: { id: string; email: string; passwordHash: string };
};

function signAccessToken(payload: { sub: string; role: Role; userId: string }) {
  const secret = (process.env.JWT_ACCESS_SECRET || "dev_access_secret") as jwt.Secret;
  const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as jwt.SignOptions["expiresIn"];
  return jwt.sign(payload, secret, { expiresIn });
}

function signRefreshToken(payload: { sub: string; userId: string; role: Role }) {
  const secret = (process.env.JWT_REFRESH_SECRET || "dev_refresh_secret") as jwt.Secret;
  const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];
  return jwt.sign(payload, secret, { expiresIn });
}

function toRole(roleStr: string): Role {
  const normalized = roleStr.toUpperCase();
  if (normalized === "ADMIN" || normalized === "DOCTOR" || normalized === "PATIENT") return normalized as Role;
  return "PATIENT";
}

async function resolveHospitalId(parsed: RegisterInput) {
  // hospitalId beats hospitalName
  let hospitalId: string | null = parsed.hospitalId || null;

  if (!hospitalId && parsed.hospitalName?.trim()) {
    const hospital = await prisma.hospital.findFirst({ where: { name: parsed.hospitalName.trim() } });
    if (hospital) hospitalId = hospital.id;
  }

  // Create hospital if hospitalName provided and not found
  if (!hospitalId && parsed.hospitalName?.trim()) {
    const created = await prisma.hospital.create({ data: { name: parsed.hospitalName.trim() } });
    hospitalId = created.id;
  }

  return hospitalId;
}

async function emailExistsAnywhere(email: string) {
  const [patient, doctor, admin] = await Promise.all([
    prisma.patient.findUnique({ where: { email } }),
    prisma.doctor.findUnique({ where: { email } }),
    prisma.administrator.findUnique({ where: { email } }),
  ]);
  return Boolean(patient || doctor || admin);
}

async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const [patient, doctor, admin] = await Promise.all([
    prisma.patient.findUnique({ where: { email } }),
    prisma.doctor.findUnique({ where: { email } }),
    prisma.administrator.findUnique({ where: { email } }),
  ]);

  if (patient) return { model: "Patient", user: { id: patient.id, email: patient.email, passwordHash: patient.passwordHash } };
  if (doctor) return { model: "Doctor", user: { id: doctor.id, email: doctor.email, passwordHash: doctor.passwordHash } };
  if (admin) return { model: "Administrator", user: { id: admin.id, email: admin.email, passwordHash: admin.passwordHash } };

  return null;
}

export async function registerService(input: RegisterInput) {
  const parsed = RegisterSchema.parse(input);
  const role = toRole(parsed.role);

  // Enforce hospital for DOCTOR/ADMIN, allow none for PATIENT
  const needsHospital = role === "DOCTOR" || role === "ADMIN";
  const hospitalId = needsHospital ? await resolveHospitalId(parsed) : null;

  if (needsHospital && !hospitalId) {
    throw Object.assign(new Error("hospitalId/hospitalName is required for DOCTOR and ADMIN"), { statusCode: 400 });
  }

  const existing = await emailExistsAnywhere(parsed.email);
  if (existing) {
    throw Object.assign(new Error("Email already registered"), { statusCode: 409 });
  }

  const passwordHash = await bcrypt.hash(parsed.password, 10);

  if (role === "PATIENT") {
    const created = await prisma.patient.create({
      data: {
        email: parsed.email,
        passwordHash,
        name: parsed.name,
        avatar: null,
      },
      select: { id: true, email: true, name: true, avatar: true },
    });

    const accessToken = signAccessToken({ sub: created.id, role, userId: created.id });
    const refreshToken = signRefreshToken({ sub: created.id, role, userId: created.id });
    return { user: { ...created, role }, accessToken, refreshToken };
  }

  if (role === "DOCTOR") {
    const created = await prisma.doctor.create({
      data: {
        email: parsed.email,
        passwordHash,
        name: parsed.name,
        avatar: null,
        hospitalId: hospitalId!,
      },
      select: { id: true, email: true, name: true, avatar: true },
    });

    const accessToken = signAccessToken({ sub: created.id, role, userId: created.id });
    const refreshToken = signRefreshToken({ sub: created.id, role, userId: created.id });
    return { user: { ...created, role }, accessToken, refreshToken };
  }

  // ADMIN
  const created = await prisma.administrator.create({
    data: {
      email: parsed.email,
      passwordHash,
      name: parsed.name,
      avatar: null,
      hospitalId: hospitalId!,
    },
    select: { id: true, email: true, name: true, avatar: true },
  });

  const accessToken = signAccessToken({ sub: created.id, role, userId: created.id });
  const refreshToken = signRefreshToken({ sub: created.id, role, userId: created.id });
  return { user: { ...created, role }, accessToken, refreshToken };
}

function getOtpPurpose(purpose?: string | null) {
  return (purpose && purpose.trim().length ? purpose.trim() : "EMAIL_VERIFICATION").toUpperCase();
}

function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function createOtp(email: string, purpose: string) {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const created = await prisma.otp.create({
    data: {
      email,
      purpose,
      code: generateOtpCode(),
      expiresAt,
    },
    select: { id: true, email: true, purpose: true, code: true, expiresAt: true },
  });

  return { otpId: created.id, email: created.email, purpose: created.purpose, code: created.code, expiresAt: created.expiresAt };
}

export async function requestOtpService(input: { email: string; purpose?: string }) {
  const purpose = getOtpPurpose(input.purpose);

  return createOtp(input.email, purpose);
}

export async function verifyOtpService(input: { email: string; otp: string; purpose?: string }) {
  const purpose = getOtpPurpose(input.purpose);
  const otp = input.otp.trim();

  const record = await prisma.otp.findFirst({
    where: { email: input.email, purpose, code: otp, consumedAt: null },
  });

  if (!record) {
    throw Object.assign(new Error("Invalid or already used OTP"), { statusCode: 400 });
  }

  if (record.expiresAt.getTime() < Date.now()) {
    throw Object.assign(new Error("OTP expired"), { statusCode: 400 });
  }

  await prisma.otp.update({
    where: { id: record.id },
    data: { consumedAt: new Date() },
  });

  return { verified: true };
}

export async function requestPasswordResetService(input: z.infer<typeof RequestPasswordResetSchema>) {
  const parsed = RequestPasswordResetSchema.parse(input);
  const user = await findUserByEmail(parsed.email);

  if (!user) {
    return { email: parsed.email, exists: false };
  }

  const otp = await createOtp(parsed.email, "PASSWORD_RESET");
  await sendPasswordResetEmail(parsed.email, otp.code);

  return { email: parsed.email, exists: true, expiresAt: otp.expiresAt };
}

export async function verifyPasswordResetOtpService(input: z.infer<typeof VerifyPasswordResetOtpSchema>) {
  const parsed = VerifyPasswordResetOtpSchema.parse(input);
  const record = await prisma.otp.findFirst({
    where: { email: parsed.email, purpose: "PASSWORD_RESET", code: parsed.otp, consumedAt: null },
  });

  if (!record) {
    throw Object.assign(new Error("Invalid or already used OTP"), { statusCode: 400 });
  }

  if (record.expiresAt.getTime() < Date.now()) {
    throw Object.assign(new Error("OTP expired"), { statusCode: 400 });
  }

  return { verified: true };
}

export async function resetPasswordService(input: z.infer<typeof ResetPasswordSchema>) {
  const parsed = ResetPasswordSchema.parse(input);

  if (parsed.password !== parsed.confirmPassword) {
    throw Object.assign(new Error("Passwords do not match"), { statusCode: 400 });
  }

  const user = await findUserByEmail(parsed.email);
  if (!user) {
    throw Object.assign(new Error("User not found"), { statusCode: 404 });
  }

  const record = await prisma.otp.findFirst({
    where: { email: parsed.email, purpose: "PASSWORD_RESET", code: parsed.otp, consumedAt: null },
  });

  if (!record) {
    throw Object.assign(new Error("Invalid or already used OTP"), { statusCode: 400 });
  }

  if (record.expiresAt.getTime() < Date.now()) {
    throw Object.assign(new Error("OTP expired"), { statusCode: 400 });
  }

  const passwordHash = await bcrypt.hash(parsed.password, 10);

  if (user.model === "Patient") {
    await prisma.$transaction([
      prisma.patient.update({ where: { id: user.user.id }, data: { passwordHash } }),
      prisma.otp.update({ where: { id: record.id }, data: { consumedAt: new Date() } }),
    ]);
  } else if (user.model === "Doctor") {
    await prisma.$transaction([
      prisma.doctor.update({ where: { id: user.user.id }, data: { passwordHash } }),
      prisma.otp.update({ where: { id: record.id }, data: { consumedAt: new Date() } }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.administrator.update({ where: { id: user.user.id }, data: { passwordHash } }),
      prisma.otp.update({ where: { id: record.id }, data: { consumedAt: new Date() } }),
    ]);
  }

  return { reset: true };
}

export async function loginService(input: LoginInput) {

  const parsed = LoginSchema.parse(input);

  // Try each table by email
  const [patient, doctor, admin] = await Promise.all([
    prisma.patient.findUnique({ where: { email: parsed.email } }),
    prisma.doctor.findUnique({ where: { email: parsed.email } }),
    prisma.administrator.findUnique({ where: { email: parsed.email } }),
  ]);

  const found = patient || doctor || admin;
  if (!found) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

  const passwordHash = (found as any).passwordHash as string;
  const ok = await bcrypt.compare(parsed.password, passwordHash);
  if (!ok) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

  // Determine role and payload
  if (patient) {
    const accessToken = signAccessToken({ sub: patient.id, role: "PATIENT", userId: patient.id });
    const refreshToken = signRefreshToken({ sub: patient.id, role: "PATIENT", userId: patient.id });
    return {
      user: { id: patient.id, email: patient.email, name: patient.name, role: "PATIENT", avatar: patient.avatar },
      accessToken,
      refreshToken,
    };
  }

  if (doctor) {
    const accessToken = signAccessToken({ sub: doctor.id, role: "DOCTOR", userId: doctor.id });
    const refreshToken = signRefreshToken({ sub: doctor.id, role: "DOCTOR", userId: doctor.id });
    return {
      user: { id: doctor.id, email: doctor.email, name: doctor.name, role: "DOCTOR", avatar: doctor.avatar },
      accessToken,
      refreshToken,
    };
  }

  const accessToken = signAccessToken({ sub: (admin as any).id, role: "ADMIN", userId: (admin as any).id });
  const refreshToken = signRefreshToken({ sub: (admin as any).id, role: "ADMIN", userId: (admin as any).id });
  return {
    user: { id: (admin as any).id, email: (admin as any).email, name: (admin as any).name, role: "ADMIN", avatar: (admin as any).avatar },
    accessToken,
    refreshToken,
  };
}


