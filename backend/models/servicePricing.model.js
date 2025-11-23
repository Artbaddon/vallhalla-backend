import { connect } from "../config/db/connectMysql.js";

class ServicePricingModel {
  // CREATE - Crear nuevo precio
  static async create(pricingData) {
    try {
      const [result] = await connect.query(
        `INSERT INTO service_pricing 
         (reservation_type_id, vehicle_type_id, pricing_model, base_price) 
         VALUES (?, ?, ?, ?)`,
        [
          pricingData.reservation_type_id || null,
          pricingData.vehicle_type_id || null,
          pricingData.pricing_model,
          pricingData.base_price,
        ]
      );
      return result.insertId;
    } catch (error) {
      console.error("Error creating service pricing:", error.message);
      throw error;
    }
  }

  // READ - Obtener todos los precios con nombres
  static async findAll() {
    try {
      const [rows] = await connect.query(
        `SELECT 
          sp.*,
          rt.Reservation_type_name,
          vt.Vehicle_type_name
         FROM service_pricing sp
         LEFT JOIN reservation_type rt ON sp.reservation_type_id = rt.Reservation_type_id
         LEFT JOIN vehicle_type vt ON sp.vehicle_type_id = vt.Vehicle_type_id
         ORDER BY 
           CASE 
             WHEN sp.vehicle_type_id IS NOT NULL THEN 'Vehicle'
             WHEN sp.reservation_type_id IS NOT NULL THEN 'Reservation'
           END,
           vt.Vehicle_type_name, rt.Reservation_type_name`
      );
      return rows;
    } catch (error) {
      console.error("Error getting all service pricing:", error.message);
      throw error;
    }
  }

  // READ - Obtener por ID con nombres
  static async findById(id) {
    try {
      const [rows] = await connect.query(
        `SELECT 
          sp.*,
          rt.Reservation_type_name,
          vt.Vehicle_type_name
         FROM service_pricing sp
         LEFT JOIN reservation_type rt ON sp.reservation_type_id = rt.Reservation_type_id
         LEFT JOIN vehicle_type vt ON sp.vehicle_type_id = vt.Vehicle_type_id
         WHERE sp.id = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Error getting service pricing by ID:", error.message);
      throw error;
    }
  }

  // READ - Buscar precio específico para vehículo
  static async findVehiclePrice(vehicleTypeId) {
    try {
      const [rows] = await connect.query(
        `SELECT sp.*, vt.Vehicle_type_name
         FROM service_pricing sp
         INNER JOIN vehicle_type vt ON sp.vehicle_type_id = vt.Vehicle_type_id
         WHERE sp.vehicle_type_id = ? AND sp.pricing_model = 'per_day'`,
        [vehicleTypeId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Error finding specific vehicle price:", error.message);
      throw error;
    }
  }

  // READ - Buscar precio específico para reserva
  static async findReservationPrice(reservationTypeId) {
    try {
      const [rows] = await connect.query(
        `SELECT sp.*, rt.Reservation_type_name
         FROM service_pricing sp
         INNER JOIN reservation_type rt ON sp.reservation_type_id = rt.Reservation_type_id
         WHERE sp.reservation_type_id = ? AND sp.pricing_model = 'per_hour'`,
        [reservationTypeId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Error finding specific reservation price:", error.message);
      throw error;
    }
  }

  // UPDATE - Actualizar precio
  static async update(id, pricingData) {
    try {
      const [result] = await connect.query(
        `UPDATE service_pricing 
         SET reservation_type_id = ?, vehicle_type_id = ?,
             pricing_model = ?, base_price = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [
          pricingData.reservation_type_id || null,
          pricingData.vehicle_type_id || null,
          pricingData.pricing_model,
          pricingData.base_price,
          id,
        ]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error updating service pricing:", error.message);
      throw error;
    }
  }

  // DELETE - Eliminar precio
  static async delete(id) {
    try {
      const [result] = await connect.query(
        `DELETE FROM service_pricing WHERE id = ?`,
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error deleting service pricing:", error.message);
      throw error;
    }
  }

  // CALCULAR PRECIO DE PARKING
  static async calculateParkingPrice(vehicleTypeId, startDate, endDate) {
    try {
      // Calcular días de diferencia
      const start = new Date(startDate);
      const end = new Date(endDate);
      const durationMs = end - start;
      const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

      if (durationDays <= 0) {
        throw new Error("La fecha fin debe ser después de la fecha inicio");
      }

      // Buscar precio por día
      const pricing = await this.findVehiclePrice(vehicleTypeId);

      if (!pricing) {
        throw new Error("No se encontró tarifa para este tipo de vehículo");
      }

      const totalPrice = pricing.base_price * durationDays;

      return {
        pricing_id: pricing.id,
        vehicle_type_id: vehicleTypeId,
        start_date: startDate,
        end_date: endDate,
        duration_days: durationDays,
        base_price_per_day: pricing.base_price,
        total_price: totalPrice,
        currency: "COP",
      };
    } catch (error) {
      console.error("Error calculating parking price:", error.message);
      throw error;
    }
  }

  static async calculateReservationPrice(
    reservationTypeId,
    startDate,
    endDate
  ) {
    try {
      // Calcular horas de diferencia
      const start = new Date(startDate);
      const end = new Date(endDate);
      const durationMs = end - start;
      const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));

      if (durationHours <= 0) {
        throw new Error("La fecha fin debe ser después de la fecha inicio");
      }

      // Buscar precio por hora
      const pricing = await this.findReservationPrice(reservationTypeId);

      if (!pricing) {
        throw new Error("No se encontró tarifa para este tipo de reserva");
      }

      const totalPrice = pricing.base_price * durationHours;

      return {
        pricing_id: pricing.id,
        reservation_type_id: reservationTypeId,
        start_date: startDate,
        end_date: endDate,
        duration_hours: durationHours,
        base_price_per_hour: pricing.base_price,
        total_price: totalPrice,
        currency: "COP",
      };
    } catch (error) {
      console.error("Error calculating reservation price:", error.message);
      throw error;
    }
  }
}

export default ServicePricingModel;
