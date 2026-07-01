import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { Role } from "@prisma/client";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: Role;
    email?: string;
  };
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Access token required",
      error: "Access token required",
    });
  }

  const token = authHeader.slice(7);
  const secret = process.env.JWT_ACCESS_SECRET || "dev_access_secret";

  try {
    const payload = jwt.verify(token, secret) as { sub: string; role: Role; userId?: string };
    req.user = {
      id: payload.sub,
      role: payload.role,
      email: undefined,
    };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Invalid or expired access token",
      error: "Invalid or expired access token",
    });
  }
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Authentication required",
        error: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        statusCode: 403,
        message: "Insufficient permissions",
        error: "Insufficient permissions",
      });
    }

    next();
  };
}