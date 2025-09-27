import NotificationModel from "../models/notification.model.js";

class NotificationController {
  async register(req, res) {
    try {
      const {
        type_id,
        description,
        user_id
      } = req.body;

      if (!type_id || !description) {
        return res.status(400).json({
          error: "Type ID and description are required"
        });
      }

      // user_id can be null/0 for all users, or a specific user ID
      const notificationId = await NotificationModel.create({
        type_id,
        description,
        user_id: user_id || 0 // Convert null/undefined to 0 for all users
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

      // Add a flag to indicate if notification is for all users
      const formattedNotifications = notifications.map(n => ({
        ...n,
        is_for_all_users: n.Notification_User_FK_ID === null
      }));

      res.status(200).json({
        message: "Notifications retrieved successfully",
        notifications: formattedNotifications,
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
        description,
        user_id
      } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Notification ID is required" });
      }

      const updateResult = await NotificationModel.update(id, {
        type_id,
        description,
        user_id: user_id || 0 // Convert null/undefined to 0 for all users
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

      // Add a flag to indicate if notification is for all users
      const formattedNotification = {
        ...notification,
        is_for_all_users: notification.Notification_User_FK_ID === null
      };

      res.status(200).json({
        message: "Notification found successfully",
        notification: formattedNotification,
      });
    } catch (error) {
      console.error("Error finding notification by ID:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findByUser(req, res) {
    try {
      const { recipient_id, recipient_type } = req.params;

      if (!recipient_id) {
        return res.status(400).json({ error: "Recipient ID is required" });
      }

      const notifications = await NotificationModel.findByUser(recipient_id);

      if (notifications.error) {
        return res.status(500).json({ error: notifications.error });
      }

      // Add a flag to indicate if notification is for all users
      const formattedNotifications = notifications.map(n => ({
        ...n,
        is_for_all_users: n.Notification_User_FK_ID === null
      }));

      res.status(200).json({
        message: "Notifications retrieved successfully",
        notifications: formattedNotifications,
      });
    } catch (error) {
      console.error("Error finding notifications by user:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findByType(req, res) {
    try {
      const { type_id } = req.params;

      if (!type_id) {
        return res.status(400).json({ error: "Type ID is required" });
      }

      const notifications = await NotificationModel.findByType(type_id);

      if (notifications.error) {
        return res.status(500).json({ error: notifications.error });
      }

      // Add a flag to indicate if notification is for all users
      const formattedNotifications = notifications.map(n => ({
        ...n,
        is_for_all_users: n.Notification_User_FK_ID === null
      }));

      res.status(200).json({
        message: "Notifications retrieved successfully",
        notifications: formattedNotifications,
      });
    } catch (error) {
      console.error("Error finding notifications by type:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findUnread(req, res) {
    try {
      const { recipient_id, recipient_type } = req.params;

      if (!recipient_id) {
        return res.status(400).json({ error: "Recipient ID is required" });
      }

      // Since we don't track read status, just return all notifications
      const notifications = await NotificationModel.findByUser(recipient_id);

      if (notifications.error) {
        return res.status(500).json({ error: notifications.error });
      }

      // Add a flag to indicate if notification is for all users
      const formattedNotifications = notifications.map(n => ({
        ...n,
        is_for_all_users: n.Notification_User_FK_ID === null
      }));

      res.status(200).json({
        message: "Notifications retrieved successfully",
        notifications: formattedNotifications,
      });
    } catch (error) {
      console.error("Error finding notifications:", error);
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

export default NotificationController;
