import UserModel from "../models/user.model.js";

class UserController {
  async register(req, res) {
    try {
      const { name, user_status_id, role_id } = req.body;

      if (!name || !user_status_id || !role_id) {
        return res
          .status(400)
          .json({ error: "Name, user_status_id, and role_id are required" });
      }

      const userId = await UserModel.create({
        name,
        user_status_id,
        role_id,
      });

      if (userId.error) {
        return res.status(400).json({ error: userId.error });
      }

      res.status(201).json({
        message: "User created successfully",
        id: userId,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async show(req, res) {
    try {
      const users = await UserModel.show();

      if (users.error) {
        return res.status(400).json({ error: users.error });
      }

      if (!users || users.length === 0) {
        return res.status(404).json({ error: "No users found" });
      }

      res.status(200).json({
        message: "Users retrieved successfully",
        users: users,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async showWithDetails(req, res) {
    try {
      const users = await UserModel.getUsersWithDetails();

      if (users.error) {
        return res.status(400).json({ error: users.error });
      }

      if (!users || users.length === 0) {
        return res.status(404).json({ error: "No users found" });
      }

      res.status(200).json({
        message: "Users with details retrieved successfully",
        users: users,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const { name, user_status_id, role_id } = req.body;

      if (!id) {
        return res.status(400).json({ error: "User ID is required" });
      }

      if (!name || !user_status_id || !role_id) {
        return res.status(400).json({ error: "Name, user_status_id, and role_id are required" });
      }

      const updateResult = await UserModel.update(id, {
        name,
        user_status_id,
        role_id,
      });

      if (updateResult.error) {
        return res.status(404).json({ error: updateResult.error });
      }

      res.status(200).json({
        message: "User updated successfully",
        affectedRows: updateResult,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      const id = req.params.id;
      const { status_id } = req.body;

      if (!id || !status_id) {
        return res.status(400).json({ error: "User ID and status_id are required" });
      }

      const updateResult = await UserModel.updateStatus(id, status_id);

      if (updateResult.error) {
        return res.status(404).json({ error: updateResult.error });
      }

      res.status(200).json({
        message: "User status updated successfully",
        affectedRows: updateResult,
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
        return res.status(400).json({ error: "User ID is required" });
      }

      const deleteResult = await UserModel.delete(id);

      if (deleteResult.error) {
        return res.status(404).json({ error: deleteResult.error });
      }

      res.status(200).json({
        message: "User deleted successfully",
        affectedRows: deleteResult,
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const user = await UserModel.findById(id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({
        message: "User found successfully",
        user: user,
      });
    } catch (error) {
      console.error("Error finding user by ID:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findByName(req, res) {
    try {
      const { name } = req.query;

      if (!name) {
        return res.status(400).json({ error: "Name parameter is required" });
      }

      const user = await UserModel.findByName(name);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(200).json({
        message: "User found successfully",
        user: user,
      });
    } catch (error) {
      console.error("Error finding user by name:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new UserController(); 