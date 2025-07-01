import { Router } from "express";
import RolePermissionsController from "../controllers/rolePermissions.controller.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = Router();

// Admin-only routes
router.post("/", 
  requirePermission("rolePermissions", "create"), 
  RolePermissionsController.register
);

router.get("/", 
  requirePermission("rolePermissions", "read"), 
  RolePermissionsController.show
);

router.get("/:id", 
  requirePermission("rolePermissions", "read"), 
  RolePermissionsController.findById
);

router.put("/:id", 
  requirePermission("rolePermissions", "update"), 
  RolePermissionsController.update
);

router.delete("/:id", 
  requirePermission("rolePermissions", "delete"), 
  RolePermissionsController.delete
);

export default router;
