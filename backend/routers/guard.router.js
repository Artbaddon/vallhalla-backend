import { Router } from "express";
import GuardController from "../controllers/guard.controller.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = Router();

// Create a new guard (requires guards create permission)
router.post("/", 
  requirePermission("guards", "create"),
  GuardController.create
);

// Get all guards (requires guards read permission)
router.get("/", 
  requirePermission("guards", "read"),
  GuardController.show
);

// Get guard by ID (requires guards read permission)
router.get("/:id", 
  requirePermission("guards", "read"),
  GuardController.findById
);

// Get guards by shift (requires guards read permission)
router.get("/shift/:shift", 
  requirePermission("guards", "read"),
  GuardController.findByShift
);

// Get guard by document number (requires guards read permission)
router.get("/document/:documentNumber", 
  requirePermission("guards", "read"),
  GuardController.findByDocument
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
