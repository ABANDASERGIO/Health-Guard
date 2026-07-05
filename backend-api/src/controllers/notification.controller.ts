import type { Request, Response } from "express";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const prisma = new PrismaClient();

const CreateNotificationSchema = z.object({
  audience: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.string(),
  link: z.string().optional(),
});

export async function createNotificationController(req: Request, res: Response) {
  const parsed = CreateNotificationSchema.parse(req.body);
  const normalizedAudience = parsed.audience.toLowerCase();

  const notification = await prisma.notification.create({
    data: {
      ...parsed,
      audience: normalizedAudience,
    },
  });

  return res.status(201).json({ success: true, statusCode: 201, message: "Notification created", data: notification });
}

export async function getNotificationsController(req: AuthenticatedRequest, res: Response) {
  const role = req.user?.role;
  if (!role) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  const requestedAudience = role.toLowerCase();
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
  });

  const scopedNotifications = notifications.filter((notification) => notification.audience.toLowerCase() === requestedAudience);

  return res.status(200).json({ success: true, statusCode: 200, message: "Notifications retrieved", data: scopedNotifications });
}

export async function markReadController(req: AuthenticatedRequest, res: Response) {
  const id = req.params.id;

  await prisma.notification.update({
    where: { id },
    data: { read: true },
  });

  return res.status(200).json({ success: true, statusCode: 200, message: "Notification marked read" });
}

export async function markAllReadController(req: AuthenticatedRequest, res: Response) {
  const role = req.user?.role;
  if (!role) {
    return res.status(401).json({ success: false, statusCode: 401, message: "Unauthorized", error: "Unauthorized" });
  }

  await prisma.notification.updateMany({
    where: { audience: role.toLowerCase(), read: false },
    data: { read: true },
  });

  return res.status(200).json({ success: true, statusCode: 200, message: "All notifications marked read" });
}