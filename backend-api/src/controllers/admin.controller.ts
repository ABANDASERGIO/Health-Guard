import type { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const prisma = new PrismaClient();

const CreateHospitalSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
});

const UpdateHospitalSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
});

const DoctorStatusSchema = z.enum(["active", "inactive"]);

const CreateDoctorSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  specialty: z.string().optional(),
  phone: z.string().optional(),
  status: DoctorStatusSchema.optional().default("active"),
});

const UpdateDoctorSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  specialty: z.string().optional(),
  phone: z.string().optional(),
  status: DoctorStatusSchema.optional(),
});

const DoctorQuerySchema = z.object({
  search: z.string().optional(),
  status: DoctorStatusSchema.optional(),
});

const UpdateAdminSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
});

async function getHospitalIdForAdmin(adminId: string) {
  const admin = await prisma.administrator.findUnique({
    where: { id: adminId },
    select: { hospitalId: true },
  });

  if (!admin) {
    throw new Error("Administrator not found");
  }

  return admin.hospitalId;
}

export async function getDashboardStatsController(req: AuthenticatedRequest, res: Response) {
  const adminId = req.user?.id;
  if (!adminId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  let hospitalId: string;
  try {
    hospitalId = await getHospitalIdForAdmin(adminId);
  } catch (error) {
    return res.status(404).json({ success: false, statusCode: 404, message: "Administrator not found", error: "Administrator not found" });
  }

  const [totalDoctors, activeDoctors, inactiveDoctors, patientsUnderCare, recentNotifications] = await Promise.all([
    prisma.doctor.count({ where: { hospitalId } }),
    prisma.doctor.count({ where: { hospitalId, status: "active" } }),
    prisma.doctor.count({ where: { hospitalId, status: "inactive" } }),
    prisma.patient.count({
      where: {
        accessRequests: {
          some: {
            status: "APPROVED",
            doctor: { hospitalId },
          },
        },
      },
    }),
    prisma.notification.findMany({
      where: { audience: "admin" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Dashboard stats retrieved",
    data: {
      totalDoctors,
      activeDoctors,
      inactiveDoctors,
      patientsUnderCare,
      recentNotifications,
    },
  });
}

export async function getDoctorsController(req: AuthenticatedRequest, res: Response) {
  const adminId = req.user?.id;
  if (!adminId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const query = DoctorQuerySchema.parse({
    search: req.query.search as string | undefined,
    status: req.query.status as string | undefined,
  });

  let hospitalId: string;
  try {
    hospitalId = await getHospitalIdForAdmin(adminId);
  } catch (error) {
    return res.status(404).json({ success: false, statusCode: 404, message: "Administrator not found", error: "Administrator not found" });
  }

  const where: any = { hospitalId };

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
      { specialty: { contains: query.search, mode: "insensitive" } },
    ];
  }
  if (query.status) {
    where.status = query.status;
  }

  const doctors = await prisma.doctor.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      specialty: true,
      phone: true,
      status: true,
      createdAt: true,
      _count: { select: { accessRequests: true } },
    },
  });

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Doctors retrieved",
    data: doctors.map((doctor) => ({
      ...doctor,
      assignedPatients: doctor._count.accessRequests,
    })),
  });
}

export async function getPatientsController(req: AuthenticatedRequest, res: Response) {
  const adminId = req.user?.id;
  if (!adminId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  let hospitalId: string;
  try {
    hospitalId = await getHospitalIdForAdmin(adminId);
  } catch (error) {
    return res.status(404).json({ success: false, statusCode: 404, message: "Administrator not found", error: "Administrator not found" });
  }

  const patients = await prisma.patient.findMany({
    where: {
      accessRequests: {
        some: {
          status: "APPROVED",
          doctor: { hospitalId },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      accessRequests: {
        where: {
          status: "APPROVED",
          doctor: { hospitalId },
        },
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { doctor: { select: { name: true } } },
      },
      _count: {
        select: { documents: true, appointments: true },
      },
    },
  });

  const mapped = patients.map((patient) => ({
    id: patient.id,
    name: patient.name,
    assignedDoctor: patient.accessRequests?.[0]?.doctor?.name ?? "Care team",
    medicalDocuments: patient._count.documents,
    appointments: patient._count.appointments,
    accessStatus: patient.accessRequests?.[0]?.status === "APPROVED" ? "Approved" : "Pending",
  }));

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Patients retrieved",
    data: mapped,
  });
}

export async function createDoctorController(req: AuthenticatedRequest, res: Response) {
  const adminId = req.user?.id;
  if (!adminId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const parsed = CreateDoctorSchema.parse(req.body);
  if (parsed.password !== parsed.confirmPassword) {
    return res.status(400).json({ success: false, statusCode: 400, message: "Passwords do not match", error: "Passwords do not match" });
  }

  let hospitalId: string;
  try {
    hospitalId = await getHospitalIdForAdmin(adminId);
  } catch (error) {
    return res.status(404).json({ success: false, statusCode: 404, message: "Administrator not found", error: "Administrator not found" });
  }

  const existingDoctor = await prisma.doctor.findUnique({ where: { email: parsed.email } });
  if (existingDoctor) {
    return res.status(409).json({ success: false, statusCode: 409, message: "Doctor email already exists", error: "Doctor email already exists" });
  }

  const passwordHash = await bcrypt.hash(parsed.password, 10);
  const doctor = await prisma.doctor.create({
    data: {
      email: parsed.email,
      passwordHash,
      name: parsed.name,
      specialty: parsed.specialty ?? null,
      phone: parsed.phone ?? null,
      status: parsed.status,
      hospitalId,
    },
  });

  await prisma.notification.create({
    data: {
      audience: "admin",
      type: "system",
      title: "New doctor created",
      description: `Dr. ${doctor.name} was added to your hospital.`,
      link: "/admin/notifications",
    },
  });

  return res.status(201).json({ success: true, statusCode: 201, message: "Doctor created", data: doctor });
}

export async function updateDoctorController(req: AuthenticatedRequest, res: Response) {
  const adminId = req.user?.id;
  if (!adminId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const doctorId = req.params.id;
  const parsed = UpdateDoctorSchema.parse(req.body);

  let hospitalId: string;
  try {
    hospitalId = await getHospitalIdForAdmin(adminId);
  } catch (error) {
    return res.status(404).json({ success: false, statusCode: 404, message: "Administrator not found", error: "Administrator not found" });
  }

  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId }, select: { hospitalId: true } });
  if (!doctor || doctor.hospitalId !== hospitalId) {
    return res.status(404).json({ success: false, statusCode: 404, message: "Doctor not found", error: "Doctor not found" });
  }

  if (parsed.email) {
    const existingDoctor = await prisma.doctor.findFirst({
      where: { email: parsed.email, id: { not: doctorId } },
    });
    if (existingDoctor) {
      return res.status(409).json({ success: false, statusCode: 409, message: "Doctor email already exists", error: "Doctor email already exists" });
    }
  }

  const existingDoctor = await prisma.doctor.findUnique({ where: { id: doctorId } });

  const updated = await prisma.doctor.update({
    where: { id: doctorId },
    data: parsed,
  });

  if (existingDoctor && parsed.status && parsed.status !== existingDoctor.status) {
    const statusLabel = parsed.status === "active" ? "activated" : "deactivated";
    await prisma.notification.create({
      data: {
        audience: "admin",
        type: "system",
        title: `Doctor account ${statusLabel}`,
        description: `Dr. ${updated.name} was ${statusLabel}.`,
        link: "/admin/notifications",
      },
    });
  }

  return res.status(200).json({ success: true, statusCode: 200, message: "Doctor updated", data: updated });
}

