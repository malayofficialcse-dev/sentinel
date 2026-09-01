import { NextFunction, Request, Response } from "express";
import { AppError } from "../../middleware/error.middleware";
import {
  deactivateUser,
  deleteUser,
  getCurrentUserProfile,
  getUserById,
  listUsers,
  updateOwnProfile,
  updateUserByAdmin
} from "./user.service";

export async function meController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new AppError(401, "UNAUTHORIZED", "Authentication required."));
    const user = await getCurrentUserProfile(userId);
    return res.status(200).json({ success: true, data: user, message: "User profile loaded." });
  } catch (error) {
    return next(error instanceof AppError ? error : new AppError(500, "PROFILE_ERROR", "Unable to load user profile."));
  }
}

export async function getUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const currentUserId = req.user?.id;
    const requestedId = req.params.id;
    if (!currentUserId) return next(new AppError(401, "UNAUTHORIZED", "Authentication required."));
    const user = await getUserById(currentUserId, requestedId);
    return res.status(200).json({ success: true, data: user, message: "User retrieved." });
  } catch (error) {
    return next(error instanceof AppError ? error : new AppError(500, "USER_FETCH_FAILED", "Unable to fetch user."));
  }
}

export async function listUsersController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new AppError(401, "UNAUTHORIZED", "Authentication required."));
    const { page = 1, limit = 20, role, status, search } = req.query as any;
    const result = await listUsers(userId, { page: Number(page), limit: Number(limit), role, status, search });
    return res.status(200).json({ success: true, data: result.data, meta: result.meta, message: "Users retrieved." });
  } catch (error) {
    return next(error instanceof AppError ? error : new AppError(500, "USER_LIST_FAILED", "Unable to list users."));
  }
}

export async function updateSelfController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id;
    if (!userId) return next(new AppError(401, "UNAUTHORIZED", "Authentication required."));
    const user = await updateOwnProfile(userId, req.body);
    return res.status(200).json({ success: true, data: user, message: "Profile updated." });
  } catch (error) {
    return next(error instanceof AppError ? error : new AppError(500, "PROFILE_UPDATE_FAILED", "Unable to update profile."));
  }
}

export async function updateUserByAdminController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.id;
    if (!actorId) return next(new AppError(401, "UNAUTHORIZED", "Authentication required."));
    const user = await updateUserByAdmin(actorId, req.params.id, req.body);
    return res.status(200).json({ success: true, data: user, message: "User updated." });
  } catch (error) {
    return next(error instanceof AppError ? error : new AppError(500, "USER_UPDATE_FAILED", "Unable to update user."));
  }
}

export async function deactivateUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.id;
    if (!actorId) return next(new AppError(401, "UNAUTHORIZED", "Authentication required."));
    const user = await deactivateUser(actorId, req.params.id);
    return res.status(200).json({ success: true, data: user, message: "User deactivated." });
  } catch (error) {
    return next(error instanceof AppError ? error : new AppError(500, "USER_DEACTIVATION_FAILED", "Unable to deactivate user."));
  }
}

export async function deleteUserController(req: Request, res: Response, next: NextFunction) {
  try {
    const actorId = req.user?.id;
    if (!actorId) return next(new AppError(401, "UNAUTHORIZED", "Authentication required."));
    const result = await deleteUser(actorId, req.params.id);
    return res.status(200).json({ success: true, data: result, message: "User deactivated successfully." });
  } catch (error) {
    return next(error instanceof AppError ? error : new AppError(500, "USER_DELETE_FAILED", "Unable to delete user."));
  }
}
