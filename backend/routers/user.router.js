import express from "express";
import { authMiddleware, ownerResourceAccess } from "../middleware/authMiddleware.js";
import { ROLES } from "../middleware/rbacConfig.js";
import UserController from "../controllers/user.controller.js";

const router = express.Router();

// Special routes (must come first)
router.get("/me/profile", authMiddleware([]), UserController.getMyProfile);
router.get("/details", authMiddleware([ROLES.ADMIN, ROLES.STAFF]), UserController.showWithDetails);
router.get("/search", authMiddleware([ROLES.ADMIN, ROLES.STAFF]), UserController.findByName);
router.patch("/:id/status", authMiddleware([ROLES.ADMIN, ROLES.STAFF]), UserController.updateStatus);

// Base routes
router.get("/", authMiddleware([ROLES.ADMIN, ROLES.STAFF]), UserController.show);
router.post("/", authMiddleware([ROLES.ADMIN]), UserController.register);

// Routes with ID parameter (must come last)
router.get("/:id", authMiddleware([ROLES.ADMIN, ROLES.STAFF, ROLES.OWNER]), ownerResourceAccess('id', 'userId'), UserController.findById);
router.put("/:id", authMiddleware([ROLES.ADMIN, ROLES.STAFF]), UserController.update);
router.delete("/:id", authMiddleware([ROLES.ADMIN]), UserController.delete);

export default router; 