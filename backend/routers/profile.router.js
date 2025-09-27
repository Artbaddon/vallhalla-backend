import express from "express";
import ProfileController from "../controllers/profile.controller.js";
import { requirePermission, requireOwnership } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// Special routes (must come first)
router.get("/me", 
  requirePermission("profiles", "read"), 
  ProfileController.getMyProfile
);

// Base routes
router.get("/", 
  requirePermission("profiles", "read"), 
  ProfileController.show
);

router.post("/", 
  requirePermission("profiles", "create"), 
  ProfileController.register
);

router.get("/:id", 
  requirePermission("profiles", "read"),
  requireOwnership("profile", "id"),
  ProfileController.findById
);

router.put("/:id", 
  requirePermission("profiles", "update"),
  requireOwnership("profile", "id"),
  ProfileController.update
);

router.delete("/:id", 
  requirePermission("profiles", "delete"), 
  ProfileController.delete
);

export default router;
