import { connect } from "../config/db/connectMysql.js";
import { resolveOwnerId } from "../utils/ownerUtils.js";

class ParkingModel {
  static async create({ number, status_id, type_id, user_id, vehicle_id }) {
    try {
      const [result] = await connect.query(
        // 2. AÑADIR la columna Vehicle_type_ID_FK
        "INSERT INTO parking (Parking_number, Parking_status_ID_FK, Parking_type_ID_FK, User_ID_FK, Vehicle_type_ID_FK) VALUES (?, ?, ?, ?, ?)",
        // 3. AÑADIR el valor de vehicle_id
        [number, status_id, type_id, user_id || null, vehicle_id]
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
  static async getStatus() {
    try {
      const [result] = await connect.query(
        `SELECT * FROM parking_status ORDER BY Parking_status_id;`
      );
      return result;
    } catch (error) {
      console.error("Error en ParkingModel.getTypes:", error.message);
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

  static async findByUser(userId) {
    try {
      const [result] = await connect.query(
        `SELECT 
         p.Parking_id,
         p.Parking_number,
         ps.Parking_status_name as status,
         pt.Parking_type_name as type,
         vt.Vehicle_type_name as vehicle_type,
         u.Users_name as user_name,
         p.reservation_start_date,
         p.reservation_end_date,
         p.created_at,
         p.updated_at
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

  // New method to reserve a parking spot
  static async reserve({
    parking_id,
    user_id,
    vehicle_id,
    start_date,
    end_date,
  }) {
    const connection = await connect.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Verificar que el vehículo exista y pertenezca al usuario
      const [vehicleCheck] = await connection.query(
        `SELECT v.*, vt.Vehicle_type_name 
       FROM vehicles v 
       INNER JOIN vehicle_type vt ON v.Vehicle_type_FK_ID = vt.Vehicle_type_id
       WHERE v.Vehicle_id = ? AND v.User_FK_ID = ?`,
        [vehicle_id, user_id]
      );

      if (vehicleCheck.length === 0) {
        throw new Error("Vehículo no encontrado o no pertenece al usuario");
      }

      const vehicle = vehicleCheck[0];

      // 2. Verificar disponibilidad del parking
      const [parkingCheck] = await connection.query(
        `SELECT p.*, ps.Parking_status_name 
       FROM parking p 
       INNER JOIN parking_status ps ON p.Parking_status_ID_FK = ps.Parking_status_id
       WHERE p.Parking_id = ?`,
        [parking_id]
      );

      if (parkingCheck.length === 0) {
        throw new Error("Espacio de parking no encontrado");
      }

      const parkingSpot = parkingCheck[0];

      if (parkingSpot.Parking_status_ID_FK !== 1) {
        // 1 = disponible
        throw new Error("El espacio de parking no está disponible");
      }

      // 3. Verificar compatibilidad del tipo de vehículo con el parking
      if (parkingSpot.Vehicle_type_ID_FK !== vehicle.Vehicle_type_FK_ID) {
        throw new Error(
          "El tipo de vehículo no es compatible con este espacio de parking"
        );
      }

      // 4. Calcular duración en días
      const start = new Date(start_date);
      const end = new Date(end_date);
      const durationMs = end - start;
      const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

      if (durationDays <= 0) {
        throw new Error("La duración de la reserva debe ser de al menos 1 día");
      }

      // 5. Actualizar el parking con la reserva
      const [updateResult] = await connection.query(
        `UPDATE parking 
        SET Parking_status_ID_FK = 3, -- 3 = reservado
        Vehicle_ID_FK = ?,
        User_ID_FK = ?,
        reservation_start_date = ?,
        reservation_end_date = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE Parking_id = ? AND Parking_status_ID_FK = 1`,
        [vehicle_id, user_id, start_date, end_date, parking_id]
      );

      if (updateResult.affectedRows === 0) {
        throw new Error("El espacio de parking ya no está disponible");
      }

      await connection.commit();

      return {
        parking_id,
        user_id,
        vehicle_id,
        vehicle_type_id: vehicle.Vehicle_type_FK_ID,
        vehicle_type_name: vehicle.Vehicle_type_name,
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
  // New method to process a payment for parking
  static async processPayment({
    parking_id,
    user_id,
    payment_method,
    amount,
    reference_number,
    payment_date,
  }) {
    try {
      const paymentAmount = Number(amount);
      if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
        const error = new Error("Amount must be a positive number");
        error.statusCode = 400;
        throw error;
      }

      const ownerId = await resolveOwnerId(user_id);
      if (!ownerId) {
        const error = new Error("Owner not found for the provided user");
        error.statusCode = 404;
        throw error;
      }

      const reference =
        reference_number ||
        `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const paymentDate = payment_date || new Date();

      // Create a payment record
      const [paymentResult] = await connect.query(
        `INSERT INTO payment 
         (Owner_ID_FK, Payment_total_payment, Payment_Status_ID_FK, Payment_date, Payment_method, Payment_reference_number)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [ownerId, paymentAmount, 1, paymentDate, payment_method, reference]
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
          owner_id: ownerId,
          user_id,
          amount: paymentAmount,
          payment_method,
          reference_number: reference,
          payment_date: paymentDate,
        };
      }
      return null;
    } catch (error) {
      console.error("Error processing parking payment:", error.message);
      throw error;
    }
  }
}

export default ParkingModel;
