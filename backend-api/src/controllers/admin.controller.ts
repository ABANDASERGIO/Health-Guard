import type { Request, Response } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const prisma = new PrismaClient();

const CreateHospitalSchema = z.object({
  name: z.string().min(1),
  region: z.string().optional(),
  beds: z.number().optional(),
  address: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  licenseCode: z.string().optional(),
  status: z.enum(["active", "maintenance"]).optional().default("active"),
});

export async function getDashboardStatsController(req: AuthenticatedRequest, res: Response) {
  const adminId = req.user?.id;

  const [patientCount, doctorCount, hospitalCount] = await Promise.all([
    prisma.patient.count(),
    prisma.doctor.count(),
    prisma.hospital.count(),
  ]);

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Dashboard stats retrieved",
    data: {
      patients: patientCount,
      doctors: doctorCount,
      hospitals: hospitalCount,
    },
  });
}

export async function getHospitalsController(req: AuthenticatedRequest, res: Response) {
  const hospitals = await prisma.hospital.findMany();
  return res.status(200).json({ success: true, statusCode: 200, message: "Hospitals retrieved", data: hospitals });
}

export async function createHospitalController(req: AuthenticatedRequest, res: Response) {
  const parsed = CreateHospitalSchema.parse(req.body);

  const hospital = await prisma.hospital.create({
    data: {
      name: parsed.name,
    },
  });

  return res.status(201).json({ success: true, statusCode: 201, message: "Hospital created", data: hospital });
}

export async function deleteHospitalController(req: AuthenticatedRequest, res: Response) {
  const hospitalId = req.params.id;

  await prisma.hospital.delete({ where: { id: hospitalId } });

  return res.status(200).json({ success: true, statusCode: 200, message: "Hospital deleted" });
}

export async function getPersonnelController(req: AuthenticatedRequest, res: Response) {
  const hospitalId = req.query.hospitalId as string | undefined;

  const where = hospitalId ? { hospitalId } : {};

  const [doctors, admins] = await Promise.all([
    prisma.doctor.findMany({ where, select: { id: true, name: true, email: true } }),
    prisma.administrator.findMany({ where, select: { id: true, name: true, email: true } }),
  ]);

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Personnel retrieved",
    data: { doctors, admins },
  });
}

export async function invitePersonnelController(req: AuthenticatedRequest, res: Response) {
  return res.status(200).json({ success: true, statusCode: 200, message: "Invite sent (mock)" });
}

export async function getSystemLogsController(req: AuthenticatedRequest, res: Response) {
  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "System logs retrieved (mock)",
    data: [],
  });
}

export async function getLoginHistoryController(req: AuthenticatedRequest, res: Response) {
  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Login history retrieved (mock)",
    data: [],
  });
}