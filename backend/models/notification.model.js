import { connect } from "../config/db/connectMysql.js";

class NotificationModel {
  static async create({ 
    type_id, 
    title, 
    message, 
    recipient_id, 
    recipient_type, 
    priority = 'NORMAL',
    scheduled_date = null,
    attachments 
  }) {
    try {
      let sqlQuery = `INSERT INTO notification (
        Notification_type_FK_ID, 
        Notification_title, 
        Notification_message, 
        Notification_recipient_id, 
        Notification_recipient_type, 
        Notification_priority,
        Notification_scheduled_date,
        Notification_attachments,
        Notification_is_read,
        Notification_createdAt, 
        Notification_updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(), NOW())`;
      
      const [result] = await connect.query(sqlQuery, [
        type_id, 
        title, 
        message, 
        recipient_id, 
        recipient_type, 
        priority,
        scheduled_date,
        attachments ? JSON.stringify(attachments) : null
      ]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async show() {
    try {
      let sqlQuery = `
        SELECT n.*, nt.Notification_type_name
        FROM notification n
        LEFT JOIN notification_type nt ON n.Notification_type_FK_ID = nt.Notification_type_id
        ORDER BY n.Notification_createdAt DESC
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async update(id, { 
    type_id, 
    title, 
    message, 
    recipient_id, 
    recipient_type, 
    priority,
    scheduled_date,
    attachments,
    is_read 
  }) {
    try {
      let sqlQuery = `UPDATE notification SET 
        Notification_type_FK_ID = ?, 
        Notification_title = ?, 
        Notification_message = ?, 
        Notification_recipient_id = ?, 
        Notification_recipient_type = ?, 
        Notification_priority = ?,
        Notification_scheduled_date = ?,
        Notification_attachments = ?,
        Notification_is_read = ?,
        Notification_updatedAt = NOW() 
        WHERE Notification_id = ?`;
      
      const [result] = await connect.query(sqlQuery, [
        type_id, 
        title, 
        message, 
        recipient_id, 
        recipient_type, 
        priority,
        scheduled_date,
        attachments ? JSON.stringify(attachments) : null,
        is_read ? 1 : 0,
        id
      ]);
      
      if (result.affectedRows === 0) {
        return { error: "Notification not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async markAsRead(id) {
    try {
      let sqlQuery = `UPDATE notification SET 
        Notification_is_read = 1, 
        Notification_updatedAt = NOW() 
        WHERE Notification_id = ?`;
      
      const [result] = await connect.query(sqlQuery, [id]);
      
      if (result.affectedRows === 0) {
        return { error: "Notification not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM notification WHERE Notification_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);

      if (result.affectedRows === 0) {
        return { error: "Notification not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = `
        SELECT n.*, nt.Notification_type_name
        FROM notification n
        LEFT JOIN notification_type nt ON n.Notification_type_FK_ID = nt.Notification_type_id
        WHERE n.Notification_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [id]);

      if (result.length === 0) {
        return null;
      }
      return result[0];
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByRecipient(recipient_id, recipient_type) {
    try {
      let sqlQuery = `
        SELECT n.*, nt.Notification_type_name
        FROM notification n
        LEFT JOIN notification_type nt ON n.Notification_type_FK_ID = nt.Notification_type_id
        WHERE n.Notification_recipient_id = ? AND n.Notification_recipient_type = ?
        ORDER BY n.Notification_createdAt DESC
      `;
      const [result] = await connect.query(sqlQuery, [recipient_id, recipient_type]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findUnread(recipient_id, recipient_type) {
    try {
      let sqlQuery = `
        SELECT n.*, nt.Notification_type_name
        FROM notification n
        LEFT JOIN notification_type nt ON n.Notification_type_FK_ID = nt.Notification_type_id
        WHERE n.Notification_recipient_id = ? AND n.Notification_recipient_type = ? AND n.Notification_is_read = 0
        ORDER BY n.Notification_createdAt DESC
      `;
      const [result] = await connect.query(sqlQuery, [recipient_id, recipient_type]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByType(type_id) {
    try {
      let sqlQuery = `
        SELECT n.*, nt.Notification_type_name
        FROM notification n
        LEFT JOIN notification_type nt ON n.Notification_type_FK_ID = nt.Notification_type_id
        WHERE n.Notification_type_FK_ID = ?
        ORDER BY n.Notification_createdAt DESC
      `;
      const [result] = await connect.query(sqlQuery, [type_id]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async getNotificationStats() {
    try {
      let sqlQuery = `
        SELECT 
          nt.Notification_type_name,
          COUNT(*) as total_count,
          SUM(CASE WHEN n.Notification_is_read = 1 THEN 1 ELSE 0 END) as read_count,
          SUM(CASE WHEN n.Notification_is_read = 0 THEN 1 ELSE 0 END) as unread_count
        FROM notification n
        LEFT JOIN notification_type nt ON n.Notification_type_FK_ID = nt.Notification_type_id
        GROUP BY nt.Notification_type_id, nt.Notification_type_name
        ORDER BY nt.Notification_type_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default NotificationModel;