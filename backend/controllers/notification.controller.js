import NotificationModel from "../models/notification.model.js";

class NotificationController {
  async register(req, res) {
    try {
      const {
        type_id,
        title,
        message,
        recipient_id,
        recipient_type,
        priority,
        scheduled_date,
        attachments,
      } = req.body;

      if (!type_id || !title || !message || !recipient_id || !recipient_type) {
        return res.status(400).json({
          error:
            "Type ID, title, message, recipient ID, and recipient type are required",
        });
      }

      const notificationId = await NotificationModel.create({
        type_id,
        title,
        message,
        recipient_id,
        recipient_type,
        priority: priority || "NORMAL",
        scheduled_date: scheduled_date || null,
        attachments,
      });

      if (notificationId.error) {
        return res.status(400).json({ error: notificationId.error });
      }

      res.status(201).json({
        message: "Notification created successfully",
        id: notificationId,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async show(req, res) {
    try {
      const notifications = await NotificationModel.show();

      if (notifications.error) {
        return res.status(500).json({ error: notifications.error });
      }

      res.status(200).json({
        message: "Notifications retrieved successfully",
        notifications: notifications,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const {
        type_id,
        title,
        message,
        recipient_id,
        recipient_type,
        priority,
        scheduled_date,
        attachments,
        is_read,
      } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Notification ID is required" });
      }

      const updateResult = await NotificationModel.update(id, {
        type_id,
        title,
        message,
        recipient_id,
        recipient_type,
        priority,
        scheduled_date,
        attachments,
        is_read,
      });

      if (updateResult.error) {
        return res.status(404).json({ error: updateResult.error });
      }

      res.status(200).json({
        message: "Notification updated successfully",
        id: id,
      });
    } catch (error) {
      console.error("Error updating notification:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async markAsRead(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "Notification ID is required" });
      }

      const updateResult = await NotificationModel.markAsRead(id);

      if (updateResult.error) {
        return res.status(404).json({ error: updateResult.error });
      }

      res.status(200).json({
        message: "Notification marked as read successfully",
        id: id,
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "Notification ID is required" });
      }

      const deleteResult = await NotificationModel.delete(id);

      if (deleteResult.error) {
        return res.status(404).json({ error: deleteResult.error });
      }

      res.status(200).json({
        message: "Notification deleted successfully",
        id: id,
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "Notification ID is required" });
      }

      const notification = await NotificationModel.findById(id);

      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }

      res.status(200).json({
        message: "Notification found successfully",
        notification: notification,
      });
    } catch (error) {
      console.error("Error finding notification by ID:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findByRecipient(req, res) {
    try {
      const { recipient_id, recipient_type } = req.params;

      if (!recipient_id || !recipient_type) {
        return res
          .status(400)
          .json({ error: "Recipient ID and type are required" });
      }

      const notifications = await NotificationModel.findByRecipient(
        recipient_id,
        recipient_type
      );

      if (notifications.error) {
        return res.status(500).json({ error: notifications.error });
      }

      res.status(200).json({
        message: "Recipient notifications retrieved successfully",
        notifications: notifications,
      });
    } catch (error) {
      console.error("Error finding notifications by recipient:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findUnread(req, res) {
    try {
      const { recipient_id, recipient_type } = req.params;

      if (!recipient_id || !recipient_type) {
        return res
          .status(400)
          .json({ error: "Recipient ID and type are required" });
      }

      const notifications = await NotificationModel.findUnread(
        recipient_id,
        recipient_type
      );

      if (notifications.error) {
        return res.status(500).json({ error: notifications.error });
      }

      res.status(200).json({
        message: "Unread notifications retrieved successfully",
        notifications: notifications,
      });
    } catch (error) {
      console.error("Error finding unread notifications:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findByType(req, res) {
    try {
      const type_id = req.params.type_id;

      if (!type_id) {
        return res.status(400).json({ error: "Type ID is required" });
      }

      const notifications = await NotificationModel.findByType(type_id);

      if (notifications.error) {
        return res.status(500).json({ error: notifications.error });
      }

      res.status(200).json({
        message: "Notifications by type retrieved successfully",
        notifications: notifications,
      });
    } catch (error) {
      console.error("Error finding notifications by type:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await NotificationModel.getNotificationStats();

      if (stats.error) {
        return res.status(500).json({ error: stats.error });
      }

      res.status(200).json({
        message: "Notification statistics retrieved successfully",
        stats: stats,
      });
    } catch (error) {
      console.error("Error getting notification stats:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new NotificationController();
