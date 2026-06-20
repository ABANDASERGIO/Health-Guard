import { Router } from "express";
import { registerController, loginController, verifyOtpController, refreshTokenController, logoutController } from "../controllers/auth.controller";

export const authRouter = Router();

authRouter.post("/register", registerController);
authRouter.post("/login", loginController);

authRouter.post("/verify-otp", verifyOtpController);
authRouter.post("/refresh-token", refreshTokenController);
authRouter.post("/logout", logoutController);

