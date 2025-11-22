import { connect } from "../config/db/connectMysql.js";
import { resolveOwnerId } from "../utils/ownerUtils.js";

class ParkingModel {
  static async create({ number, status_id, type_id, user_id }) {
    try {
      const [result] = await connect.query(
        "INSERT INTO parking (Parking_number, Parking_status_ID_FK, Parking_type_ID_FK, User_ID_FK) VALUES (?, ?, ?, ?)",
        [number, status_id, type_id, user_id]
      );
      return result.insertId;
    } catch (error) {
      console.error("Error creating parking:", error.message);
      throw error;
    }
  }

  static async show() {
    try {
      const [parkings] = await connect.query(
        `SELECT p.*, ps.Parking_status_name, pt.Parking_type_name, vt.Vehicle_type_name, u.Users_name
         FROM parking p
         LEFT JOIN parking_status ps ON p.Parking_status_ID_FK = ps.Parking_status_id
         LEFT JOIN parking_type pt ON p.Parking_type_ID_FK = pt.Parking_type_id
         LEFT JOIN vehicle_type vt ON p.Vehicle_type_ID_FK = vt.Vehicle_type_id
         LEFT JOIN users u ON p.User_ID_FK = u.Users_id
         ORDER BY p.Parking_id`
      );
      return parkings;
    } catch (error) {
      console.error("Error en ParkingModel.show:", error.message);
      throw error;
    }
  }

  static async getTypes() {
    try {
      const [result] = await connect.query(
        `SELECT * FROM parking_type ORDER BY Parking_type_id;`
      );
      return result;
    } catch (error) {
      console.error("Error en ParkingModel.getTypes:", error.message);
    }
  }

  static async getStatus() {
    try {
      const [result] = await connect.query(
        `SELECT * FROM parking_status ORDER BY Parking_status_id;`
      );
      return result;
    } catch (error) {
      console.error("Error en ParkingModel.getStatus:", error.message);
    }
  }

  static async update(id, { number, type_id, status_id, user_id }) {
    try {
      const [result] = await connect.query(
        `UPDATE parking 
             SET 
                Parking_number = ?,
                Parking_type_ID_FK = ?,
                Parking_status_ID_FK = ?,
                User_ID_FK = ?
             WHERE Parking_id = ?`,
        [number, type_id, status_id, user_id, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error updating parking:", error.message);
      throw error;
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = "DELETE FROM parking WHERE Parking_id=?";
      const [result] = await connect.query(sqlQuery, id);
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await connect.query(
        `SELECT p.*, ps.Parking_status_name, pt.Parking_type_name, vt.Vehicle_type_name, u.Users_name
       FROM parking p
       LEFT JOIN parking_status ps ON p.Parking_status_ID_FK = ps.Parking_status_id
       LEFT JOIN parking_type pt ON p.Parking_type_ID_FK = pt.Parking_type_id
       LEFT JOIN vehicle_type vt ON p.Vehicle_type_ID_FK = vt.Vehicle_type_id
       LEFT JOIN users u ON p.User_ID_FK = u.Users_id
       WHERE p.Parking_id = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Error finding parking by ID:", error.message);
      throw error;
    }
  }

  static async assignVehicle(parkingId, vehicleTypeId, userId) {
    try {
      const [result] = await connect.query(
        `UPDATE parking 
         SET Vehicle_type_ID_FK = ?,
             User_ID_FK = ?,
             Parking_status_ID_FK = 1,
             Parking_updatedAt = CURRENT_TIMESTAMP
         WHERE Parking_id = ?`,
        [vehicleTypeId, userId, parkingId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error asignando vehículo al parqueadero:", error.message);
      throw error;
    }
  }

  static async findByStatus(statusId) {
    try {
      const [result] = await connect.query(
        `SELECT p.*, ps.Parking_status_name, pt.Parking_type_name, vt.Vehicle_type_name, u.Users_name
         FROM parking p
         LEFT JOIN parking_status ps ON p.Parking_status_ID_FK = ps.Parking_status_id
         LEFT JOIN parking_type pt ON p.Parking_type_ID_FK = pt.Parking_type_id
         LEFT JOIN vehicle_type vt ON p.Vehicle_type_ID_FK = vt.Vehicle_type_id
         LEFT JOIN users u ON p.User_ID_FK = u.Users_id
         WHERE p.Parking_status_ID_FK = ?`,
        [statusId]
      );
      return result;
    } catch (error) {
      console.error("Error finding parking by status:", error.message);
      throw error;
    }
  }

  static async findByUser(userId) {
    try {
      const [result] = await connect.query(
        `SELECT p.*, ps.Parking_status_name, pt.Parking_type_name, vt.Vehicle_type_name, u.Users_name
         FROM parking p
         LEFT JOIN parking_status ps ON p.Parking_status_ID_FK = ps.Parking_status_id
         LEFT JOIN parking_type pt ON p.Parking_type_ID_FK = pt.Parking_type_id
         LEFT JOIN vehicle_type vt ON p.Vehicle_type_ID_FK = vt.Vehicle_type_id
         LEFT JOIN users u ON p.User_ID_FK = u.Users_id
         WHERE p.User_ID_FK = ?`,
        [userId]
      );
      return result;
    } catch (error) {
      console.error("Error finding parking by user:", error.message);
      throw error;
    }
  }

  static async reserve({
    parking_id,
    user_id,
    vehicle_type_id,
    start_date,
    end_date,
  }) {
    const connection = await connect.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Verificar disponibilidad
      const [parkingCheck] = await connection.query(
        `SELECT Parking_status_ID_FK FROM parking WHERE Parking_id = ?`,
        [parking_id]
      );

      if (parkingCheck.length === 0) {
        throw new Error("Parking spot not found");
      }

      if (parkingCheck[0].Parking_status_ID_FK !== 1) {
        // 1 = disponible
        throw new Error("Parking spot is not available");
      }

      // 2. Calcular duración en días
      const start = new Date(start_date);
      const end = new Date(end_date);
      const durationMs = end - start;
      const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24)); // Convertir ms a días

      if (durationDays <= 0) {
        throw new Error("La duración de la reserva debe ser de al menos 1 día");
      }

      // 3. Actualizar el PARKING con las fechas de reserva
      const [updateResult] = await connection.query(
        `UPDATE parking 
          SET Parking_status_ID_FK = 3, -- 3 = reservado
          Vehicle_type_ID_FK = ?,
          User_ID_FK = ?,
          reservation_start_date = ?,
          reservation_end_date = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE Parking_id = ? AND Parking_status_ID_FK = 1`,
        [vehicle_type_id, user_id, start_date, end_date, parking_id]
      );

      if (updateResult.affectedRows === 0) {
        throw new Error("Parking spot no longer available");
      }

      await connection.commit();

      return {
        parking_id,
        user_id,
        vehicle_type_id,
        start_date,
        end_date,
        duration_days: durationDays,
        status: "reserved",
      };
    } catch (error) {
      await connection.rollback();
      console.error("Error reserving parking:", error.message);
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default ParkingModel;
