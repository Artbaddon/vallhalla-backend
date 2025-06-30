import AparmentStatusModel from "../models/apartmentStatus.model.js";

class AparmentStatusController {
  async register(req, res) {
    try {
      const { name } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ error: "Name is required" });
      }

      const AparmentStatusModelId = await AparmentStatusModel.create({
        name,
      });

      res.status(201).json({
        message: "Aparment status created successfully",
        id: AparmentStatusModelId,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async show(req, res) {
    try {
      const showAparmentStatusModel = await AparmentStatusModel.show();

      if (!showAparmentStatusModel) {
        return res.status(409).json({ error: "No aparment status found" });
      }
      res.status(200).json({
        message: "Aparment status retrieved successfully",
        aparmentStatus: showAparmentStatusModel,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async update(req, res) {
    try {
      const id = req.params.id;
      const { name } = req.body;

      if (!name || !id) {
        return res
          .status(409)
          .json({ error: "Name and ID are required" });
      }

      const updateAparmentStatusModel = await AparmentStatusModel.update(id, {
        name,
      });

      if (!updateAparmentStatusModel || updateAparmentStatusModel.error) {
        return res.status(409).json({
          error: updateAparmentStatusModel?.error || "Aparment status not found",
        });
      }

      res.status(201).json({
        message: "Aparment status updated successfully",
        id: updateAparmentStatusModel,
      });
    } catch (error) {
      console.error("Error updating aparment status:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "ID is required" });
      }
      console.log("Deleting aparment status with ID:", id);

      const deleteAparmentStatusModel = await AparmentStatusModel.delete(id);
      console.log("Delete result:", deleteAparmentStatusModel);

      if (!deleteAparmentStatusModel || deleteAparmentStatusModel.error) {
        return res
          .status(404)
          .json({
            error: deleteAparmentStatusModel?.error || "Aparment status not found",
          });
      }

      res.status(200).json({
        message: "Aparment status deleted successfully",
        id,
      });
    } catch (error) {
      console.error("Error deleting aparment status:", error);
      res.status(500).json({ error: error.message });
    }
  }
  async findById(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "ID is required" });
      }

      const existingAparmentStatusModel = await AparmentStatusModel.findById(id);

      if (!existingAparmentStatusModel) {
        return res.status(404).json({ error: "Aparment status not found" });
      }

      res.status(200).json({
        message: "Aparment status found successfully",
        aparmentStatus: existingAparmentStatusModel,
      });
    } catch (error) {
      console.error("Error finding aparment status by ID:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new AparmentStatusController();
