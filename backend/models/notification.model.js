import { connect } from "../config/db/connectMysql.js";

class NotificationModel {
  static async create({ 
    type_id, 
    description,
    user_id // null or 0 for all users
  }) {
    try {
      let sqlQuery = `INSERT INTO notification (
        Notification_type_FK_ID, 
        Notification_description, 
        Notification_User_FK_ID,
        Notification_createdAt, 
        Notification_updatedAt
      ) VALUES (?, ?, ?, NOW(), NOW())`;
      
      const [result] = await connect.query(sqlQuery, [
        type_id, 
        description,
        user_id === 0 ? null : user_id // Convert 0 to null for database
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
    description,
    user_id
  }) {
    try {
      let sqlQuery = `UPDATE notification SET 
        Notification_type_FK_ID = ?, 
        Notification_description = ?, 
        Notification_User_FK_ID = ?,
        Notification_updatedAt = NOW() 
        WHERE Notification_id = ?`;
      
      const [result] = await connect.query(sqlQuery, [
        type_id, 
        description,
        user_id === 0 ? null : user_id, // Convert 0 to null for database
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

  static async findByUser(user_id) {
    try {
      let sqlQuery = `
        SELECT n.*, nt.Notification_type_name
        FROM notification n
        LEFT JOIN notification_type nt ON n.Notification_type_FK_ID = nt.Notification_type_id
        WHERE n.Notification_User_FK_ID = ? OR n.Notification_User_FK_ID IS NULL
        ORDER BY n.Notification_createdAt DESC
      `;
      const [result] = await connect.query(sqlQuery, [user_id]);
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
          SUM(CASE WHEN n.Notification_User_FK_ID IS NULL THEN 1 ELSE 0 END) as all_users_count,
          SUM(CASE WHEN n.Notification_User_FK_ID IS NOT NULL THEN 1 ELSE 0 END) as specific_users_count
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