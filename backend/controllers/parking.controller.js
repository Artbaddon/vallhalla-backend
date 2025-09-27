import ParkingModel from "../models/parking.model.js";
import dotenv from "dotenv";

dotenv.config();
class ParkingistratorController {
  async register(req, res) {
    try {
      const { number, type_id, status_id } = req.body;

      // Validación básica
      if (!number || !type_id) {
        return res.status(400).json({
          success: false,
          error: "El número de parking y tipo son requeridos",
        });
      }

      // Crear el parking
      const parkingId = await ParkingModel.create({
        number,
        type_id,
        status_id: status_id || 1, // 1 = Available by default
      });

      res.status(201).json({
        success: true,
        message: "Parking creado exitosamente",
        data: {
          id: parkingId,
          number,
          type_id,
          status_id: status_id || 1
        },
      });
    } catch (error) {
      console.error("Error en register parking:", error);
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        res.status(400).json({
          success: false,
          error: "El tipo de parking especificado no existe. Tipos válidos: 1 (Regular), 2 (Visitor), 3 (Disabled)",
        });
      } else {
        res.status(500).json({
          success: false,
          error: error.message || "Error interno del servidor",
        });
      }
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { number, type_id, status_id } = req.body;

      // Verificar si el parking existe
      const existingParking = await ParkingModel.findById(id);
      if (!existingParking) {
        return res.status(404).json({
          success: false,
          error: "Parking no encontrado",
        });
      }

      // Usar valores existentes si no se proporcionan nuevos
      const updateData = {
        number: number || existingParking.Parking_number,
        type_id: type_id || existingParking.Parking_type_ID_FK,
        status_id: status_id || existingParking.Parking_status_ID_FK
      };

      // Actualizar
      const updateResult = await ParkingModel.update(id, updateData);

      if (!updateResult) {
        return res.status(400).json({
          success: false,
          error: "No se realizaron cambios en el parking",
        });
      }

      res.status(200).json({
        success: true,
        message: "Parking actualizado exitosamente",
        data: {
          id,
          ...updateData
        },
      });
    } catch (error) {
      console.error("Error en update parking:", error);
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        res.status(400).json({
          success: false,
          error: "El tipo o estado de parking especificado no existe. Tipos válidos: 1 (Regular), 2 (Visitor), 3 (Disabled)",
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Error interno del servidor al actualizar parking",
        });
      }
    }
  }

  async show(req, res) {
    try {
      const parkings = await ParkingModel.show();

      res.status(200).json({
        success: true,
        message: "Lista de parkings obtenida exitosamente",
        data: parkings,
        count: parkings.length,
      });
    } catch (error) {
      console.error("Error en show parkings:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor al obtener parkings",
      });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;
      
      // Verificar si el parking existe
      const existingParking = await ParkingModel.findById(id);
      if (!existingParking) {
        return res.status(404).json({
          success: false,
          error: "Parking no encontrado"
        });
      }

      await ParkingModel.delete(id);
      res.status(200).json({
        success: true,
        message: "Parking eliminado exitosamente",
        data: { id }
      });
    } catch (error) {
      console.error("Error al eliminar parking:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor al eliminar parking"
      });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({
          success: false,
          error: "ID de parking requerido"
        });
      }

      const parking = await ParkingModel.findById(id);
      if (!parking) {
        return res.status(404).json({
          success: false,
          error: "Parking no encontrado"
        });
      }

      res.status(200).json({
        success: true,
        message: "Parking encontrado exitosamente",
        data: parking
      });
    } catch (error) {
      console.error("Error al buscar parking:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor al buscar parking"
      });
    }
  }

  async assignVehicle(req, res) {
    try {
      const { parkingId, vehicleTypeId } = req.body;

      if (!parkingId || !vehicleTypeId) {
        return res.status(400).json({
          success: false,
          error: "parkingId y vehicleTypeId son requeridos",
        });
      }

      // Verificar si el parking existe
      const existingParking = await ParkingModel.findById(parkingId);
      if (!existingParking) {
        return res.status(404).json({
          success: false,
          error: "Parking no encontrado"
        });
      }

      const success = await ParkingModel.assignVehicle(parkingId, vehicleTypeId);

      res.status(200).json({
        success: true,
        message: "Vehículo asignado exitosamente al parqueadero",
        data: {
          parkingId,
          vehicleTypeId
        }
      });
    } catch (error) {
      console.error("Error en assignVehicle:", error);
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        res.status(400).json({
          success: false,
          error: "El tipo de vehículo especificado no existe"
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Error interno del servidor al asignar vehículo"
        });
      }
    }
  }

  // New method to get available parking spots
  async getAvailable(req, res) {
    try {
      // Status 1 is typically "available" - adjust as needed based on your status IDs
      const availableStatusId = 1;
      
      // You may need to add this method to your model
      const availableParkings = await ParkingModel.findByStatus(availableStatusId);
      
      if (!availableParkings) {
        return res.status(500).json({
          success: false,
          error: "Error retrieving available parking spots",
        });
      }
      
      res.status(200).json({
        success: true,
        message: "Available parking spots retrieved successfully",
        data: availableParkings,
        count: availableParkings.length,
      });
    } catch (error) {
      console.error("Error in getAvailable:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while retrieving available parking spots",
      });
    }
  }

  // New method to reserve a parking spot
  async reserve(req, res) {
    try {
      const { parking_id, user_id, vehicle_type_id, start_date, end_date } = req.body;
      
      if (!parking_id || !user_id || !vehicle_type_id) {
        return res.status(400).json({
          success: false,
          error: "Parking ID, user ID, and vehicle type ID are required",
        });
      }
      
      // Check if parking spot is available
      const parkingSpot = await ParkingModel.findById(parking_id);
      if (!parkingSpot) {
        return res.status(404).json({
          success: false,
          error: "Parking spot not found",
        });
      }
      
      // Status 1 is typically "available" - adjust as needed
      if (parkingSpot.Parking_status_FK_ID !== 1) {
        return res.status(400).json({
          success: false,
          error: "Parking spot is not available for reservation",
        });
      }
      
      // You may need to add this method to your model
      const reservationResult = await ParkingModel.reserve({
        parking_id,
        user_id,
        vehicle_type_id,
        start_date: start_date || new Date(),
        end_date: end_date || null,
      });
      
      if (!reservationResult) {
        return res.status(500).json({
          success: false,
          error: "Failed to reserve parking spot",
        });
      }
      
      res.status(200).json({
        success: true,
        message: "Parking spot reserved successfully",
        data: reservationResult,
      });
    } catch (error) {
      console.error("Error in reserve:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while reserving parking spot",
      });
    }
  }

  // New method to get user's parking spots
  async getMySpots(req, res) {
    try {
      const userId = req.user.userId;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "User ID is required",
        });
      }
      
      // You may need to add this method to your model
      const userParkings = await ParkingModel.findByUser(userId);
      
      if (!userParkings) {
        return res.status(500).json({
          success: false,
          error: "Error retrieving user's parking spots",
        });
      }
      
      res.status(200).json({
        success: true,
        message: "User's parking spots retrieved successfully",
        data: userParkings,
        count: userParkings.length,
      });
    } catch (error) {
      console.error("Error in getMySpots:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while retrieving user's parking spots",
      });
    }
  }

  // New method to pay for parking
  async pay(req, res) {
    try {
      const parkingId = req.params.id;
      const { payment_method, amount, reference_number } = req.body;
      const userId = req.user.userId;
      
      if (!parkingId || !payment_method || !amount) {
        return res.status(400).json({
          success: false,
          error: "Parking ID, payment method, and amount are required",
        });
      }
      
      // Verify parking ownership
      const parkingSpot = await ParkingModel.findById(parkingId);
      if (!parkingSpot) {
        return res.status(404).json({
          success: false,
          error: "Parking spot not found",
        });
      }
      
      // You may need to add this method to your model
      const paymentResult = await ParkingModel.processPayment({
        parking_id: parkingId,
        user_id: userId,
        payment_method,
        amount,
        reference_number: reference_number || null,
        payment_date: new Date()
      });
      
      if (!paymentResult) {
        return res.status(500).json({
          success: false,
          error: "Failed to process payment",
        });
      }
      
      res.status(200).json({
        success: true,
        message: "Payment processed successfully",
        data: paymentResult,
      });
    } catch (error) {
      console.error("Error in pay:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while processing payment",
      });
    }
  }
}

export default new ParkingistratorController();