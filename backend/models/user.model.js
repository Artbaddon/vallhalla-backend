import { connect } from "../config/db/connectMysql.js";

class UserModel {
  static async create({ name, password, user_status_id, role_id }) {
    try {
      let sqlQuery = `INSERT INTO users (Users_name, Users_password, User_status_FK_ID, Role_FK_ID, Users_createdAt, Users_updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())`;
      const [result] = await connect.query(sqlQuery, [name, password, user_status_id, role_id]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT * FROM users ORDER BY Users_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async update(id, { name, user_status_id, role_id }) {
    try {
      let sqlQuery = "UPDATE users SET Users_name = ?, User_status_FK_ID = ?, Role_FK_ID = ?, Users_updatedAt = NOW() WHERE Users_id = ?";
      const [result] = await connect.query(sqlQuery, [name, user_status_id, role_id, id]);
      if (result.affectedRows === 0) {
        return { error: "User not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM users WHERE Users_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      if (result.affectedRows === 0) {
        return { error: "User not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = `SELECT * FROM users WHERE Users_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0] || null;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByName(name) {
    try {
      let sqlQuery = `SELECT * FROM users WHERE Users_name = ?`;
      const [result] = await connect.query(sqlQuery, [name]);
      return result[0] || null;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async getUsersWithDetails() {
    try {
      let sqlQuery = `
        SELECT 
          u.Users_id,
          u.Users_name,
          us.User_status_name,
          r.Role_name,
          u.Users_createdAt,
          u.Users_updatedAt
        FROM users u
        LEFT JOIN user_status us ON u.User_status_FK_ID = us.User_status_id
        LEFT JOIN role r ON u.Role_FK_ID = r.Role_id
        ORDER BY u.Users_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async updateStatus(id, status_id) {
    try {
      let sqlQuery = "UPDATE users SET User_status_FK_ID = ?, Users_updatedAt = NOW() WHERE Users_id = ?";
      const [result] = await connect.query(sqlQuery, [status_id, id]);
      if (result.affectedRows === 0) {
        return { error: "User not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async updatePassword(id, hashedPassword) {
    try {
      let sqlQuery = "UPDATE users SET Users_password = ?, Users_updatedAt = NOW() WHERE Users_id = ?";
      const [result] = await connect.query(sqlQuery, [hashedPassword, id]);
      if (result.affectedRows === 0) {
        return false;
      }
      return true;
    } catch (error) {
      console.error("Update password error:", error);
      return false;
    }
  }
}

export default UserModel;
