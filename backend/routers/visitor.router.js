import { Router } from "express";
import VisitorController from "../controllers/visitor.controller.js";
import { requirePermission, requireOwnership } from "../middleware/permissionMiddleware.js";

const router = Router();

// Protected routes
router.post("/", 
  requirePermission("visitors", "create"),
  VisitorController.register
);

router.get("/", 
  requirePermission("visitors", "read"),
  VisitorController.show
);

router.get("/:id", 
  requirePermission("visitors", "read"),
  VisitorController.findById
);

router.get("/host/:host_id", 
  requirePermission("visitors", "read"),
  VisitorController.findByHost
);

router.get("/date/:visit_date", 
  requirePermission("visitors", "read"),
  VisitorController.findByDate
);

router.put("/:id", 
  requirePermission("visitors", "update"),
  VisitorController.update
);

router.delete("/:id", 
  requirePermission("visitors", "delete"),
  VisitorController.delete
);

export default router;