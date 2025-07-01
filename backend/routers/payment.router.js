import { Router } from "express";
import PaymentController from "../controllers/payment.controller.js";
import { requirePermission, requireOwnership } from "../middleware/permissionMiddleware.js";

const router = Router();

// Public routes (if any)

// Protected routes
// Admin can see all payments
router.get("/", 
  requirePermission("payments", "read"),
  PaymentController.show
);

// Owners can create payments
router.post("/",
  requirePermission("payments", "create"),
  PaymentController.register
);

// View specific payment (owners can only see their own)
router.get("/:id",
  requirePermission("payments", "read"),
  requireOwnership("payment"),
  PaymentController.findById
);

// Get payment statistics (admin only)
router.get("/stats/overview",
  requirePermission("payments", "read"),
  PaymentController.getStats
);

// Get payments by owner
router.get("/owner/:owner_id",
  requirePermission("payments", "read"),
  PaymentController.findByOwner
);

export default router;
