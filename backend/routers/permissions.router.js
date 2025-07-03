import { Router } from "express";
import PermissionsController from "../controllers/permissions.controller.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = Router();

// Admin-only routes
router.post("/", 
  requirePermission("permissions", "create"), 
  PermissionsController.register
);

router.get("/", 
  requirePermission("permissions", "read"), 
  PermissionsController.show
);

router.get("/:id", 
  requirePermission("permissions", "read"), 
  PermissionsController.findById
);

router.put("/:id", 
  requirePermission("permissions", "update"), 
  PermissionsController.update
);

router.delete("/:id", 
  requirePermission("permissions", "delete"), 
  PermissionsController.delete
);

// Permission management endpoints
router.get("/role/:roleId/permissions",
  requirePermission("permissions", "read"),
  PermissionsController.getUserPermissions
);

router.post("/role/:roleId/check",
  requirePermission("permissions", "read"),
  PermissionsController.checkPermission
);

router.get("/module/:moduleId/permissions",
  requirePermission("permissions", "read"),
  PermissionsController.getModulePermissions
);

router.get("/role/:roleId/modules",
  requirePermission("permissions", "read"),
  PermissionsController.getRoleModules
);

export default router;
