import { ROLES } from "../middleware/rbacConfig.js";
import ApartmentModel from "../models/apartment.model.js";

class ApartmentController {
  async register(req, res) {
    try {
      const { apartment_number, status_id, tower_id, owner_id } = req.body;

      if (!apartment_number || !status_id || !tower_id || !owner_id) {
        return res
          .status(400)
          .json({ error: "apartment_number, status_id, tower_id, and owner_id are required" });
      }

      const apartmentId = await ApartmentModel.create({
        apartment_number,
        status_id,
        tower_id,
        owner_id,
      });

      if (apartmentId.error) {
        return res.status(400).json({ error: apartmentId.error });
      }

      res.status(201).json({
        message: "Apartment created successfully",
        id: apartmentId,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async show(req, res) {
    try {
      let apartments;
      
      // If user is an owner, only show their apartments
      if (req.user.roleId === ROLES.OWNER) {
        // Get owner ID from user ID
        const ownerId = req.ownerId;
        apartments = await ApartmentModel.findByOwner(ownerId);
      } else {
        // Admin and staff see all apartments
        apartments = await ApartmentModel.show();
      }

      if (apartments.error) {
        return res.status(400).json({ error: apartments.error });
      }

      if (!apartments || apartments.length === 0) {
        return res.status(404).json({ error: "No apartments found" });
      }

      res.status(200).json({
        message: "Apartments retrieved successfully",
        apartments: apartments,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async showWithDetails(req, res) {
    try {
      let apartments;
      
      // If user is an owner, only show their apartments with details
      if (req.user.roleId === ROLES.OWNER) {
        // First get owner ID from user ID
        const ownerId = req.ownerId;
        // Then get all apartments for this owner
        const ownerApartments = await ApartmentModel.findByOwner(ownerId);
        
        // For each apartment, get the details
        if (ownerApartments && ownerApartments.length > 0) {
          apartments = [];
          for (const apt of ownerApartments) {
            const details = await ApartmentModel.getApartmentWithDetails(apt.Apartment_id);
            if (details) {
              apartments.push(details);
            }
          }
        }
      } else {
        // Admin and staff see all apartments with details
        apartments = await ApartmentModel.getApartmentsWithDetails();
      }

      if (apartments.error) {
        return res.status(400).json({ error: apartments.error });
      }

      if (!apartments || apartments.length === 0) {
        return res.status(404).json({ error: "No apartments found" });
      }

      res.status(200).json({
        message: "Apartments with details retrieved successfully",
        apartments: apartments,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const { apartment_number, status_id, tower_id, owner_id } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Apartment ID is required" });
      }

      if (!apartment_number || !status_id || !tower_id || !owner_id) {
        return res.status(400).json({ error: "apartment_number, status_id, tower_id, and owner_id are required" });
      }

      const updateResult = await ApartmentModel.update(id, {
        apartment_number,
        status_id,
        tower_id,
        owner_id,
      });

      if (updateResult.error) {
        return res.status(404).json({ error: updateResult.error });
      }

      res.status(200).json({
        message: "Apartment updated successfully",
        affectedRows: updateResult,
      });
    } catch (error) {
      console.error("Error updating apartment:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const id = req.params.id;
      const { status_id } = req.body;

      if (!id || !status_id) {
        return res.status(400).json({ error: "Apartment ID and status_id are required" });
      }

      const updateResult = await ApartmentModel.updateStatus(id, status_id);

      if (updateResult.error) {
        return res.status(404).json({ error: updateResult.error });
      }

      res.status(200).json({
        message: "Apartment status updated successfully",
        affectedRows: updateResult,
      });
    } catch (error) {
      console.error("Error updating apartment status:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "Apartment ID is required" });
      }

      const deleteResult = await ApartmentModel.delete(id);

      if (deleteResult.error) {
        return res.status(404).json({ error: deleteResult.error });
      }

      res.status(200).json({
        message: "Apartment deleted successfully",
        affectedRows: deleteResult,
      });
    } catch (error) {
      console.error("Error deleting apartment:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "Apartment ID is required" });
      }

      const apartment = await ApartmentModel.findById(id);

      if (!apartment) {
        return res.status(404).json({ error: "Apartment not found" });
      }

      res.status(200).json({
        message: "Apartment found successfully",
        apartment: apartment,
      });
    } catch (error) {
      console.error("Error finding apartment by ID:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findWithDetails(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "Apartment ID is required" });
      }

      const apartment = await ApartmentModel.getApartmentWithDetails(id);

      if (!apartment) {
        return res.status(404).json({ error: "Apartment not found" });
      }

      res.status(200).json({
        message: "Apartment with details found successfully",
        apartment: apartment,
      });
    } catch (error) {
      console.error("Error finding apartment with details:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findByNumber(req, res) {
    try {
      const { apartment_number } = req.query;

      if (!apartment_number) {
        return res.status(400).json({ error: "apartment_number parameter is required" });
      }

      const apartment = await ApartmentModel.findByNumber(apartment_number);

      if (!apartment) {
        return res.status(404).json({ error: "No se encontró el apartamento con ese número" });
      }

      res.status(200).json({
        message: "Apartamento encontrado exitosamente",
        apartment: apartment
      });
    } catch (error) {
      console.error("Error finding apartment by number:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findByOwner(req, res) {
    try {
      const { owner_id } = req.query;
      let ownerId = owner_id;
      
      // If user is an owner, they can only see their own apartments
      if (req.user.roleId === ROLES.OWNER) {
        // Ignore the query parameter and use their own ID
        ownerId = req.ownerId;
      } else if (!ownerId) {
        return res.status(400).json({ error: "owner_id parameter is required" });
      }

      const apartments = await ApartmentModel.findByOwner(ownerId);

      if (apartments.error) {
        return res.status(400).json({ error: apartments.error });
      }

      if (!apartments || apartments.length === 0) {
        return res.status(404).json({ error: "No apartments found for this owner" });
      }

      res.status(200).json({
        message: "Apartments found successfully",
        apartments: apartments,
      });
    } catch (error) {
      console.error("Error finding apartments by owner:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findByStatus(req, res) {
    try {
      const { status_id } = req.query;

      if (!status_id) {
        return res.status(400).json({ error: "status_id parameter is required" });
      }

      const apartments = await ApartmentModel.findByStatus(status_id);

      if (apartments.error) {
        return res.status(400).json({ error: apartments.error });
      }

      if (!apartments || apartments.length === 0) {
        return res.status(404).json({ error: "No apartments found with this status" });
      }

      res.status(200).json({
        message: "Apartments by status retrieved successfully",
        apartments: apartments,
      });
    } catch (error) {
      console.error("Error finding apartments by status:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findByTower(req, res) {
    try {
      const { tower_id } = req.query;

      if (!tower_id) {
        return res.status(400).json({ error: "tower_id parameter is required" });
      }

      const apartments = await ApartmentModel.findByTower(tower_id);

      if (apartments.error) {
        return res.status(400).json({ error: apartments.error });
      }

      if (!apartments || apartments.length === 0) {
        return res.status(404).json({ error: "No apartments found in this tower" });
      }

      res.status(200).json({
        message: "Apartments by tower retrieved successfully",
        apartments: apartments,
      });
    } catch (error) {
      console.error("Error finding apartments by tower:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async getOccupancyReport(req, res) {
    try {
      const report = await ApartmentModel.getOccupancyReport();

      if (report.error) {
        return res.status(400).json({ error: report.error });
      }

      res.status(200).json({
        message: "Apartment occupancy report retrieved successfully",
        report: report,
      });
    } catch (error) {
      console.error("Error getting occupancy report:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new ApartmentController(); 