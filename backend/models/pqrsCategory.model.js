import { connect } from "../config/db/connectMysql.js";

class PQRSCategoryModel {
  static async create({ name, description }) {
    try {
      let sqlQuery = `INSERT INTO pqrs_category (PQRS_category_name) VALUES (?)`;
      const [result] = await connect.query(sqlQuery, [name]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT * FROM `pqrs_category` ORDER BY `PQRS_category_id`";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async update(id, { name }) {
    try {
      let sqlQuery = `UPDATE pqrs_category SET PQRS_category_name = ? WHERE PQRS_category_id = ?`;
      const [result] = await connect.query(sqlQuery, [name, id]);
      if (result.affectedRows === 0) {
        return { error: "PQRS category not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM pqrs_category WHERE PQRS_category_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);

      if (result.affectedRows === 0) {
        return { error: "PQRS category not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = `SELECT * FROM pqrs_category WHERE PQRS_category_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);

      if (result.length === 0) {
        return null;
      }
      return result[0];
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default PQRSCategoryModel;