import ReservationStatusModel from "../models/reservationStatus.model.js";

class ReservationStatusController {
  async create(req, res) {
    try {
      const { status_name } = req.body;
      
      if (!status_name) {
        return res.status(400).json({ error: "Status name is required" });
      }

      const result = await ReservationStatusModel.create({ status_name });
      
      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      res.status(201).json({ 
        message: "Reservation status created successfully",
        id: result 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async show(req, res) {
    try {
      const result = await ReservationStatusModel.show();
      
      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { status_name } = req.body;

      if (!status_name) {
        return res.status(400).json({ error: "Status name is required" });
      }

      const result = await ReservationStatusModel.update(id, { status_name });

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      res.status(200).json({ 
        message: "Reservation status updated successfully" 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await ReservationStatusModel.delete(id);

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      res.status(200).json({ 
        message: "Reservation status deleted successfully" 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req, res) {
    try {
      const { id } = req.params;
      const result = await ReservationStatusModel.findById(id);

      if (!result) {
        return res.status(404).json({ error: "Reservation status not found" });
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

export default new ReservationStatusController(); 