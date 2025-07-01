import express from "express";
import authController from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/login", authController.login.bind(authController));
router.post("/register", authController.register.bind(authController));
router.post("/forgot-password", authController.forgotPassword.bind(authController));
router.post("/reset-password", authController.resetPassword.bind(authController));

// Protected routes (authentication required)
router.post("/change-password", verifyToken, authController.changePassword.bind(authController));
router.get("/validate-token", verifyToken, authController.validateToken.bind(authController));

export default router;
