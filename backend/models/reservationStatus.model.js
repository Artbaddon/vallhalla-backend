import { connect } from "../config/db/connectMysql.js";

class ReservationStatusModel {
  static async create({ status_name }) {
    try {
      let sqlQuery = `INSERT INTO reservation_status (Reservation_status_name) VALUES (?)`;
      const [result] = await connect.query(sqlQuery, [status_name]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async show() {
    try {
      let sqlQuery = `SELECT * FROM reservation_status ORDER BY Reservation_status_id`;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async update(id, { status_name }) {
    try {
      let sqlQuery = `UPDATE reservation_status SET Reservation_status_name = ? WHERE Reservation_status_id = ?`;
      const [result] = await connect.query(sqlQuery, [status_name, id]);
      if (result.affectedRows === 0) {
        return { error: "Reservation status not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM reservation_status WHERE Reservation_status_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      if (result.affectedRows === 0) {
        return { error: "Reservation status not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = `SELECT * FROM reservation_status WHERE Reservation_status_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0] || null;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default ReservationStatusModel; 