import { Router } from "express";
import * as facilityController from "../controllers/facility.controller.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = Router();

// Admin-only routes
router.post("/", 
  requirePermission("facilities", "create"),
  facilityController.register
);

router.put("/:id", 
  requirePermission("facilities", "update"),
  facilityController.update
);

router.put("/:id/status", 
  requirePermission("facilities", "update"),
  facilityController.updateStatus
);

router.delete("/:id", 
  requirePermission("facilities", "delete"),
  facilityController.remove
);

// Staff and admin routes
router.get("/availability", 
  requirePermission("facilities", "read"),
  facilityController.getAvailability
);

// All authenticated users
router.get("/", 
  requirePermission("facilities", "read"),
  facilityController.show
);

router.get("/status", 
  requirePermission("facilities", "read"),
  facilityController.findByStatus
);

router.get("/:id", 
  requirePermission("facilities", "read"),
  facilityController.findById
);

export default router;
