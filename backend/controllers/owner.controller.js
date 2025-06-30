import OwnerModel from "../models/owner.model.js";

class OwnerController {
  async register(req, res) {
    try {
      const { user_id, is_tenant, birth_date } = req.body;

      if (!user_id || is_tenant === undefined || !birth_date) {
        return res
          .status(400)
          .json({ error: "user_id, is_tenant, and birth_date are required" });
      }

      const ownerId = await OwnerModel.create({
        user_id,
        is_tenant,
        birth_date,
      });

      if (ownerId.error) {
        return res.status(400).json({ error: ownerId.error });
      }

      res.status(201).json({
        message: "Owner created successfully",
        id: ownerId,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async show(req, res) {
    try {
      const owners = await OwnerModel.show();

      if (owners.error) {
        return res.status(400).json({ error: owners.error });
      }

      if (!owners || owners.length === 0) {
        return res.status(404).json({ error: "No owners found" });
      }

      res.status(200).json({
        message: "Owners retrieved successfully",
        owners: owners,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async showWithDetails(req, res) {
    try {
      const owners = await OwnerModel.getOwnersWithDetails();

      if (owners.error) {
        return res.status(400).json({ error: owners.error });
      }

      if (!owners || owners.length === 0) {
        return res.status(404).json({ error: "No owners found" });
      }

      res.status(200).json({
        message: "Owners with details retrieved successfully",
        owners: owners,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const { user_id, is_tenant, birth_date } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Owner ID is required" });
      }

      if (!user_id || is_tenant === undefined || !birth_date) {
        return res.status(400).json({ error: "user_id, is_tenant, and birth_date are required" });
      }

      const updateResult = await OwnerModel.update(id, {
        user_id,
        is_tenant,
        birth_date,
      });

      if (updateResult.error) {
        return res.status(404).json({ error: updateResult.error });
      }

      res.status(200).json({
        message: "Owner updated successfully",
        affectedRows: updateResult,
      });
    } catch (error) {
      console.error("Error updating owner:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "Owner ID is required" });
      }

      const deleteResult = await OwnerModel.delete(id);

      if (deleteResult.error) {
        return res.status(404).json({ error: deleteResult.error });
      }

      res.status(200).json({
        message: "Owner deleted successfully",
        affectedRows: deleteResult,
      });
    } catch (error) {
      console.error("Error deleting owner:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "Owner ID is required" });
      }

      const owner = await OwnerModel.findById(id);

      if (!owner) {
        return res.status(404).json({ error: "Owner not found" });
      }

      res.status(200).json({
        message: "Owner found successfully",
        owner: owner,
      });
    } catch (error) {
      console.error("Error finding owner by ID:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findWithDetails(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "Owner ID is required" });
      }

      const owner = await OwnerModel.getOwnerWithDetails(id);

      if (!owner) {
        return res.status(404).json({ error: "Owner not found" });
      }

      res.status(200).json({
        message: "Owner with details found successfully",
        owner: owner,
      });
    } catch (error) {
      console.error("Error finding owner with details:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findByUserId(req, res) {
    try {
      const { user_id } = req.query;

      if (!user_id) {
        return res.status(400).json({ error: "user_id parameter is required" });
      }

      const owner = await OwnerModel.findByUserId(user_id);

      if (!owner) {
        return res.status(404).json({ error: "Owner not found" });
      }

      res.status(200).json({
        message: "Owner found successfully",
        owner: owner,
      });
    } catch (error) {
      console.error("Error finding owner by user ID:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async getByTenantStatus(req, res) {
    try {
      const { is_tenant } = req.query;

      if (is_tenant === undefined) {
        return res.status(400).json({ error: "is_tenant parameter is required" });
      }

      const owners = await OwnerModel.getOwnersByTenantStatus(is_tenant);

      if (owners.error) {
        return res.status(400).json({ error: owners.error });
      }

      if (!owners || owners.length === 0) {
        return res.status(404).json({ error: "No owners found with this tenant status" });
      }

      res.status(200).json({
        message: "Owners by tenant status retrieved successfully",
        owners: owners,
      });
    } catch (error) {
      console.error("Error getting owners by tenant status:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new OwnerController(); 