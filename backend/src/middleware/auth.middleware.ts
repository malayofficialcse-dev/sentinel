import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database";
import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "./error.middleware";

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError(401, "UNAUTHORIZED", "Authentication required."));
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        organizationId: true,
        status: true
      }
    });

    if (!user) {
      return next(new AppError(401, "UNAUTHORIZED", "User no longer exists."));
    }

    if (user.status === "INACTIVE" || user.status === "SUSPENDED") {
      return next(new AppError(403, "ACCOUNT_DISABLED", "User account is inactive or suspended."));
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      status: user.status
    };

    return next();
  } catch (error) {
    return next(new AppError(401, "INVALID_TOKEN", "Invalid or expired access token."));
  }
}
