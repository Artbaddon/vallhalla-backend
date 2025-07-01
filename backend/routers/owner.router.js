import express from "express";
import { authMiddleware, ownerResourceAccess } from "../middleware/authMiddleware.js";
import { ROLES } from "../middleware/rbacConfig.js";
import OwnerController from "../controllers/owner.controller.js";

const router = express.Router();

// Special routes (must come first)
router.get("/me/profile", authMiddleware([ROLES.OWNER]), OwnerController.getMyProfile);
router.get("/search", authMiddleware([ROLES.ADMIN, ROLES.STAFF, ROLES.OWNER]), ownerResourceAccess(), OwnerController.findByUserId);
router.get("/details", authMiddleware([ROLES.ADMIN, ROLES.STAFF]), OwnerController.showWithDetails);

// Base routes
router.get("/", authMiddleware([ROLES.ADMIN, ROLES.STAFF]), OwnerController.show);
router.post("/", authMiddleware([ROLES.ADMIN]), OwnerController.register);

// Routes with ID parameter (must come last)
router.get("/:id", authMiddleware([ROLES.ADMIN, ROLES.STAFF, ROLES.OWNER]), ownerResourceAccess('id'), OwnerController.findById);
router.get("/:id/details", authMiddleware([ROLES.ADMIN, ROLES.STAFF, ROLES.OWNER]), ownerResourceAccess('id'), OwnerController.findWithDetails);
router.put("/:id", authMiddleware([ROLES.ADMIN, ROLES.STAFF, ROLES.OWNER]), ownerResourceAccess('id'), OwnerController.update);
router.delete("/:id", authMiddleware([ROLES.ADMIN]), OwnerController.delete);

export default router; 