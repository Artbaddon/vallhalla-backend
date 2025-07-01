import { connect } from "../config/db/connectMysql.js";

class ReservationTypeModel {
  static async create({ type_name }) {
    try {
      let sqlQuery = `INSERT INTO reservation_type (Reservation_type_name) VALUES (?)`;
      const [result] = await connect.query(sqlQuery, [type_name]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async show() {
    try {
      let sqlQuery = `SELECT * FROM reservation_type ORDER BY Reservation_type_id`;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async update(id, { type_name }) {
    try {
      let sqlQuery = `UPDATE reservation_type SET Reservation_type_name = ? WHERE Reservation_type_id = ?`;
      const [result] = await connect.query(sqlQuery, [type_name, id]);
      if (result.affectedRows === 0) {
        return { error: "Reservation type not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM reservation_type WHERE Reservation_type_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      if (result.affectedRows === 0) {
        return { error: "Reservation type not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = `SELECT * FROM reservation_type WHERE Reservation_type_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0] || null;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default ReservationTypeModel; 