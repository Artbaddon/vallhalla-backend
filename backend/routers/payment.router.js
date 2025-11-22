import express from "express";
import paymentController from "../controllers/payment.controller.js";
import {
  verifyToken,
  ownerResourceAccess,
} from "../middleware/authMiddleware.js";
import {
  requirePermission,
  requireAdmin,
} from "../middleware/permissionMiddleware.js";

const router = express.Router();

// Admin routes
router.post(
  "/",
  verifyToken,
  requireAdmin,
  paymentController.pay.bind(paymentController)
);

router.post(
  "/check/:reference",
  verifyToken,
  paymentController.checkPaymentStatus
)

router.get(
  "/",
  verifyToken,
  requirePermission("payments", "read"),
  paymentController.show
);

router.get(
  "/report",
  verifyToken,
  requirePermission("payments", "read"),
  paymentController.downloadPaymentReport
);

router.get(
  "/stats",
  verifyToken,
  requirePermission("payments", "read"),
  paymentController.getPaymentStats
);

router.get(
  "/:id",
  verifyToken,
  requirePermission("payments", "read"),
  paymentController.showById
);

router.delete(
  "/:id",
  verifyToken,
  requirePermission("payments", "delete"),
  paymentController.delete
);

// Owner routes
router.get(
  "/owner/:owner_id",
  verifyToken,
  ownerResourceAccess("owner_id", "userId"),
  paymentController.getOwnerPayments
);

router.get(
  "/owner/:owner_id/pending",
  verifyToken,
  ownerResourceAccess("owner_id", "userId"),
  paymentController.getPendingPayments
);


export default router;