import ParkingModel from "../models/parking.model.js";
import dotenv from "dotenv";

dotenv.config();
class ParkingistratorController {
  async register(req, res) {
    try {
      const { number, type_id, status_id, vehicle_id, user_id } = req.body;

      // Validación básica (mantenida)
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
        status_id: status_id || 1,
        user_id: user_id || null,
        vehicle_id: vehicle_id,
      });

      res.status(201).json({
        success: true,
        message: "Parking creado exitosamente",
        data: {
          id: parkingId,
          number,
          type_id,
          status_id: status_id || 1,
          user_id: user_id || null, 
          vehicle_id: vehicle_id,
        },
      });
    } catch (error) {
      console.error("Error en register parking:", error);

      if (error.code === "ER_NO_REFERENCED_ROW_2") {
        res.status(400).json({
          success: false,
          error:
            "Una de las referencias (tipo de parking, tipo de vehículo o ID de usuario) no existe o es inválida.",
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
      const { number, type_id, status_id, user_id } = req.body;

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
        status_id: status_id || existingParking.Parking_status_ID_FK,
        user_id: user_id || existingParking.User_ID_FK,
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
          ...updateData,
        },
      });
    } catch (error) {
      console.error("Error en update parking:", error);
      if (error.code === "ER_NO_REFERENCED_ROW_2") {
        res.status(400).json({
          success: false,
          error:
            "El tipo o estado de parking especificado no existe. Tipos válidos: 1 (Regular), 2 (Visitor), 3 (Disabled)",
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Error interno del servidor al actualizar parking",
        });
      }
    }
  }
  async getParkingTypes(req, res) {
    try {
      const types = await ParkingModel.getTypes();
      res.json({
        success: true,
        data: types,
      });
    } catch (error) {
      console.error("Error en getParkingTypes:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener tipos de parqueadero",
      });
    }
  }

  async getParkingStatus(req, res) {
    try {
      const statuses = await ParkingModel.getStatus();
      res.json({
        success: true,
        data: statuses,
      });
    } catch (error) {
      console.error("Error en getParkingStatus:", error);
      res.status(500).json({
        success: false,
        message: "Error al obtener estados de parqueadero",
      });
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
          error: "Parking no encontrado",
        });
      }

      await ParkingModel.delete(id);
      res.status(200).json({
        success: true,
        message: "Parking eliminado exitosamente",
        data: { id },
      });
    } catch (error) {
      console.error("Error al eliminar parking:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor al eliminar parking",
      });
    }
  }

  async findById(req, res) {
    try {
      const { id } = req.params;

      // Llamar al método del modelo
      const parkingSpot = await ParkingModel.findById(id);

      if (!parkingSpot) {
        return res.status(404).json({
          success: false,
          error: "Parking spot not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Parking spot retrieved successfully",
        data: parkingSpot,
      });
    } catch (error) {
      console.error("Error in findById:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while retrieving parking spot",
      });
    }
  }

  async assignVehicle(req, res) {
    try {
      const { parkingId, vehicleTypeId, userId } = req.body;

      if (!parkingId || !vehicleTypeId || !userId) {
        return res.status(400).json({
          success: false,
          error: "parkingId, vehicleTypeId y userId son requeridos",
        });
      }

      // Verificar si el parking existe
      const existingParking = await ParkingModel.findById(parkingId);
      if (!existingParking) {
        return res.status(404).json({
          success: false,
          error: "Parking no encontrado",
        });
      }

      const success = await ParkingModel.assignVehicle(
        parkingId,
        vehicleTypeId,
        userId
      );

      if (!success) {
        return res.status(400).json({
          success: false,
          error: "No se pudo asignar el vehículo al parqueadero",
        });
      }
      res.status(200).json({
        success: true,
        message: "Vehículo asignado exitosamente al parqueadero",
        data: {
          parkingId,
          vehicleTypeId,
          userId,
        },
      });
    } catch (error) {
      console.error("Error en assignVehicle:", error);
      if (error.code === "ER_NO_REFERENCED_ROW_2") {
        res.status(400).json({
          success: false,
          error: "El tipo de vehículo especificado no existe",
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Error interno del servidor al asignar vehículo",
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
      const availableParkings = await ParkingModel.findByStatus(
        availableStatusId
      );

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
      const { parking_id, user_id, vehicle_id, start_date, end_date } =
        req.body;

      if (!parking_id || !user_id || !vehicle_id || !start_date || !end_date) {
        return res.status(400).json({
          success: false,
          error:
            "Parking ID, user ID, vehicle ID, start date, and end date are required",
        });
      }

      // Validar fechas
      const start = new Date(start_date);
      const end = new Date(end_date);

      if (start >= end) {
        return res.status(400).json({
          success: false,
          error: "End date must be after start date",
        });
      }

      // Verificar que la fecha de inicio no sea en el pasado
      const now = new Date();
      if (start < now) {
        return res.status(400).json({
          success: false,
          error: "Start date cannot be in the past",
        });
      }

      const reservationResult = await ParkingModel.reserve({
        parking_id,
        user_id,
        vehicle_id,
        start_date: start,
        end_date: end,
      });

      res.status(200).json({
        success: true,
        message: "Parking spot reserved successfully",
        data: reservationResult,
      });
    } catch (error) {
      console.error("Error in reserve:", error);

      // Manejar diferentes tipos de errores
      let statusCode = 500;
      let errorMessage = "Internal server error while reserving parking spot";

      if (
        error.message.includes("no encontrado") ||
        error.message.includes("not found")
      ) {
        statusCode = 404;
        errorMessage = error.message;
      } else if (
        error.message.includes("no está disponible") ||
        error.message.includes("not available") ||
        error.message.includes("no pertenece") ||
        error.message.includes("no es compatible") ||
        error.message.includes("cannot be in the past")
      ) {
        statusCode = 400;
        errorMessage = error.message;
      }

      res.status(statusCode).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  // New method to get user's parking spots
  async getMySpots(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "User ID is required",
        });
      }

      const userParkings = await ParkingModel.findByUser(id);

      // Si no hay parkings, devolver array vacío
      if (!userParkings || userParkings.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No parking spots found for this user",
          data: [],
          count: 0,
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
}

export default new ParkingistratorController();