export async function deleteDoctorController(req: AuthenticatedRequest, res: Response) {
  const adminId = req.user?.id;
  if (!adminId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const doctorId = req.params.id;

  let hospitalId: string;
  try {
    hospitalId = await getHospitalIdForAdmin(adminId);
  } catch (error) {
    return res.status(404).json({ success: false, statusCode: 404, message: "Administrator not found", error: "Administrator not found" });
  }

  const doctor = await prisma.doctor.findUnique({ where: { id: doctorId }, select: { hospitalId: true } });
  if (!doctor || doctor.hospitalId !== hospitalId) {
    return res.status(404).json({ success: false, statusCode: 404, message: "Doctor not found", error: "Doctor not found" });
  }

  await prisma.doctor.delete({ where: { id: doctorId } });

  return res.status(200).json({ success: true, statusCode: 200, message: "Doctor deleted" });
}

export async function getHospitalsController(req: AuthenticatedRequest, res: Response) {
  const hospitals = await prisma.hospital.findMany();
  return res.status(200).json({ success: true, statusCode: 200, message: "Hospitals retrieved", data: hospitals });
}

export async function getHospitalProfileController(req: AuthenticatedRequest, res: Response) {
  const adminId = req.user?.id;
  if (!adminId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  let hospitalId: string;
  try {
    hospitalId = await getHospitalIdForAdmin(adminId);
  } catch (error) {
    return res.status(404).json({ success: false, statusCode: 404, message: "Administrator not found", error: "Administrator not found" });
  }

  const hospital = await prisma.hospital.findUnique({
    where: { id: hospitalId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      description: true,
    },
  });

  if (!hospital) {
    return res.status(404).json({ success: false, statusCode: 404, message: "Hospital not found", error: "Hospital not found" });
  }

  return res.status(200).json({ success: true, statusCode: 200, message: "Hospital profile retrieved", data: hospital });
}

export async function updateHospitalProfileController(req: AuthenticatedRequest, res: Response) {
  const adminId = req.user?.id;
  if (!adminId) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const parsed = UpdateHospitalSchema.parse(req.body);

  let hospitalId: string;
  try {
    hospitalId = await getHospitalIdForAdmin(adminId);
  } catch (error) {
    return res.status(404).json({ success: false, statusCode: 404, message: "Administrator not found", error: "Administrator not found" });
  }

  const updated = await prisma.hospital.update({
    where: { id: hospitalId },
    data: parsed,
  });

  return res.status(200).json({ success: true, statusCode: 200, message: "Hospital profile updated", data: updated });
}

export async function createHospitalController(req: AuthenticatedRequest, res: Response) {
  const parsed = CreateHospitalSchema.parse(req.body);

  const hospital = await prisma.hospital.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      address: parsed.address,
      description: parsed.description,
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

export async function getAdminProfileController(req: AuthenticatedRequest, res: Response) {
  try {
    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const admin = await prisma.administrator.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        hospitalId: true,
        createdAt: true,
      },
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Administrator not found",
      });
    }

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Admin profile retrieved",
      data: admin,
    });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to retrieve admin profile",
    });
  }
}

export async function updateAdminProfileController(req: AuthenticatedRequest, res: Response) {
  try {
    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const body = UpdateAdminSchema.parse(req.body);

    const admin = await prisma.administrator.update({
      where: { id: adminId },
      data: body,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        hospitalId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Admin profile updated successfully",
      data: admin,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Validation error",
        errors: error.issues,
      });
    }
    console.error("Error updating admin profile:", error);
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Failed to update admin profile",
    });
  }
}