import { NextFunction, Request, Response } from "express";
import { Permission, hasPermission } from "../config/permissions";
import { AppError } from "./error.middleware";

export function requireRole(...roles: any[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      return next(new AppError(403, "FORBIDDEN", "You do not have the required role."));
    }
    return next();
  };
}

export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role || !hasPermission(role, permission)) {
      return next(new AppError(403, "FORBIDDEN", "You do not have permission to access this resource."));
    }
    return next();
  };
}

export function requireOwnershipOrPermission(permission: Permission, userIdParamName = "id") {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestedUserId = req.params[userIdParamName];
    const currentUserId = req.user?.id;
    const role = req.user?.role;

    if (!currentUserId || !role) {
      return next(new AppError(401, "UNAUTHORIZED", "Authentication required."));
    }

    if (currentUserId === requestedUserId || req.user?.role === "SUPER_ADMIN") {
      return next();
    }

    if (hasPermission(role, permission)) {
      return next();
    }

    return next(new AppError(403, "FORBIDDEN", "You do not have permission to access this resource."));
  };
}
