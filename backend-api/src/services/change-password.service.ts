import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmNewPassword: z.string().min(1, "Please confirm your new password"),
});

type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

function assertPasswordMatch(input: ChangePasswordInput) {
  if (input.newPassword !== input.confirmNewPassword) {
    const err: any = new Error("New password and confirmation do not match");
    err.statusCode = 400;
    throw err;
  }
}

async function findUserByIdAndRole(userId: string, role: Role) {
  if (role === "PATIENT") {
    return prisma.patient.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  }
  if (role === "DOCTOR") {
    return prisma.doctor.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  }
  return prisma.administrator.findUnique({ where: { id: userId }, select: { passwordHash: true } });
}

async function updateUserPasswordByIdAndRole(userId: string, role: Role, passwordHash: string) {
  if (role === "PATIENT") {
    await prisma.patient.update({ where: { id: userId }, data: { passwordHash } });
    return;
  }
  if (role === "DOCTOR") {
    await prisma.doctor.update({ where: { id: userId }, data: { passwordHash } });
    return;
  }
  await prisma.administrator.update({ where: { id: userId }, data: { passwordHash } });
}

export async function changePasswordService(params: {
  userId: string;
  role: Role;
  input: unknown;
}) {
  const input = ChangePasswordSchema.parse(params.input);
  assertPasswordMatch(input);

  const user = await findUserByIdAndRole(params.userId, params.role);
  if (!user) {
    const err: any = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  const ok = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!ok) {
    const err: any = new Error("Current password is incorrect");
    err.statusCode = 401;
    throw err;
  }

  const newPasswordHash = await bcrypt.hash(input.newPassword, 10);
  await updateUserPasswordByIdAndRole(params.userId, params.role, newPasswordHash);

  return { changed: true };
}

