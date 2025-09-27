import { Router } from "express";
import RolesController from "../controllers/roles.controller.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = Router();

// Admin-only routes
router.post("/", 
  requirePermission("roles", "create"), 
  RolesController.register
);

router.get("/", 
  requirePermission("roles", "read"), 
  RolesController.show
);

router.get("/:id", 
  requirePermission("roles", "read"), 
  RolesController.findById
);

router.put("/:id", 
  requirePermission("roles", "update"), 
  RolesController.update
);

router.delete("/:id", 
  requirePermission("roles", "delete"), 
  RolesController.delete
);

export default router;
