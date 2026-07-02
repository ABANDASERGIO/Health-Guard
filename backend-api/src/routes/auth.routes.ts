import { Router } from "express";
import {
  registerController,
  loginController,
  verifyOtpController,
  refreshTokenController,
  logoutController,
  requestOtpController,
  requestPasswordResetController,
  verifyPasswordResetOtpController,
  resetPasswordController,
} from "../controllers/auth.controller";
import { changePasswordController } from "../controllers/change-password.controller";

export const authRouter = Router();

authRouter.post("/request-otp", requestOtpController);
authRouter.post("/request-password-reset", requestPasswordResetController);
authRouter.post("/verify-password-reset-otp", verifyPasswordResetOtpController);
authRouter.post("/reset-password", resetPasswordController);
authRouter.post("/change-password", changePasswordController);

authRouter.post("/register", registerController);

authRouter.post("/login", loginController);

authRouter.post("/verify-otp", verifyOtpController);
authRouter.post("/refresh-token", refreshTokenController);
authRouter.post("/logout", logoutController);

