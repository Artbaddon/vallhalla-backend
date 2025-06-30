import { connect } from "../config/db/connectMysql.js";

class ReservationModel {
  static async create({ owner_id, type_id, status_id, start_date, end_date, description }) {
    try {
      let sqlQuery = `INSERT INTO reservation (Owner_FK_ID, Reservation_type_FK_ID, Reservation_status_FK_ID, Reservation_start_date, Reservation_end_date, Reservation_description, Reservation_createdAt, Reservation_updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`;
      const [result] = await connect.query(sqlQuery, [owner_id, type_id, status_id, start_date, end_date, description]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async show() {
    try {
      let sqlQuery = `
        SELECT r.*, rs.Reservation_status_name, rt.Reservation_type_name, 
               o.Owner_id, u.Users_name as owner_name
        FROM reservation r
        LEFT JOIN reservation_status rs ON r.Reservation_status_FK_ID = rs.Reservation_status_id
        LEFT JOIN reservation_type rt ON r.Reservation_type_FK_ID = rt.Reservation_type_id
        LEFT JOIN owner o ON r.Owner_FK_ID = o.Owner_id
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
        ORDER BY r.Reservation_createdAt DESC
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async update(id, { owner_id, type_id, status_id, start_date, end_date, description }) {
    try {
      let sqlQuery = `UPDATE reservation SET Owner_FK_ID = ?, Reservation_type_FK_ID = ?, Reservation_status_FK_ID = ?, Reservation_start_date = ?, Reservation_end_date = ?, Reservation_description = ?, Reservation_updatedAt = NOW() WHERE Reservation_id = ?`;
      const [result] = await connect.query(sqlQuery, [owner_id, type_id, status_id, start_date, end_date, description, id]);
      if (result.affectedRows === 0) {
        return { error: "Reservation not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM reservation WHERE Reservation_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);

      if (result.affectedRows === 0) {
        return { error: "Reservation not found" };
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
        SELECT r.*, rs.Reservation_status_name, rt.Reservation_type_name,
               o.Owner_id, u.Users_name as owner_name
        FROM reservation r
        LEFT JOIN reservation_status rs ON r.Reservation_status_FK_ID = rs.Reservation_status_id
        LEFT JOIN reservation_type rt ON r.Reservation_type_FK_ID = rt.Reservation_type_id
        LEFT JOIN owner o ON r.Owner_FK_ID = o.Owner_id
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
        WHERE r.Reservation_id = ?
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

  static async findByOwner(owner_id) {
    try {
      let sqlQuery = `
        SELECT r.*, rs.Reservation_status_name, rt.Reservation_type_name
        FROM reservation r
        LEFT JOIN reservation_status rs ON r.Reservation_status_FK_ID = rs.Reservation_status_id
        LEFT JOIN reservation_type rt ON r.Reservation_type_FK_ID = rt.Reservation_type_id
        WHERE r.Owner_FK_ID = ?
        ORDER BY r.Reservation_createdAt DESC
      `;
      const [result] = await connect.query(sqlQuery, [owner_id]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByDateRange(start_date, end_date) {
    try {
      let sqlQuery = `
        SELECT r.*, rs.Reservation_status_name, rt.Reservation_type_name,
               o.Owner_id, u.Users_name as owner_name
        FROM reservation r
        LEFT JOIN reservation_status rs ON r.Reservation_status_FK_ID = rs.Reservation_status_id
        LEFT JOIN reservation_type rt ON r.Reservation_type_FK_ID = rt.Reservation_type_id
        LEFT JOIN owner o ON r.Owner_FK_ID = o.Owner_id
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
        WHERE r.Reservation_start_date >= ? AND r.Reservation_end_date <= ?
        ORDER BY r.Reservation_start_date
      `;
      const [result] = await connect.query(sqlQuery, [start_date, end_date]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default ReservationModel;