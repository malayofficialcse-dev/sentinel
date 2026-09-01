import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { validateRequest } from "../../middleware/validation.middleware";
import { changePasswordController, loginController, logoutController, meController, refreshController, registerController } from "./auth.controller";
import { changePasswordSchema, loginSchema, refreshSchema, registerSchema } from "./auth.validation";

const router = Router();

router.post("/register", validateRequest(registerSchema), registerController);
router.post("/login", validateRequest(loginSchema), loginController);
router.post("/refresh", validateRequest(refreshSchema), refreshController);
router.post("/logout", authMiddleware, logoutController);
router.get("/me", authMiddleware, meController);
router.post("/change-password", authMiddleware, validateRequest(changePasswordSchema), changePasswordController);

export default router;
