import towerModel from "../models/tower.model.js";

class towerController {
  async register(req, res) {
    try {
      const { Tower_name } = req.body;

      if (!Tower_name ) {
        return res
          .status(400)
          .json({ error: "Name are required" });
      }

      const towerModelTower_id = await towerModel.create({
        Tower_name
      });

      res.status(201).json({
        message: "Tower created successfully",
        data: towerModelTower_id,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async show(req, res) {
    try {
      const showtowerModel = await towerModel.show();

      if (!showtowerModel) {
        return res.status(409).json({ error: "No towers found" });
      }
      res.status(200).json({
        message: "Towers retrieved successfully",
        data: showtowerModel,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async update(req, res) {
    try {
      const Tower_id = req.params.Tower_id;
      const { Tower_name } = req.body;

      if (!Tower_name || !Tower_id) {
        return res
          .status(409)
          .json({ error: " Name and Tower_id are required" });
      }

      const updatetowerModel = await towerModel.update(Tower_id, {
        Tower_name
      });

      if (!updatetowerModel || updatetowerModel.error) {
      return res.status(409).json({ error: updatetowerModel?.error || "Tower status not found" });
    }

      res.status(201).json({
        message: "Tower updated successfully",
        data: updatetowerModel,
      });
    } catch (error) {
      console.error("Error updating document type:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const Tower_id = req.params.Tower_id;

      if (!Tower_id) {
        return res.status(400).json({ error: "Tower_id is required" });
      }

      const deletetowerModel = await towerModel.delete(Tower_id);

      if (!deletetowerModel || deletetowerModel.error) {
        return res.status(404).json({ error: deletetowerModel?.error || "Tower status not found" });
      }

      res.status(200).json({
        message: "Tower deleted successfully",
        data: deletetowerModel,
      });
    } catch (error) {
      console.error("Error deleting document type:", error);
      res.status(500).json({ error: error.message });
    }
  }
  async findByTower_id(req, res) {
    try {
      const Tower_id = req.params.Tower_id;

      if (!Tower_id) {
        return res.status(400).json({ error: "Tower_id is required" });
      }

      const existingtowerModel = await towerModel.findByTower_id(Tower_id);

      if (!existingtowerModel) {
        return res.status(404).json({ error: "Tower not found" });
      }

      res.status(200).json({
        message: "Tower found successfully",
        data: existingtowerModel,
      });
    } catch (error) {
      console.error("Error finding document type by Tower_id:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new towerController();