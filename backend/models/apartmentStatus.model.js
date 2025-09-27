import { connect } from "../config/db/connectMysql.js";

class AparmentStatusModel {
  static async create({ name }) {
    try {
      let sqlQuery = `INSERT INTO apartment_status (Apartment_status_name) VALUES (?)`;
      const [result] = await connect.query(sqlQuery, [name]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT * FROM `apartment_status` ORDER BY `Apartment_status_id` ";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
  static async update(id, { name }) {
    try {
      let sqlQuery =
        "UPDATE apartment_status SET Apartment_status_name = ? WHERE Apartment_status_id = ?";
      const [result] = await connect.query(sqlQuery, [name, id]);
      if (result.affectedRows === 0) {
        return { error: "Apartment status not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM apartment_status WHERE Apartment_status_id = ?`;
      const [result] = await connect.query(sqlQuery, id);

      if (result.affectedRows === 0) {
        return { error: "Aparment status not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }
  static async findById(id) {
    try {
      let sqlQuery = `SELECT * FROM apartment_status WHERE Apartment_status_id = ?`;
      const [result] = await connect.query(sqlQuery, id);

      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default AparmentStatusModel;
