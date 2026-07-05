import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import expressStatic from "serve-static";

import { authRouter } from "./routes/auth.routes";
import { patientRouter } from "./routes/patient.routes";
import { doctorRouter } from "./routes/doctor.routes";
import { adminRouter } from "./routes/admin.routes";
import { notificationRouter } from "./routes/notification.routes";
import { doctorAppointmentsRouter } from "./routes/doctor-appointments.routes";
import { doctorLabsRouter } from "./routes/doctor-labs.routes";
import { doctorFollowUpsRouter } from "./routes/doctor-followups.routes";
import { doctorPrescriptionsRouter } from "./routes/doctor-prescriptions.routes";
import { doctorDocumentsRouter } from "./routes/doctor-documents.routes";
import { patientPrescriptionsRouter } from "./routes/patient-prescriptions.routes";

import { documentRouter } from "./routes/document.routes";







const app = express();


app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/patient", patientRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/admin", adminRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/doctor", doctorAppointmentsRouter);
app.use("/api/doctor", doctorLabsRouter);
app.use("/api/doctor", doctorFollowUpsRouter);
app.use("/api/doctor", doctorPrescriptionsRouter);
app.use("/api/doctor", doctorDocumentsRouter);
app.use("/api/patient", patientPrescriptionsRouter);

app.use("/api", documentRouter);




// serve uploaded docs (filesystem uploads)
app.use("/uploads", expressStatic("uploads"));

// centralized error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const statusCode = typeof err?.statusCode === "number" ? err.statusCode : 500;
  const message = typeof err?.message === "string" ? err?.message : "Internal server error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    error: message,
  });
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[backend-api] listening on :${port}`);
});

