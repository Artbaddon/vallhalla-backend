import { Router } from "express";
import VisitorController from "../controllers/visitor.controller.js";
import { requirePermission, requireRoles } from "../middleware/permissionMiddleware.js";
import { ROLES } from "../middleware/rbacConfig.js";

const router = Router();

// Security staff manage visitors (admin bypasses automatically)
router.use(requireRoles(ROLES.SECURITY));

// Create a new visitor
router.post("/", 
  requirePermission("visitors", "create"),
  VisitorController.register
);

// Get all visitors
router.get("/", 
  requirePermission("visitors", "read"),
  VisitorController.show
);

// Get visitor by ID
router.get("/:id", 
  requirePermission("visitors", "read"),
  VisitorController.findById
);

// Get visitors by host
router.get("/host/:host_id", 
  requirePermission("visitors", "read"),
  VisitorController.findByHost
);

// Get visitors by enter date
router.get("/date/:enter_date", 
  requirePermission("visitors", "read"),
  VisitorController.findByDate
);

// Update visitor
router.put("/:id", 
  requirePermission("visitors", "update"),
  VisitorController.update
);

router.put("/:id/exit",
  requirePermission("visitors", "update"),
  VisitorController.visitorExit
);

// Delete visitor
router.delete("/:id", 
  requirePermission("visitors", "delete"),
  VisitorController.delete
);

export default router;