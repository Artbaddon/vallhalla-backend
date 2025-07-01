import ReservationModel from "../models/reservation.model.js";
import { ROLES } from "../middleware/rbacConfig.js";

class ReservationController {
  async register(req, res) {
    try {
      const { owner_id, type_id, status_id, facility_id, start_date, end_date, description } = req.body;

      // If the user is an owner, they can only create reservations for themselves
      let ownerId = owner_id;
      if (req.user.roleId === ROLES.OWNER) {
        // Get the owner ID from the user ID
        ownerId = req.ownerId;
      }

      if (!ownerId || !type_id || !status_id || !start_date || !end_date) {
        return res.status(400).json({ 
          error: "Owner ID, type ID, status ID, start date, and end date are required" 
        });
      }

      const reservationId = await ReservationModel.create({
        owner_id: ownerId,
        type_id,
        status_id,
        facility_id,
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
      const { owner_id, type_id, status_id, facility_id, start_date, end_date, description } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Reservation ID is required" });
      }

      // If user is an owner, verify they own this reservation
      if (req.user.roleId === ROLES.OWNER) {
        const reservation = await ReservationModel.findById(id);
        if (!reservation || reservation.Owner_FK_ID !== req.ownerId) {
          return res.status(403).json({ error: "You don't have permission to update this reservation" });
        }
      }

      const updateResult = await ReservationModel.update(id, {
        owner_id,
        type_id,
        status_id,
        facility_id,
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

      // If user is an owner, verify they own this reservation
      if (req.user.roleId === ROLES.OWNER && reservation.Owner_FK_ID !== req.ownerId) {
        return res.status(403).json({ error: "You don't have permission to view this reservation" });
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
      let owner_id = req.params.owner_id;

      // If user is an owner, they can only see their own reservations
      if (req.user.roleId === ROLES.OWNER) {
        owner_id = req.ownerId;
      }

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

      let reservations;
      
      // If user is an owner, only show their reservations in the date range
      if (req.user.roleId === ROLES.OWNER) {
        const ownerReservations = await ReservationModel.findByOwner(req.ownerId);
        
        if (ownerReservations.error) {
          return res.status(500).json({ error: ownerReservations.error });
        }
        
        // Filter by date range manually
        reservations = ownerReservations.filter(res => {
          const resStartDate = new Date(res.Reservation_startDate);
          const resEndDate = new Date(res.Reservation_endDate);
          const queryStartDate = new Date(start_date);
          const queryEndDate = new Date(end_date);
          
          return (resStartDate >= queryStartDate && resStartDate <= queryEndDate) || 
                 (resEndDate >= queryStartDate && resEndDate <= queryEndDate) ||
                 (resStartDate <= queryStartDate && resEndDate >= queryEndDate);
        });
      } else {
        // Admin and staff see all reservations in the date range
        reservations = await ReservationModel.findByDateRange(start_date, end_date);
        
        if (reservations.error) {
          return res.status(500).json({ error: reservations.error });
        }
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

  // New method to find reservations for the currently logged-in owner
  async findMyReservations(req, res) {
    try {
      // This endpoint should only be accessible by owners
      if (req.user.roleId !== ROLES.OWNER) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const owner_id = req.ownerId;
      
      if (!owner_id) {
        return res.status(400).json({ error: "Owner ID could not be determined" });
      }

      const reservations = await ReservationModel.findByOwner(owner_id);

      if (reservations.error) {
        return res.status(500).json({ error: reservations.error });
      }

      res.status(200).json({
        message: "Your reservations retrieved successfully",
        reservations: reservations,
      });
    } catch (error) {
      console.error("Error finding owner's reservations:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export default new ReservationController();