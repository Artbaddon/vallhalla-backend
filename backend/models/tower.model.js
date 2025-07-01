import { connect } from "../config/db/connectMysql.js";

class towerModel {
  static async create({ Tower_name }) {
    try {
      let sqlQuery = `INSERT INTO tower (Tower_name) VALUES (?)`;
      const [result] = await connect.query(sqlQuery, [Tower_name]);
      return result.insertTower_id;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT * FROM `tower` ORDER BY `Tower_id` ";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
  static async update(Tower_id, { Tower_name }) {
    try {
      let sqlQuery = `UPDATE tower SET Tower_name = ?, updated_at = CURRENT_TIMESTAMP WHERE Tower_id = ?`;
      const [result] = await connect.query(sqlQuery, [Tower_name, Tower_id]);
      if (result.affectedRows === 0) {
        return { error: "User status not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async delete(Tower_id) {
    try {
      let sqlQuery = `DELETE FROM tower WHERE Tower_id = ?`;
      const [result] = await connect.query(sqlQuery, Tower_id);

      if (result.affectedRows === 0) {
        return { error: "User status not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }
  static async findByTower_id(Tower_id) {
    try {
      let sqlQuery = `SELECT * FROM tower WHERE Tower_id = ?`;
      const [result] = await connect.query(sqlQuery, Tower_id);

      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default towerModel;
