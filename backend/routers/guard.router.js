import { Router } from "express";
import GuardController from "../controllers/guard.controller.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = Router();

// NOTE: Ensure 'guards' module exists in module table (seed if missing)

// Specific filtered queries first (avoid shadowing by /:id)
router.get("/shift/:shift",
  requirePermission("guards", "read"),
  GuardController.findByShift
);

router.get("/document/:documentNumber",
  requirePermission("guards", "read"),
  GuardController.findByDocument
);

// Create a new guard
router.post("/",
  requirePermission("guards", "create"),
  GuardController.create
);

// List all guards
router.get("/",
  requirePermission("guards", "read"),
  GuardController.show
);

// Get guard by ID
router.get(":id",
  requirePermission("guards", "read"),
  GuardController.findById
);

// Update a guard (requires guards update permission)
router.put("/:id", 
  requirePermission("guards", "update"),
  GuardController.update
);

// Delete a guard (requires guards delete permission)
router.delete("/:id", 
  requirePermission("guards", "delete"),
  GuardController.delete
);

export default router;
