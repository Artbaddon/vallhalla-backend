import { connect } from "../config/db/connectMysql.js";

class UserStatusModel {
  static async create({ name }) {
    try {
      let sqlQuery = `INSERT INTO user_status (User_status_name) VALUES (?)`;
      const [result] = await connect.query(sqlQuery, [name]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT * FROM `user_status` ORDER BY `User_status_id`";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async update(id, { name }) {
    try {
      let sqlQuery = `UPDATE user_status SET User_status_name = ? WHERE User_status_id = ?`;
      const [result] = await connect.query(sqlQuery, [name, id]);
      if (result.affectedRows === 0) {
        return { error: "User status not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM user_status WHERE User_status_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);

      if (result.affectedRows === 0) {
        return { error: "User status not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = `SELECT * FROM user_status WHERE User_status_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);

      if (result.length === 0) {
        return null;
      }
      return result[0];
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByName(name) {
    try {
      let sqlQuery = `SELECT * FROM user_status WHERE User_status_name = ?`;
      const [result] = await connect.query(sqlQuery, [name]);

      if (result.length === 0) {
        return null;
      }
      return result[0];
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default UserStatusModel;
