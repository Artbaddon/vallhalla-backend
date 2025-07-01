import { Router } from "express";
import GuardController from "../controllers/guard.controller.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = Router();

// Admin-only routes
router.post("/", 
  requirePermission("guards", "create"), 
  GuardController.register
);

router.get("/", 
  requirePermission("guards", "read"), 
  GuardController.show
);

router.get("/:id", 
  requirePermission("guards", "read"), 
  GuardController.findById
);

router.get("/shift/:shift", 
  requirePermission("guards", "read"), 
  GuardController.findByShift
);

router.put("/:id", 
  requirePermission("guards", "update"), 
  GuardController.update
);

router.delete("/:id", 
  requirePermission("guards", "delete"), 
  GuardController.delete
);

export default router;
