import { connect } from "../config/db/connectMysql.js";

class ReservationModel {
  static async validateForeignKeys({ owner_id, type_id, status_id }) {
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

      return { valid: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  static async checkOverlappingReservations(facility_id, start_date, end_date, exclude_id = null) {
    try {
      let sqlQuery = `
        SELECT r.*, rs.Reservation_status_name, rt.Reservation_type_name
        FROM reservation r
        LEFT JOIN reservation_status rs ON r.Reservation_status_FK_ID = rs.Reservation_status_id
        LEFT JOIN reservation_type rt ON r.Reservation_type_FK_ID = rt.Reservation_type_id
        WHERE r.Facility_FK_ID = ?
        AND r.Reservation_status_FK_ID != 4 -- Not cancelled
        AND r.Reservation_status_FK_ID != 5 -- Not no-show
        AND (
          (r.Reservation_start_time <= ? AND r.Reservation_end_time > ?)
          OR
          (r.Reservation_start_time < ? AND r.Reservation_end_time >= ?)
          OR
          (r.Reservation_start_time >= ? AND r.Reservation_start_time < ?)
        )
      `;

      const params = [
        facility_id,
        end_date, start_date,    // First condition
        end_date, end_date,      // Second condition
        start_date, end_date     // Third condition
      ];

      // If we're updating a reservation, exclude the current reservation from the check
      if (exclude_id) {
        sqlQuery += ' AND r.Reservation_id != ?';
        params.push(exclude_id);
      }

      const [result] = await connect.query(sqlQuery, params);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async create({ owner_id, type_id, status_id, facility_id, start_date, end_date, description }) {
    try {
      // Validate foreign keys first
      const validation = await this.validateForeignKeys({ owner_id, type_id, status_id });
      if (validation.error) {
        return { error: validation.error };
      }

      // Check for overlapping reservations
      const overlapping = await this.checkOverlappingReservations(facility_id, start_date, end_date);
      if (overlapping.error) {
        return { error: overlapping.error };
      }
      if (overlapping.length > 0) {
        return { error: "This facility is already reserved for the selected time period" };
      }

      let sqlQuery = `INSERT INTO reservation (
        Owner_FK_ID, 
        Reservation_type_FK_ID, 
        Reservation_status_FK_ID, 
        Facility_FK_ID,
        Reservation_start_time, 
        Reservation_end_time, 
        Reservation_description
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      
      const [result] = await connect.query(sqlQuery, [
        owner_id, 
        type_id, 
        status_id, 
        facility_id,
        start_date, 
        end_date, 
        description
      ]);
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
        ORDER BY r.Reservation_start_time DESC
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
      const validation = await this.validateForeignKeys({ owner_id, type_id, status_id });
      if (validation.error) {
        return { error: validation.error };
      }

      // Check for overlapping reservations (excluding this reservation)
      if (facility_id && start_date && end_date) {
        const overlapping = await this.checkOverlappingReservations(facility_id, start_date, end_date, id);
        if (overlapping.error) {
          return { error: overlapping.error };
        }
        if (overlapping.length > 0) {
          return { error: "This facility is already reserved for the selected time period" };
        }
      }

      let sqlQuery = `UPDATE reservation SET 
        Owner_FK_ID = ?, 
        Reservation_type_FK_ID = ?, 
        Reservation_status_FK_ID = ?, 
        Facility_FK_ID = ?,
        Reservation_start_time = ?, 
        Reservation_end_time = ?, 
        Reservation_description = ?,
        updatedAt = NOW()
        WHERE Reservation_id = ?`;
      
      const [result] = await connect.query(sqlQuery, [
        owner_id, 
        type_id, 
        status_id, 
        facility_id,
        start_date, 
        end_date, 
        description, 
        id
      ]);
      
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
        ORDER BY r.Reservation_start_time DESC
      `;
      const [result] = await connect.query(sqlQuery, [owner_id]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByDateRange(start_time, end_time) {
    try {
      let sqlQuery = `
        SELECT r.*, rs.Reservation_status_name, rt.Reservation_type_name
        FROM reservation r
        LEFT JOIN reservation_status rs ON r.Reservation_status_FK_ID = rs.Reservation_status_id
        LEFT JOIN reservation_type rt ON r.Reservation_type_FK_ID = rt.Reservation_type_id
        WHERE r.Reservation_start_time >= ? AND r.Reservation_end_time <= ?
        ORDER BY r.Reservation_start_time DESC
      `;
      const [result] = await connect.query(sqlQuery, [start_time, end_time]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default ReservationModel;