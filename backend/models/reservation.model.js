import { connect } from "../config/db/connectMysql.js";

class ReservationModel {
  static async validateForeignKeys({ owner_id, type_id, status_id, facility_id }) {
    try {
      // Check if owner exists
      if (owner_id) {
        const [ownerResult] = await connect.query('SELECT Owner_id FROM owner WHERE Owner_id = ?', [owner_id]);
        if (ownerResult.length === 0) {
          return { error: "Owner not found" };
        }
      }

      // Check if type exists
      if (type_id) {
        const [typeResult] = await connect.query('SELECT Reservation_type_id FROM reservation_type WHERE Reservation_type_id = ?', [type_id]);
        if (typeResult.length === 0) {
          return { error: "Reservation type not found" };
        }
      }

      // Check if status exists
      if (status_id) {
        const [statusResult] = await connect.query('SELECT Reservation_status_id FROM reservation_status WHERE Reservation_status_id = ?', [status_id]);
        if (statusResult.length === 0) {
          return { error: "Reservation status not found" };
        }
      }

      // Check if facility exists
      if (facility_id) {
        const [facilityResult] = await connect.query('SELECT Facility_id FROM facility WHERE Facility_id = ?', [facility_id]);
        if (facilityResult.length === 0) {
          return { error: "Facility not found" };
        }
      }

      return { valid: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  static async create({ owner_id, type_id, status_id, facility_id, start_date, end_date, description }) {
    try {
      // Validate foreign keys first
      const validation = await this.validateForeignKeys({ owner_id, type_id, status_id, facility_id });
      if (validation.error) {
        return { error: validation.error };
      }

      // Check if facility is available for the requested time slot
      if (facility_id) {
        const [conflictingReservations] = await connect.query(`
          SELECT r.* FROM reservation r
          WHERE r.Facility_FK_ID = ?
          AND r.Reservation_status_FK_ID != 2  -- Not cancelled
          AND (
            (r.Reservation_start_date <= ? AND r.Reservation_end_date >= ?)
            OR (r.Reservation_start_date <= ? AND r.Reservation_end_date >= ?)
            OR (r.Reservation_start_date >= ? AND r.Reservation_end_date <= ?)
          )
        `, [facility_id, end_date, start_date, start_date, end_date, start_date, end_date]);

        if (conflictingReservations.length > 0) {
          return { error: "Facility is not available for the requested time slot" };
        }
      }

      let sqlQuery = `INSERT INTO reservation (Owner_FK_ID, Reservation_type_FK_ID, Reservation_status_FK_ID, Facility_FK_ID, Reservation_start_date, Reservation_end_date, Reservation_description, Reservation_createdAt, Reservation_updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
      const [result] = await connect.query(sqlQuery, [owner_id, type_id, status_id, facility_id, start_date, end_date, description]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async show() {
    try {
      let sqlQuery = `
        SELECT r.*, rs.Reservation_status_name, rt.Reservation_type_name, 
               o.Owner_id, u.Users_name as owner_name,
               f.Facility_name, f.Facility_capacity
        FROM reservation r
        LEFT JOIN reservation_status rs ON r.Reservation_status_FK_ID = rs.Reservation_status_id
        LEFT JOIN reservation_type rt ON r.Reservation_type_FK_ID = rt.Reservation_type_id
        LEFT JOIN owner o ON r.Owner_FK_ID = o.Owner_id
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
        LEFT JOIN facility f ON r.Facility_FK_ID = f.Facility_id
        ORDER BY r.Reservation_createdAt DESC
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async update(id, { owner_id, type_id, status_id, facility_id, start_date, end_date, description }) {
    try {
      // Validate foreign keys first
      const validation = await this.validateForeignKeys({ owner_id, type_id, status_id, facility_id });
      if (validation.error) {
        return { error: validation.error };
      }

      // Check if facility is available for the requested time slot
      if (facility_id) {
        const [conflictingReservations] = await connect.query(`
          SELECT r.* FROM reservation r
          WHERE r.Facility_FK_ID = ?
          AND r.Reservation_id != ?
          AND r.Reservation_status_FK_ID != 2  -- Not cancelled
          AND (
            (r.Reservation_start_date <= ? AND r.Reservation_end_date >= ?)
            OR (r.Reservation_start_date <= ? AND r.Reservation_end_date >= ?)
            OR (r.Reservation_start_date >= ? AND r.Reservation_end_date <= ?)
          )
        `, [facility_id, id, end_date, start_date, start_date, end_date, start_date, end_date]);

        if (conflictingReservations.length > 0) {
          return { error: "Facility is not available for the requested time slot" };
        }
      }

      let sqlQuery = `UPDATE reservation SET Owner_FK_ID = ?, Reservation_type_FK_ID = ?, Reservation_status_FK_ID = ?, Facility_FK_ID = ?, Reservation_start_date = ?, Reservation_end_date = ?, Reservation_description = ?, Reservation_updatedAt = NOW() WHERE Reservation_id = ?`;
      const [result] = await connect.query(sqlQuery, [owner_id, type_id, status_id, facility_id, start_date, end_date, description, id]);
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
               o.Owner_id, u.Users_name as owner_name,
               f.Facility_name, f.Facility_capacity
        FROM reservation r
        LEFT JOIN reservation_status rs ON r.Reservation_status_FK_ID = rs.Reservation_status_id
        LEFT JOIN reservation_type rt ON r.Reservation_type_FK_ID = rt.Reservation_type_id
        LEFT JOIN owner o ON r.Owner_FK_ID = o.Owner_id
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
        LEFT JOIN facility f ON r.Facility_FK_ID = f.Facility_id
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
        SELECT r.*, rs.Reservation_status_name, rt.Reservation_type_name,
               f.Facility_name, f.Facility_capacity
        FROM reservation r
        LEFT JOIN reservation_status rs ON r.Reservation_status_FK_ID = rs.Reservation_status_id
        LEFT JOIN reservation_type rt ON r.Reservation_type_FK_ID = rt.Reservation_type_id
        LEFT JOIN facility f ON r.Facility_FK_ID = f.Facility_id
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
               o.Owner_id, u.Users_name as owner_name,
               f.Facility_name, f.Facility_capacity
        FROM reservation r
        LEFT JOIN reservation_status rs ON r.Reservation_status_FK_ID = rs.Reservation_status_id
        LEFT JOIN reservation_type rt ON r.Reservation_type_FK_ID = rt.Reservation_type_id
        LEFT JOIN owner o ON r.Owner_FK_ID = o.Owner_id
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
        LEFT JOIN facility f ON r.Facility_FK_ID = f.Facility_id
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