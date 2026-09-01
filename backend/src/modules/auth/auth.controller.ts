import { Request, Response, NextFunction } from "express";
import { AppError } from "../../middleware/error.middleware";
import {
  changePassword,
  loginUser,
  logoutUser,
  refreshUserToken,
  registerUser
} from "./auth.service";

export async function registerController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await registerUser(req.body);
    return res.status(201).json({ success: true, data: result.user, message: "User registered successfully.", tokens: result.tokens });
  } catch (error) {
    return next(error instanceof AppError ? error : new AppError(500, "REGISTRATION_FAILED", "User registration failed."));
  }
}

export async function loginController(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await loginUser(req.body);
    return res.status(200).json({ success: true, data: result.user, message: "Login successful.", tokens: result.tokens });
  } catch (error) {
    return next(error instanceof AppError ? error : new AppError(500, "LOGIN_FAILED", "Login failed."));
  }
}

export async function refreshController(req: Request, res: Response, next: NextFunction) {
  try {
    const tokens = await refreshUserToken(req.body);
    return res.status(200).json({ success: true, data: tokens, message: "Token refreshed successfully." });
  } catch (error) {
    return next(error instanceof AppError ? error : new AppError(500, "TOKEN_REFRESH_FAILED", "Token refresh failed."));
  }
}

export async function logoutController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError(401, "UNAUTHORIZED", "Authentication required."));
    }
    await logoutUser(userId, req.body?.refreshToken);
    return res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (error) {
    return next(error instanceof AppError ? error : new AppError(500, "LOGOUT_FAILED", "Logout failed."));
  }
}

export async function meController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError(401, "UNAUTHORIZED", "Authentication required."));
    }
    const { getCurrentUserProfile } = await import("./auth.service");
    const user = await getCurrentUserProfile(userId);
    return res.status(200).json({ success: true, data: user, message: "Profile retrieved." });
  } catch (error) {
    return next(error instanceof AppError ? error : new AppError(500, "PROFILE_ERROR", "Failed to load profile."));
  }
}

export async function changePasswordController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return next(new AppError(401, "UNAUTHORIZED", "Authentication required."));
    }
    await changePassword(userId, req.body);
    return res.status(200).json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    return next(error instanceof AppError ? error : new AppError(500, "PASSWORD_CHANGE_FAILED", "Password change failed."));
  }
}
