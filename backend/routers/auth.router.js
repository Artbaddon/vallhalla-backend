import express from "express";
import AuthController from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/login", AuthController.login);
router.post("/register", AuthController.register);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

// Protected routes (authentication required)
router.post("/change-password", verifyToken, AuthController.changePassword);
router.get("/validate-token", verifyToken, AuthController.validateToken);

export default router;
