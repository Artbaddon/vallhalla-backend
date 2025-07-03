import { Router } from "express";
import NotificationController from "../controllers/notification.controller.js";
import { requirePermission } from '../middleware/permissionMiddleware.js';

const router = Router();
const controller = new NotificationController();

// Protected routes
// Admin can see all notifications
router.get("/", 
  requirePermission("notifications", "read"),
  controller.show
);

// Get notification stats (admin only)
router.get("/stats",
  requirePermission("notifications", "read"),
  controller.getStats
);

// Find notifications by user
router.get("/recipient/:recipient_id/:recipient_type",
  requirePermission("notifications", "read"),
  controller.findByUser
);

// Find unread notifications
router.get("/unread/:recipient_id/:recipient_type",
  requirePermission("notifications", "read"),
  controller.findUnread
);

// Find notifications by type
router.get("/type/:type_id",
  requirePermission("notifications", "read"),
  controller.findByType
);

// View specific notification
router.get("/:id",
  requirePermission("notifications", "read"),
  controller.findById
);

// Create notification (admin only)
router.post("/",
  requirePermission("notifications", "create"),
  controller.register
);

// Update notification (admin only)
router.put("/:id",
  requirePermission("notifications", "update"),
  controller.update
);

// Delete notification (admin only)
router.delete("/:id",
  requirePermission("notifications", "delete"),
  controller.delete
);

export default router;
