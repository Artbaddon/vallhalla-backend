import ReservationTypeModel from "../models/reservationType.model.js";

class ReservationTypeController {
  static async create(req, res) {
    try {
      const { type_name } = req.body;
      
      if (!type_name) {
        return res.status(400).json({ error: "Type name is required" });
      }

      const result = await ReservationTypeModel.create({ type_name });
      
      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      res.status(201).json({ 
        message: "Reservation type created successfully",
        id: result 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async show(req, res) {
    try {
      const result = await ReservationTypeModel.show();
      
      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { type_name } = req.body;

      if (!type_name) {
        return res.status(400).json({ error: "Type name is required" });
      }

      const result = await ReservationTypeModel.update(id, { type_name });

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      res.status(200).json({ 
        message: "Reservation type updated successfully" 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await ReservationTypeModel.delete(id);

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      res.status(200).json({ 
        message: "Reservation type deleted successfully" 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const { id } = req.params;
      const result = await ReservationTypeModel.findById(id);

      if (!result) {
        return res.status(404).json({ error: "Reservation type not found" });
      }

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default ReservationTypeController; 