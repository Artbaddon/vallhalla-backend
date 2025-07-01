import { connect } from "../config/db/connectMysql.js";

class ParkingModel {
  static async create({ number, status_id, type_id }) {
    try {
      const [result] = await connect.query(
        "INSERT INTO parking (Parking_number, Parking_status_id, Parking_type_id) VALUES (?, ?, ?)",
        [number, status_id, type_id]
      );
      return result.insertId; // Retorna solo el ID insertado
    } catch (error) {
      console.error("Error creating parking:", error.message);
      return null;
    }
  }

  static async show() {
    try {
      const [parkings] = await connect.query(
        "CALL sp_list_parkings_with_details()"
      );
      return parkings[0];
    } catch (error) {
      console.error("Error en ParkingModel.show:", error.message);
      return []; // Retornar array vacío en lugar de [0] para consistencia
    }
  }

  static async update(id, { number, type_id, status_id }) {
    try {
      const [result] = await connect.query(
        `UPDATE parking 
             SET 
                Parking_number = ?,
                Parking_type_id = ?,
                Parking_status_id = ?,
                Parking_updatedAt = CURRENT_TIMESTAMP
             WHERE Parking_id = ?`,
        [number, type_id, status_id, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error updating parking:", error.message);
      return false;
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = "DELETE FROM parking WHERE Parking_id=?";
      const [result] = await connect.query(sqlQuery, id);
      if (result.affectedRows === 0) {
        return [0];
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return [0];
    }
  }

  static async findById(id) {
    try {
      const [result] = await connect.query("CALL sp_get_parking_by_id(?)", [
        id,
      ]);
      return result[0][0] || null;
    } catch (error) {
      console.error("Error finding parking by ID:", error.message);
      return null;
    }
  }

  static async assignVehicle(parkingId, vehicleTypeId) {
    try {
      const [result] = await connect.query(
        `UPDATE parking 
         SET Vehicle_type_id = ?, 
             Parking_updatedAt = CURRENT_TIMESTAMP 
         WHERE Parking_id = ?`,
        [vehicleTypeId, parkingId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error asignando vehículo al parqueadero:", error.message);
      return false;
    }
  }

  // New method to find parking spots by status
  static async findByStatus(statusId) {
    try {
      const [result] = await connect.query(
        `SELECT p.*, ps.Parking_status_name, vt.Vehicle_type_name
         FROM parking p
         LEFT JOIN parking_status ps ON p.Parking_status_id = ps.Parking_status_id
         LEFT JOIN vehicle_type vt ON p.Vehicle_type_id = vt.Vehicle_type_id
         WHERE p.Parking_status_id = ?`,
        [statusId]
      );
      return result;
    } catch (error) {
      console.error("Error finding parking by status:", error.message);
      return [];
    }
  }

  // New method to reserve a parking spot
  static async reserve({ parking_id, user_id, vehicle_type_id, start_date, end_date }) {
    try {
      // First update the parking status to reserved (assuming status_id 2 is 'reserved')
      const [updateResult] = await connect.query(
        `UPDATE parking 
         SET Parking_status_id = 2,
             Vehicle_type_id = ?,
             User_FK_ID = ?,
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

  // New method to find parking spots by user
  static async findByUser(userId) {
    try {
      const [result] = await connect.query(
        `SELECT p.*, ps.Parking_status_name, vt.Vehicle_type_name
         FROM parking p
         LEFT JOIN parking_status ps ON p.Parking_status_id = ps.Parking_status_id
         LEFT JOIN vehicle_type vt ON p.Vehicle_type_id = vt.Vehicle_type_id
         WHERE p.User_FK_ID = ?`,
        [userId]
      );
      return result;
    } catch (error) {
      console.error("Error finding parking by user:", error.message);
      return [];
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
           SET Parking_status_id = 3, 
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
