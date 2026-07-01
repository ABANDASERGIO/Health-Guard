import { Router } from "express";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";
import {
  getNotificationsController,
  markReadController,
  markAllReadController,
  createNotificationController,
} from "../controllers/notification.controller";

export const notificationRouter = Router();

notificationRouter.use(authenticateToken);

notificationRouter.get("/", getNotificationsController);
notificationRouter.post("/:id/read", markReadController);
notificationRouter.post("/read-all", markAllReadController);
notificationRouter.post("/", createNotificationController);