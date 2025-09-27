import { Router } from "express";
import PQRSController from "../controllers/pqrs.controller.js";
import { requirePermission, requireOwnership } from "../middleware/permissionMiddleware.js";

const router = Router();

// Protected routes
// Admin can see all PQRS
router.get("/", 
  requirePermission("pqrs", "read"),
  PQRSController.show
);

// Create PQRS
router.post("/",
  requirePermission("pqrs", "create"),
  PQRSController.register
);

// Get PQRS statistics (admin only)
router.get("/stats",
  requirePermission("pqrs", "read"),
  PQRSController.getStats
);

// Get PQRS by owner
router.get("/owner/:owner_id",
  requirePermission("pqrs", "read"),
  PQRSController.findByOwner
);

// Get PQRS by status
router.get("/status/:status_id",
  requirePermission("pqrs", "read"),
  PQRSController.findByStatus
);

// Get PQRS by category
router.get("/category/:category_id",
  requirePermission("pqrs", "read"),
  PQRSController.findByCategory
);

// View specific PQRS (owners can only see their own)
router.get("/:id",
  requirePermission("pqrs", "read"),
  requireOwnership("pqrs"),
  PQRSController.findById
);

// Update PQRS (owners can only update their own)
router.put("/:id",
  requirePermission("pqrs", "update"),
  requireOwnership("pqrs"),
  PQRSController.update
);

// Update PQRS status (admin only)
router.put("/:id/status",
  requirePermission("pqrs", "update"),
  PQRSController.updateStatus
);

// Delete PQRS (admin only)
router.delete("/:id",
  requirePermission("pqrs", "delete"),
  PQRSController.delete
);

export default router;