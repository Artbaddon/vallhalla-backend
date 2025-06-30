import { Router } from "express";
import NotificationController from "../controllers/notification.controller.js";

const router = Router();
const name = "/notification";

// Public Routes
router.post(name, NotificationController.register);
router.get(name + "/", NotificationController.show);
router.get(name + "/stats", NotificationController.getStats);
router.get(name + "/:id", NotificationController.findById);
router.get(
  name + "/recipient/:recipient_id/:recipient_type",
  NotificationController.findByRecipient
);
router.get(
  name + "/unread/:recipient_id/:recipient_type",
  NotificationController.findUnread
);
router.get(name + "/type/:type_id", NotificationController.findByType);
router.put(name + "/:id", NotificationController.update);
router.put(name + "/:id/read", NotificationController.markAsRead);
router.delete(name + "/:id", NotificationController.delete);

export default router;
