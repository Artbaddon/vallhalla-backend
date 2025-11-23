import ServicePricingModel from "../models/servicePricing.model.js";

class ServicePricingController {
  // CREATE - Crear nuevo precio
  async create(req, res) {
    try {
      const {
        reservation_type_id,
        vehicle_type_id,
        pricing_model,
        base_price,
      } = req.body;

      // Validar que tenga al menos un tipo
      if (!reservation_type_id && !vehicle_type_id) {
        return res.status(400).json({
          success: false,
          error: "Debe proporcionar reservation_type_id O vehicle_type_id",
        });
      }

      // Validar campos requeridos
      if (!pricing_model || base_price === undefined) {
        return res.status(400).json({
          success: false,
          error: "pricing_model y base_price son requeridos",
        });
      }

      // Validar pricing_model válido
      if (!["per_hour", "per_day"].includes(pricing_model)) {
        return res.status(400).json({
          success: false,
          error: "pricing_model debe ser 'per_hour' o 'per_day'",
        });
      }

      const pricingId = await ServicePricingModel.create({
        reservation_type_id,
        vehicle_type_id,
        pricing_model,
        base_price,
      });

      res.status(201).json({
        success: true,
        message: "Precio de servicio creado exitosamente",
        data: { id: pricingId },
      });
    } catch (error) {
      console.error("Error creating service pricing:", error);
      res.status(500).json({
        success: false,
        error: "Error interno al crear precio de servicio",
      });
    }
  }

  // READ - Obtener todos los precios
  async getAll(req, res) {
    try {
      const pricing = await ServicePricingModel.findAll();

      res.status(200).json({
        success: true,
        message: "Precios de servicio obtenidos exitosamente",
        data: pricing,
        count: pricing.length,
      });
    } catch (error) {
      console.error("Error getting service pricing:", error);
      res.status(500).json({
        success: false,
        error: "Error interno al obtener precios de servicio",
      });
    }
  }

  // READ - Obtener precio por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const pricing = await ServicePricingModel.findById(id);

      if (!pricing) {
        return res.status(404).json({
          success: false,
          error: "Precio de servicio no encontrado",
        });
      }

      res.status(200).json({
        success: true,
        message: "Precio de servicio obtenido exitosamente",
        data: pricing,
      });
    } catch (error) {
      console.error("Error getting service pricing by ID:", error);
      res.status(500).json({
        success: false,
        error: "Error interno al obtener precio de servicio",
      });
    }
  }

  // READ - Obtener precios de VEHÍCULOS
  async getVehiclePrice(req, res) {
    try {
      const { vehicle_type_id } = req.params;

      if (!vehicle_type_id) {
        return res.status(400).json({
          success: false,
          error: "vehicle_type_id es requerido",
        });
      }

      const pricing = await ServicePricingModel.findVehiclePrice(
        vehicle_type_id
      );

      if (!pricing) {
        return res.status(404).json({
          success: false,
          error: "No se encontró precio para este tipo de vehículo",
        });
      }

      res.status(200).json({
        success: true,
        message: "Precio de vehículo obtenido exitosamente",
        data: pricing,
      });
    } catch (error) {
      console.error("Error getting vehicle price:", error);
      res.status(500).json({
        success: false,
        error: "Error interno al obtener precio de vehículo",
      });
    }
  }

  // READ - Obtener precio específico de RESERVA
  async getReservationPrice(req, res) {
    try {
      const { reservation_type_id } = req.params;

      if (!reservation_type_id) {
        return res.status(400).json({
          success: false,
          error: "reservation_type_id es requerido",
        });
      }

      const pricing = await ServicePricingModel.findReservationPrice(
        reservation_type_id
      );

      if (!pricing) {
        return res.status(404).json({
          success: false,
          error: "No se encontró precio para este tipo de reserva",
        });
      }

      res.status(200).json({
        success: true,
        message: "Precio de reserva obtenido exitosamente",
        data: pricing,
      });
    } catch (error) {
      console.error("Error getting reservation price:", error);
      res.status(500).json({
        success: false,
        error: "Error interno al obtener precio de reserva",
      });
    }
  }

  // CALCULAR PRECIO DE PARKING
  async calculateParkingPrice(req, res) {
    try {
      const { vehicle_type_id, start_date, end_date } = req.body;

      if (!vehicle_type_id || !start_date || !end_date) {
        return res.status(400).json({
          success: false,
          error: "vehicle_type_id, start_date y end_date son requeridos",
        });
      }

      const calculation = await ServicePricingModel.calculateParkingPrice(
        vehicle_type_id,
        start_date,
        end_date
      );

      res.status(200).json({
        success: true,
        message: "Precio calculado exitosamente",
        data: calculation,
      });
    } catch (error) {
      console.error("Error calculating parking price:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // CALCULAR PRECIO DE RESERVA (ÁREAS COMUNES)
  async calculateReservationPrice(req, res) {
    try {
      const { reservation_type_id, start_date, end_date } = req.body;

      if (!reservation_type_id || !start_date || !end_date) {
        return res.status(400).json({
          success: false,
          error: "reservation_type_id, start_date y end_date son requeridos",
        });
      }

      const calculation = await ServicePricingModel.calculateReservationPrice(
        reservation_type_id,
        start_date,
        end_date
      );

      res.status(200).json({
        success: true,
        message: "Precio de reserva calculado exitosamente",
        data: calculation,
      });
    } catch (error) {
      console.error("Error calculating reservation price:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  // UPDATE - Actualizar precio
  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        reservation_type_id,
        vehicle_type_id,
        pricing_model,
        base_price,
      } = req.body;

      const existingPricing = await ServicePricingModel.findById(id);
      if (!existingPricing) {
        return res.status(404).json({
          success: false,
          error: "Precio de servicio no encontrado",
        });
      }

      const updated = await ServicePricingModel.update(id, {
        reservation_type_id:
          reservation_type_id || existingPricing.reservation_type_id,
        vehicle_type_id: vehicle_type_id || existingPricing.vehicle_type_id,
        pricing_model: pricing_model || existingPricing.pricing_model,
        base_price: base_price || existingPricing.base_price,
      });

      if (!updated) {
        return res.status(400).json({
          success: false,
          error: "Error al actualizar precio de servicio",
        });
      }

      res.status(200).json({
        success: true,
        message: "Precio de servicio actualizado exitosamente",
      });
    } catch (error) {
      console.error("Error updating service pricing:", error);
      res.status(500).json({
        success: false,
        error: "Error interno al actualizar precio de servicio",
      });
    }
  }

  // DELETE - Eliminar precio
  async delete(req, res) {
    try {
      const { id } = req.params;

      const existingPricing = await ServicePricingModel.findById(id);
      if (!existingPricing) {
        return res.status(404).json({
          success: false,
          error: "Precio de servicio no encontrado",
        });
      }

      const deleted = await ServicePricingModel.delete(id);

      if (!deleted) {
        return res.status(400).json({
          success: false,
          error: "Error al eliminar precio de servicio",
        });
      }

      res.status(200).json({
        success: true,
        message: "Precio de servicio eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error deleting service pricing:", error);
      res.status(500).json({
        success: false,
        error: "Error interno al eliminar precio de servicio",
      });
    }
  }
}

export default new ServicePricingController();
