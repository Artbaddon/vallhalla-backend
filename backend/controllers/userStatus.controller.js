import UserStatusModel from "../models/userStatus.model.js";

class UserStatusController {
  async register(req, res) {
    try {
      const { name } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ error: "Name is required" });
      }

      const userStatusId = await UserStatusModel.create({
        name,
      });

      if (userStatusId.error) {
        return res.status(400).json({ error: userStatusId.error });
      }

      res.status(201).json({
        message: "User status created successfully",
        id: userStatusId,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async show(req, res) {
    try {
      const userStatuses = await UserStatusModel.show();

      if (userStatuses.error) {
        return res.status(500).json({ error: userStatuses.error });
      }

      if (!userStatuses || userStatuses.length === 0) {
        return res.status(404).json({ error: "No user statuses found" });
      }

      res.status(200).json({
        message: "User statuses retrieved successfully",
        userStatuses: userStatuses,
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
          .status(400)
          .json({ error: "Name and ID are required" });
      }

      const updateResult = await UserStatusModel.update(id, {
        name,
      });

      if (updateResult.error) {
        return res.status(404).json({ error: updateResult.error });
      }

      res.status(200).json({
        message: "User status updated successfully",
        id: id,
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "ID is required" });
      }

      const deleteResult = await UserStatusModel.delete(id);

      if (deleteResult.error) {
        return res.status(404).json({ error: deleteResult.error });
      }

      res.status(200).json({
        message: "User status deleted successfully",
        id: id,
      });
    } catch (error) {
      console.error("Error deleting user status:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "ID is required" });
      }

      const userStatus = await UserStatusModel.findById(id);

      if (!userStatus) {
        return res.status(404).json({ error: "User status not found" });
      }

      res.status(200).json({
        message: "User status found successfully",
        userStatus: userStatus,
      });
    } catch (error) {
      console.error("Error finding user status by ID:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new UserStatusController();