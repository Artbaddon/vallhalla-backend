import { connect } from "../config/db/connectMysql.js";

class GuardModel {
  static async create({ user_id, arl, eps, shift }) {
    try {
      let sqlQuery = `INSERT INTO guard (User_FK_ID, Guard_arl, Guard_eps, Guard_shift, Guard_createdAt, Guard_updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())`;
      const [result] = await connect.query(sqlQuery, [
        user_id,
        arl,
        eps,
        shift,
      ]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async show() {
    try {
      let sqlQuery = `
        SELECT g.*, u.Users_name, u.Users_createdAt, us.User_status_name
        FROM guard g
        LEFT JOIN users u ON g.User_FK_ID = u.Users_id
        LEFT JOIN user_status us ON u.User_status_FK_ID = us.User_status_id
        ORDER BY g.Guard_createdAt DESC
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async update(id, { user_id, arl, eps, shift }) {
    try {
      let sqlQuery = `UPDATE guard SET User_FK_ID = ?, Guard_arl = ?, Guard_eps = ?, Guard_shift = ?, Guard_updatedAt = NOW() WHERE Guard_id = ?`;
      const [result] = await connect.query(sqlQuery, [
        user_id,
        arl,
        eps,
        shift,
        id,
      ]);
      if (result.affectedRows === 0) {
        return { error: "Guard not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM guard WHERE Guard_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);

      if (result.affectedRows === 0) {
        return { error: "Guard not found" };
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
        SELECT g.*, u.Users_name, u.Users_createdAt, us.User_status_name
        FROM guard g
        LEFT JOIN users u ON g.User_FK_ID = u.Users_id
        LEFT JOIN user_status us ON u.User_status_FK_ID = us.User_status_id
        WHERE g.Guard_id = ?
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

  static async findByShift(shift) {
    try {
      let sqlQuery = `
        SELECT g.*, u.Users_name, us.User_status_name
        FROM guard g
        LEFT JOIN users u ON g.User_FK_ID = u.Users_id
        LEFT JOIN user_status us ON u.User_status_FK_ID = us.User_status_id
        WHERE g.Guard_shift = ?
        ORDER BY g.Guard_createdAt DESC
      `;
      const [result] = await connect.query(sqlQuery, [shift]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default GuardModel;
