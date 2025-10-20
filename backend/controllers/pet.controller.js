import PetModel from "../models/pet.model.js";
import dotenv from "dotenv";
import { getPetReportData } from "../services/petReportService.js";
import { generateExcelReport } from "../utils/excelGenerator.js";

dotenv.config();
class PetController {
  async register(req, res) {
    try {
      const { name, species, breed, vaccination_card, photo, owner_id } =
        req.body;

      // Validación básica
      if (
        !name ||
        !species ||
        !breed ||
        !vaccination_card ||
        !photo ||
        !owner_id
      ) {
        return res
          .status(400)
          .json({ error: "Todos los campos son requeridos" });
      }
      const petId = await PetModel.create({
        name,
        species,
        breed,
        vaccination_card,
        photo,
        owner_id: owner_id,
      });
      res.status(201).json({
        message: "Mascota creada con exito",
        data: {
          petId: petId,
          name,
          species,
          breed,
          vaccination_card,
          photo,
          owner_id,
        },
      });
    } catch (error) {
      console.error("Error en register pet:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async getAllpets() {
    const pets = await PetModel.show();
    if (pets.error) throw new Error(pets.error);
    return pets;
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, species, breed, vaccination_card, photo, owner_id } =
        req.body;

      // Validación básica
      if (
        !name ||
        !species ||
        !breed ||
        !vaccination_card ||
        !photo ||
        !owner_id
      ) {
        return res.status(400).json({
          error: "Debe proporcionar al menos un campo para actualizar",
        });
      }

      // Verificar si pet existe
      const existingPet = await PetModel.findById(id);
      if (!existingPet) {
        return res.status(404).json({ error: "Mascota no encontrada" });
      }
      // Actualizar
      const updateResult = await PetModel.update(id, {
        name,
        species,
        breed,
        vaccination_card,
        photo,
        owner_id,
      });

      if (!updateResult) {
        return res.status(400).json({
          success: false,
          error: "No se realizaron cambios en mascotat",
        });
      }

      res.status(200).json({
        success: true,
        message: "Mascota actualizado exitosamente",
        data: updateResult.pet || { id },
      });
    } catch (error) {
      console.error("Error en update pet:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor al actualizar mascota",
      });
    }
  }

  async show(req, res) {
    try {
      const existingPetModel = await PetModel.show();
      if (!existingPetModel) {
        return res.status(404).json({ error: "Mascota no encontrada" });
      }
      res.status(200).json({
        message: "Mascota mostrada exitosamente",
        data: existingPetModel,
      });
    } catch (error) {
      console.error("Error in show:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;
      // Basic validate
      if (!id) {
        return res.status(404).json({ error: "Mascota no encontrada" });
      }
      // Verify if the parking already exists
      const deletePetModel = await PetModel.delete(id);
      res.status(200).json({
        message: "Mascota eliminada exitosamente",
        data: deletePetModel,
      });
    } catch (error) {
      console.error("Error in delete:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;
      // Basic validate
      if (!id) {
        return res.status(400).json({ error: "Pet ID is required" });
      }
      // Verify if the parkingg already exists
      const existingPetModel = await PetModel.findById(id);
      if (!existingPetModel) {
        return res.status(409).json({ error: "Mascota no encontrada" });
      }
      res.status(201).json({
        message: "Mascota encontrada",
        data: existingPetModel,
      });
    } catch (error) {
      console.error("Error in registration:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // New method to get pets owned by the current user
  async getMyPets(req, res) {
    try {
      const userId = req.user.userId;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "User ID is required",
        });
      }

      // First get the owner ID from the user ID
      // You may need to add this method to your model or use another model
      const owner = await PetModel.findOwnerByUserId(userId);

      if (!owner) {
        return res.status(404).json({
          success: false,
          error: "Owner not found for this user",
        });
      }

      // Then get all pets for this owner
      const pets = await PetModel.findByOwner(owner.Owner_id);

      if (!pets) {
        return res.status(404).json({
          success: false,
          error: "No pets found for this owner",
        });
      }

      res.status(200).json({
        success: true,
        message: "Owner's pets retrieved successfully",
        data: pets,
        count: pets.length,
      });
    } catch (error) {
      console.error("Error in getMyPets:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while retrieving pets",
      });
    }
  }

  async downloadPetReport(req, res) {
    const data = await getPetReportData();

    const headers = [
      { key: "name", label: "Nombre de la mascota" },
      { key: "species", label: "Especie" },
      { key: "breed", label: "Raza" },
    ];

    const buffer = await generateExcelReport(data, headers, "Pets", false);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="reporte_mascotas.xlsx"'
    );
    res.send(buffer);
  }
}

export default new PetController();
