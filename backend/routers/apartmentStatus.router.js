import { Router } from "express";
import AparmentStatusController from "../controllers/apartmentStatus.controller.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = Router();

// Admin-only routes
router.post("/", 
  requirePermission("apartmentStatus", "create"), 
  AparmentStatusController.register
);

router.get("/", 
  requirePermission("apartmentStatus", "read"), 
  AparmentStatusController.show
);

router.get("/:id", 
  requirePermission("apartmentStatus", "read"), 
  AparmentStatusController.findById
);

router.put("/:id", 
  requirePermission("apartmentStatus", "update"), 
  AparmentStatusController.update
);

router.delete("/:id", 
  requirePermission("apartmentStatus", "delete"), 
  AparmentStatusController.delete
);

export default router;
