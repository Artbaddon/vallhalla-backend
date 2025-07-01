import { Router } from "express";
import OwnerController from "../controllers/owner.controller.js";
import { requirePermission, requireOwnership } from "../middleware/permissionMiddleware.js";

const router = Router();

// Special routes (must come first)
router.get("/me/profile", 
  requirePermission("owners", "read"),
  OwnerController.getMyProfile
);

router.get("/search", 
  requirePermission("owners", "read"),
  OwnerController.findByUserId
);

router.get("/details", 
  requirePermission("owners", "read"),
  OwnerController.showWithDetails
);

// Base routes
router.get("/", 
  requirePermission("owners", "read"),
  OwnerController.show
);

router.post("/", 
  requirePermission("owners", "create"),
  OwnerController.register
);

// Routes with ID parameter (must come last)
router.get("/:id", 
  requirePermission("owners", "read"),
  requireOwnership("owner", "id"),
  OwnerController.findById
);

router.get("/:id/details", 
  requirePermission("owners", "read"),
  requireOwnership("owner", "id"),
  OwnerController.findWithDetails
);

router.put("/:id", 
  requirePermission("owners", "update"),
  requireOwnership("owner", "id"),
  OwnerController.update
);

router.delete("/:id", 
  requirePermission("owners", "delete"),
  OwnerController.delete
);

export default router; 