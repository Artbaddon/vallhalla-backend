import { Router } from "express";
import NotificationController from "../controllers/notification.controller.js";
import { requirePermission } from '../middleware/permissionMiddleware.js';

const router = Router();

// Protected routes
// Admin can see all notifications
router.get("/", 
  requirePermission("notifications", "read"),
  NotificationController.show
);

// Get notification stats (admin only)
router.get("/stats",
  requirePermission("notifications", "read"),
  NotificationController.getStats
);

// View specific notification
router.get("/:id",
  requirePermission("notifications", "read"),
  NotificationController.findById
);

// Create notification (admin only)
router.post("/",
  requirePermission("notifications", "create"),
  NotificationController.register
);

// Update notification (admin only)
router.put("/:id",
  requirePermission("notifications", "update"),
  NotificationController.update
);

// Delete notification (admin only)
router.delete("/:id",
  requirePermission("notifications", "delete"),
  NotificationController.delete
);

// Find notifications by recipient
router.get("/recipient/:recipient_id/:recipient_type",
  requirePermission("notifications", "read"),
  NotificationController.findByRecipient
);

// Find unread notifications
router.get("/unread/:recipient_id/:recipient_type",
  requirePermission("notifications", "read"),
  NotificationController.findUnread
);

// Find notifications by type
router.get("/type/:type_id",
  requirePermission("notifications", "read"),
  NotificationController.findByType
);

// Mark notification as read
router.put("/:id/read",
  requirePermission("notifications", "update"),
  NotificationController.markAsRead
);

export default router;
