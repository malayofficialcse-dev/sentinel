import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { requirePermission, requireRole } from "../../middleware/authorization.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import { Permission } from "../../config/permissions";
import { listUsersController, meController, getUserController, updateSelfController, updateUserByAdminController, deactivateUserController, deleteUserController } from "./user.controller";
import { listUsersQuerySchema, updateSelfSchema, updateUserByAdminSchema } from "./user.validation";

const router = Router();

router.use(authMiddleware);

router.get("/me", meController);
router.patch("/me", validateRequest(updateSelfSchema), updateSelfController);

router.get("/", requirePermission(Permission.USER_READ), validateRequest(listUsersQuerySchema, "query"), listUsersController);
router.get("/:id", requirePermission(Permission.USER_READ), getUserController);
router.patch("/:id", requirePermission(Permission.USER_UPDATE), validateRequest(updateUserByAdminSchema), updateUserByAdminController);
router.patch("/:id/deactivate", requirePermission(Permission.USER_DELETE), deactivateUserController);
router.delete("/:id", requirePermission(Permission.USER_DELETE), deleteUserController);

export default router;
