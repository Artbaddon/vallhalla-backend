import { connect } from "../config/db/connectMysql.js";

class FacilityModel {
  static async create({ name, description, capacity, status }) {
    try {
      // Validate status
      const validStatuses = ['available', 'maintenance', 'reserved'];
      if (!validStatuses.includes(status)) {
        return { error: "Invalid status. Must be one of: available, maintenance, reserved" };
      }

      // Check if facility name already exists
      const [existingFacility] = await connect.query('SELECT Facility_id FROM facility WHERE Facility_name = ?', [name]);
      if (existingFacility.length > 0) {
        return { error: "Facility name already exists" };
      }

      let sqlQuery = `INSERT INTO facility (Facility_name, Facility_description, Facility_capacity, Facility_status) VALUES (?, ?, ?, ?)`;
      const [result] = await connect.query(sqlQuery, [name, description, capacity, status]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT * FROM facility ORDER BY Facility_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = `SELECT * FROM facility WHERE Facility_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0] || null;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async update(id, { name, description, capacity, status }) {
    try {
      // Validate status if provided
      if (status) {
        const validStatuses = ['available', 'maintenance', 'reserved'];
        if (!validStatuses.includes(status)) {
          return { error: "Invalid status. Must be one of: available, maintenance, reserved" };
        }
      }

      // Check if facility name already exists (excluding current facility)
      if (name) {
        const [existingFacility] = await connect.query('SELECT Facility_id FROM facility WHERE Facility_name = ? AND Facility_id != ?', [name, id]);
        if (existingFacility.length > 0) {
          return { error: "Facility name already exists" };
        }
      }

      let sqlQuery = "UPDATE facility SET Facility_name = ?, Facility_description = ?, Facility_capacity = ?, Facility_status = ? WHERE Facility_id = ?";
      const [result] = await connect.query(sqlQuery, [name, description, capacity, status, id]);
      if (result.affectedRows === 0) {
        return { error: "Facility not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM facility WHERE Facility_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      if (result.affectedRows === 0) {
        return { error: "Facility not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByStatus(status) {
    try {
      let sqlQuery = `SELECT * FROM facility WHERE Facility_status = ?`;
      const [result] = await connect.query(sqlQuery, [status]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async updateStatus(id, status) {
    try {
      // Validate status
      const validStatuses = ['available', 'maintenance', 'reserved'];
      if (!validStatuses.includes(status)) {
        return { error: "Invalid status. Must be one of: available, maintenance, reserved" };
      }

      let sqlQuery = "UPDATE facility SET Facility_status = ? WHERE Facility_id = ?";
      const [result] = await connect.query(sqlQuery, [status, id]);
      if (result.affectedRows === 0) {
        return { error: "Facility not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async checkAvailability(start_date, end_date) {
    try {
      // Get all available facilities that don't have conflicting reservations
      let sqlQuery = `
        SELECT f.* 
        FROM facility f
        WHERE f.Facility_status = 'available'
        AND NOT EXISTS (
          SELECT 1 FROM reservation r 
          WHERE r.Facility_FK_ID = f.Facility_id
          AND r.Reservation_status_FK_ID != 3  -- Not cancelled
          AND (
            (r.Reservation_start_date <= ? AND r.Reservation_end_date >= ?)
            OR (r.Reservation_start_date <= ? AND r.Reservation_end_date >= ?)
            OR (r.Reservation_start_date >= ? AND r.Reservation_end_date <= ?)
          )
        )
      `;
      const [result] = await connect.query(sqlQuery, [end_date, start_date, start_date, end_date, start_date, end_date]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default FacilityModel; 