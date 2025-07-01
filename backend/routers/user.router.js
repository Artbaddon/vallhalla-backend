import express from "express";
import UserController from "../controllers/user.controller.js";
import { requirePermission, requireOwnership } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// Special routes (must come first)
router.get("/me/profile", 
  requirePermission("users", "read"), 
  UserController.getMyProfile
);

router.get("/details", 
  requirePermission("users", "read"), 
  UserController.showWithDetails
);

router.get("/search", 
  requirePermission("users", "read"), 
  UserController.findByName
);

router.patch("/:id/status", 
  requirePermission("users", "update"), 
  UserController.updateStatus
);

// Base routes
router.get("/", 
  requirePermission("users", "read"), 
  UserController.show
);

router.post("/", 
  requirePermission("users", "create"), 
  UserController.register
);

// Routes with ID parameter (must come last)
router.get("/:id", 
  requirePermission("users", "read"),
  requireOwnership("user", "id", "userId"),
  UserController.findById
);

router.put("/:id", 
  requirePermission("users", "update"), 
  UserController.update
);

router.delete("/:id", 
  requirePermission("users", "delete"), 
  UserController.delete
);

export default router; 