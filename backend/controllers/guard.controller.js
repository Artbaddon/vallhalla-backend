import GuardModel from "../models/guard.model.js";

class GuardController {
  async register(req, res) {
    try {
      const { user_id, arl, eps, shift } = req.body;

      if (!user_id || !arl || !eps || !shift) {
        return res.status(400).json({ 
          error: "User ID, ARL, EPS, and shift are required" 
        });
      }

      const guardId = await GuardModel.create({
        user_id,
        arl,
        eps,
        shift
      });

      if (guardId.error) {
        return res.status(400).json({ error: guardId.error });
      }

      res.status(201).json({
        message: "Guard registered successfully",
        id: guardId,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async show(req, res) {
    try {
      const guards = await GuardModel.show();

      if (guards.error) {
        return res.status(500).json({ error: guards.error });
      }

      res.status(200).json({
        message: "Guards retrieved successfully",
        guards: guards,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const { user_id, arl, eps, shift } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Guard ID is required" });
      }

      const updateResult = await GuardModel.update(id, {
        user_id,
        arl,
        eps,
        shift
      });

      if (updateResult.error) {
        return res.status(404).json({ error: updateResult.error });
      }

      res.status(200).json({
        message: "Guard updated successfully",
        id: id,
      });
    } catch (error) {
      console.error("Error updating guard:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "Guard ID is required" });
      }

      const deleteResult = await GuardModel.delete(id);

      if (deleteResult.error) {
        return res.status(404).json({ error: deleteResult.error });
      }

      res.status(200).json({
        message: "Guard deleted successfully",
        id: id,
      });
    } catch (error) {
      console.error("Error deleting guard:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "Guard ID is required" });
      }

      const guard = await GuardModel.findById(id);

      if (!guard) {
        return res.status(404).json({ error: "Guard not found" });
      }

      res.status(200).json({
        message: "Guard found successfully",
        guard: guard,
      });
    } catch (error) {
      console.error("Error finding guard by ID:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findByShift(req, res) {
    try {
      const shift = req.params.shift;

      if (!shift) {
        return res.status(400).json({ error: "Shift is required" });
      }

      const guards = await GuardModel.findByShift(shift);

      if (guards.error) {
        return res.status(500).json({ error: guards.error });
      }

      res.status(200).json({
        message: "Guards by shift retrieved successfully",
        guards: guards,
      });
    } catch (error) {
      console.error("Error finding guards by shift:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new GuardController();