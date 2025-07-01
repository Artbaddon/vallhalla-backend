import { Router } from "express";
import PQRSCategoryController from "../controllers/pqrsCategory.controller.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = Router();

// Admin-only routes
router.post("/", 
  requirePermission("pqrsCategories", "create"), 
  PQRSCategoryController.register
);

router.get("/", 
  requirePermission("pqrsCategories", "read"), 
  PQRSCategoryController.show
);

router.get("/:id", 
  requirePermission("pqrsCategories", "read"), 
  PQRSCategoryController.findById
);

router.put("/:id", 
  requirePermission("pqrsCategories", "update"), 
  PQRSCategoryController.update
);

router.delete("/:id", 
  requirePermission("pqrsCategories", "delete"), 
  PQRSCategoryController.delete
);

export default router;