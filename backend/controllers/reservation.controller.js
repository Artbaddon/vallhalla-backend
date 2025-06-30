import ReservationModel from "../models/reservation.model.js";

class ReservationController {
  async register(req, res) {
    try {
      const { owner_id, type_id, status_id, start_date, end_date, description } = req.body;

      if (!owner_id || !type_id || !status_id || !start_date || !end_date) {
        return res.status(400).json({ 
          error: "Owner ID, type ID, status ID, start date, and end date are required" 
        });
      }

      const reservationId = await ReservationModel.create({
        owner_id,
        type_id,
        status_id,
        start_date,
        end_date,
        description: description || null
      });

      if (reservationId.error) {
        return res.status(400).json({ error: reservationId.error });
      }

      res.status(201).json({
        message: "Reservation created successfully",
        id: reservationId,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async show(req, res) {
    try {
      const reservations = await ReservationModel.show();

      if (reservations.error) {
        return res.status(500).json({ error: reservations.error });
      }

      res.status(200).json({
        message: "Reservations retrieved successfully",
        reservations: reservations,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const id = req.params.id;
      const { owner_id, type_id, status_id, start_date, end_date, description } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Reservation ID is required" });
      }

      const updateResult = await ReservationModel.update(id, {
        owner_id,
        type_id,
        status_id,
        start_date,
        end_date,
        description
      });

      if (updateResult.error) {
        return res.status(404).json({ error: updateResult.error });
      }

      res.status(200).json({
        message: "Reservation updated successfully",
        id: id,
      });
    } catch (error) {
      console.error("Error updating reservation:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "Reservation ID is required" });
      }

      const deleteResult = await ReservationModel.delete(id);

      if (deleteResult.error) {
        return res.status(404).json({ error: deleteResult.error });
      }

      res.status(200).json({
        message: "Reservation deleted successfully",
        id: id,
      });
    } catch (error) {
      console.error("Error deleting reservation:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findById(req, res) {
    try {
      const id = req.params.id;

      if (!id) {
        return res.status(400).json({ error: "Reservation ID is required" });
      }

      const reservation = await ReservationModel.findById(id);

      if (!reservation) {
        return res.status(404).json({ error: "Reservation not found" });
      }

      res.status(200).json({
        message: "Reservation found successfully",
        reservation: reservation,
      });
    } catch (error) {
      console.error("Error finding reservation by ID:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findByOwner(req, res) {
    try {
      const owner_id = req.params.owner_id;

      if (!owner_id) {
        return res.status(400).json({ error: "Owner ID is required" });
      }

      const reservations = await ReservationModel.findByOwner(owner_id);

      if (reservations.error) {
        return res.status(500).json({ error: reservations.error });
      }

      res.status(200).json({
        message: "Owner reservations retrieved successfully",
        reservations: reservations,
      });
    } catch (error) {
      console.error("Error finding reservations by owner:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async findByDateRange(req, res) {
    try {
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return res.status(400).json({ error: "Start date and end date are required" });
      }

      const reservations = await ReservationModel.findByDateRange(start_date, end_date);

      if (reservations.error) {
        return res.status(500).json({ error: reservations.error });
      }

      res.status(200).json({
        message: "Reservations by date range retrieved successfully",
        reservations: reservations,
      });
    } catch (error) {
      console.error("Error finding reservations by date range:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new ReservationController();