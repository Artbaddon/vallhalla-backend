import { Router } from "express";
import ModulesController from "../controllers/modules.controller.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = Router();

// Admin-only routes
router.post("/", 
  requirePermission("modules", "create"), 
  ModulesController.register
);

router.get("/", 
  requirePermission("modules", "read"), 
  ModulesController.show
);

router.get("/:id", 
  requirePermission("modules", "read"), 
  ModulesController.findById
);

router.put("/:id", 
  requirePermission("modules", "update"), 
  ModulesController.update
);

router.delete("/:id", 
  requirePermission("modules", "delete"), 
  ModulesController.delete
);

export default router;
