import express from "express";
import { authMiddleware, ownerResourceAccess } from "../middleware/authMiddleware.js";
import { ROLES } from "../middleware/rbacConfig.js";
import ProfileController from "../controllers/profile.controller.js";
import ProfileModel from "../models/profile.model.js";

const router = express.Router();
const name = "/profile";

// Define roles that can access these endpoints
const ADMIN_ROLES = [1]; // Assuming role ID 1 is admin
const MANAGER_ROLES = [1, 2]; // Assuming role IDs 1 and 2 are admin and manager
const USER_ROLES = [1, 2, 3]; // Assuming role IDs 1, 2, 3 include regular users

// Public routes (if any)
// None for profiles - all profile operations should be protected

// Special routes (must come first)
router.get("/me", authMiddleware([]), ProfileController.getMyProfile);

// Base routes
router.get("/", authMiddleware([ROLES.ADMIN, ROLES.STAFF]), ProfileController.show);
router.post("/", authMiddleware([ROLES.ADMIN, ROLES.STAFF, ROLES.OWNER]), ProfileController.register);

// Routes with ID parameter (must come last)
router.get("/:id", authMiddleware([ROLES.ADMIN, ROLES.STAFF, ROLES.OWNER]), ownerResourceAccess('id', 'userId'), ProfileController.findById);
router.put("/:id", authMiddleware([ROLES.ADMIN, ROLES.STAFF, ROLES.OWNER]), ownerResourceAccess('id', 'userId'), ProfileController.update);
router.delete("/:id", authMiddleware([ROLES.ADMIN]), ProfileController.delete);

export default router;
