import { Router } from "express";
import PQRSCategoryController from "../controllers/pqrsCategory.controller.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = Router();

// Admin-only routes
router.post("/", 
  requirePermission("pqrs-categories", "create"), 
  PQRSCategoryController.register
);

router.get("/", 
  requirePermission("pqrs-categories", "read"), 
  PQRSCategoryController.show
);

router.get("/:id", 
  requirePermission("pqrs-categories", "read"), 
  PQRSCategoryController.findById
);

router.put("/:id", 
  requirePermission("pqrs-categories", "update"), 
  PQRSCategoryController.update
);

router.delete("/:id", 
  requirePermission("pqrs-categories", "delete"), 
  PQRSCategoryController.delete
);

export default router;