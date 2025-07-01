import { Router } from "express";
import UserStatusController from "../controllers/userStatus.controller.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = Router();

// Admin-only routes
router.post("/", 
  requirePermission("userStatus", "create"), 
  UserStatusController.register
);

router.get("/", 
  requirePermission("userStatus", "read"), 
  UserStatusController.show
);

router.get("/:id", 
  requirePermission("userStatus", "read"), 
  UserStatusController.findById
);

router.put("/:id", 
  requirePermission("userStatus", "update"), 
  UserStatusController.update
);

router.delete("/:id", 
  requirePermission("userStatus", "delete"), 
  UserStatusController.delete
);

export default router;
