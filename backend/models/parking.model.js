import { connect } from "../config/db/connectMysql.js";

class ParkingModel {
  static async create({ number, status_id, type_id }) {
    try {
      const [result] = await connect.query(
        "INSERT INTO parking (Parking_number, Parking_status_ID_FK, Parking_type_ID_FK) VALUES (?, ?, ?)",
        [number, status_id, type_id]
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
        `SELECT p.*, ps.Parking_status_name, pt.Parking_type_name, vt.Vehicle_type_name
         FROM parking p
         LEFT JOIN parking_status ps ON p.Parking_status_ID_FK = ps.Parking_status_id
         LEFT JOIN parking_type pt ON p.Parking_type_ID_FK = pt.Parking_type_id
         LEFT JOIN vehicle_type vt ON p.Vehicle_type_ID_FK = vt.Vehicle_type_id
         ORDER BY p.Parking_id`
      );
      return parkings;
    } catch (error) {
      console.error("Error en ParkingModel.show:", error.message);
      throw error;
    }
  }

  static async update(id, { number, type_id, status_id }) {
    try {
      const [result] = await connect.query(
        `UPDATE parking 
             SET 
                Parking_number = ?,
                Parking_type_ID_FK = ?,
                Parking_status_ID_FK = ?
             WHERE Parking_id = ?`,
        [number, type_id, status_id, id]
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
        `SELECT p.*, ps.Parking_status_name, pt.Parking_type_name, vt.Vehicle_type_name
         FROM parking p
         LEFT JOIN parking_status ps ON p.Parking_status_ID_FK = ps.Parking_status_id
         LEFT JOIN parking_type pt ON p.Parking_type_ID_FK = pt.Parking_type_id
         LEFT JOIN vehicle_type vt ON p.Vehicle_type_ID_FK = vt.Vehicle_type_id
         WHERE p.Parking_id = ?`, 
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Error finding parking by ID:", error.message);
      throw error;
    }
  }

  static async assignVehicle(parkingId, vehicleTypeId) {
    try {
      const [result] = await connect.query(
        `UPDATE parking 
         SET Vehicle_type_ID_FK = ?
         WHERE Parking_id = ?`,
        [vehicleTypeId, parkingId]
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
        `SELECT p.*, ps.Parking_status_name, pt.Parking_type_name, vt.Vehicle_type_name
         FROM parking p
         LEFT JOIN parking_status ps ON p.Parking_status_ID_FK = ps.Parking_status_id
         LEFT JOIN parking_type pt ON p.Parking_type_ID_FK = pt.Parking_type_id
         LEFT JOIN vehicle_type vt ON p.Vehicle_type_ID_FK = vt.Vehicle_type_id
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
        `SELECT p.*, ps.Parking_status_name, pt.Parking_type_name, vt.Vehicle_type_name
         FROM parking p
         LEFT JOIN parking_status ps ON p.Parking_status_ID_FK = ps.Parking_status_id
         LEFT JOIN parking_type pt ON p.Parking_type_ID_FK = pt.Parking_type_id
         LEFT JOIN vehicle_type vt ON p.Vehicle_type_ID_FK = vt.Vehicle_type_id
         WHERE p.User_ID_FK = ?`,
        [userId]
      );
      return result;
    } catch (error) {
      console.error("Error finding parking by user:", error.message);
      throw error;
    }
  }

  // New method to reserve a parking spot
  static async reserve({ parking_id, user_id, vehicle_type_id, start_date, end_date }) {
    try {
      // First update the parking status to reserved (assuming status_id 2 is 'reserved')
      const [updateResult] = await connect.query(
        `UPDATE parking 
         SET Parking_status_ID_FK = 2,
             Vehicle_type_ID_FK = ?,
             User_ID_FK = ?,
             Parking_updatedAt = CURRENT_TIMESTAMP
         WHERE Parking_id = ?`,
        [vehicle_type_id, user_id, parking_id]
      );

      if (updateResult.affectedRows === 0) {
        return null;
      }

      // Then create a reservation record (if you have a reservation table)
      // This is optional and depends on your database schema
      const [reservationResult] = await connect.query(
        `INSERT INTO parking_reservation 
         (Parking_FK_ID, User_FK_ID, Vehicle_type_FK_ID, Reservation_start_date, Reservation_end_date)
         VALUES (?, ?, ?, ?, ?)`,
        [parking_id, user_id, vehicle_type_id, start_date, end_date]
      );

      return {
        parking_id,
        reservation_id: reservationResult.insertId,
        user_id,
        vehicle_type_id,
        start_date,
        end_date
      };
    } catch (error) {
      console.error("Error reserving parking:", error.message);
      return null;
    }
  }

  // New method to process a payment for parking
  static async processPayment({ parking_id, user_id, payment_method, amount, reference_number, payment_date }) {
    try {
      // Create a payment record
      const [paymentResult] = await connect.query(
        `INSERT INTO payment 
         (Owner_ID_FK, Payment_total_payment, Payment_Status_ID_FK, Payment_date, Payment_method, Payment_reference_number)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, amount, 1, payment_date, payment_method, reference_number]
      );

      if (paymentResult.insertId) {
        // Optionally update the parking status to 'paid' or similar
        await connect.query(
          `UPDATE parking 
           SET Parking_status_ID_FK = 3, 
               Parking_updatedAt = CURRENT_TIMESTAMP
           WHERE Parking_id = ?`,
          [parking_id]
        );

        return {
          payment_id: paymentResult.insertId,
          parking_id,
          user_id,
          amount,
          payment_method,
          reference_number,
          payment_date
        };
      }
      return null;
    } catch (error) {
      console.error("Error processing payment:", error.message);
      return null;
    }
  }
}

export default ParkingModel;
