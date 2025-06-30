import ParkingModel from "../models/parking.model.js";
import dotenv from "dotenv";

dotenv.config();
class ParkingistratorController {
  async register(req, res) {
    try {
      const { number, type_id, status_id } = req.body;

      // Validación básica
      if (!number) {
        return res.status(400).json({
          success: false,
          error: "El número de parking es requerido",
        });
      }

      // Crear el parking
      const parkingId = await ParkingModel.create({
        number,
        type_id: type_id,
        status_id: status_id || 2,
      });

      if (!parkingId) {
        return res.status(500).json({
          success: false,
          error: "Error al crear el parking",
        });
      }

      res.status(201).json({
        success: true,
        message: "Parking creado exitosamente",
        data: {
          id: parkingId,
        },
      });
    } catch (error) {
      console.error("Error en register parking:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error interno del servidor",
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { number, type_id, status_id } = req.body;

      // Validación básica
      if (!number && !type_id && !status_id) {
        return res.status(400).json({
          success: false,
          error: "Debe proporcionar al menos un campo para actualizar",
        });
      }

      // Verificar si el parking existe
      const existingParking = await ParkingModel.findById(id);
      if (!existingParking) {
        return res.status(404).json({
          success: false,
          error: "Parking no encontrado",
        });
      }

      // Actualizar
      const updateResult = await ParkingModel.update(id, {
        number,
        type_id,
        status_id,
      });

      if (!updateResult) {
        return res.status(400).json({
          success: false,
          error: "No se realizaron cambios en el parking"
        });
      }

      res.status(200).json({
        success: true,
        message: "Parking actualizado exitosamente",
        data: updateResult.parking || { id },
      });
    } catch (error) {
      console.error("Error en update parking:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor al actualizar parking",
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
      // Basic validate
      if (!id) {
        return res.status(400).json({ error: "Required fields are missing" });
      }
      // Verify if the parking already exists
      const deleteParkingModel = await ParkingModel.delete(id);
      res.status(201).json({
        message: "User delete successfully",
        data: deleteParkingModel,
      });
    } catch (error) {
      console.error("Error in registration:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;
      // Basic validate
      if (!id) {
        return res.status(400).json({ error: "Required fields are missing" });
      }
      // Verify if the parkingg already exists
      const existingParkingModel = await ParkingModel.findById(id);
      if (!existingParkingModel) {
        return res.status(409).json({ error: "The Parking No already exists" });
      }
      res.status(201).json({
        message: "Parking successfully",
        data: existingParkingModel,
      });
    } catch (error) {
      console.error("Error in registration:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default new ParkingistratorController();