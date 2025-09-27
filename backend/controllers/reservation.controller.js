import ReservationModel from "../models/reservation.model.js";
import OwnerModel from "../models/owner.model.js";

class ReservationController {
  static async create(req, res) {
    try {
      const {
        type_id,
        facility_id,
        start_date,
        end_date,
        description,
        owner_id, // Optional: Allow admin to specify owner_id
      } = req.body;

      // Validate required fields
      if (!type_id || !start_date || !end_date || !facility_id) {
        return res.status(400).json({
          error: "Type ID, facility ID, start date, and end date are required",
        });
      }

      // Validate date format and range
      const startDateTime = new Date(start_date);
      const endDateTime = new Date(end_date);
      const now = new Date();

      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        return res.status(400).json({
          error: "Invalid date format. Please use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)",
        });
      }

      if (startDateTime < now) {
        return res.status(400).json({
          error: "Start date cannot be in the past",
        });
      }

      if (endDateTime <= startDateTime) {
        return res.status(400).json({
          error: "End date must be after start date",
        });
      }

      let reservationOwnerId;

      // If user is admin, they can create reservation for any owner
      if (req.user.roleId === 1) { // Admin role
        if (owner_id) {
          // Admin specified an owner_id
          const ownerExists = await OwnerModel.findById(owner_id);
          if (!ownerExists) {
            return res.status(404).json({
              error: "Specified owner not found"
            });
          }
          reservationOwnerId = owner_id;
        } else {
          return res.status(400).json({
            error: "Admin must specify owner_id when creating a reservation"
          });
        }
      } else if (req.user.roleId === 3) { // Owner role
        // Get owner ID from the authenticated user
        const owner = await OwnerModel.findByUserId(req.user.id);
        if (!owner) {
          return res.status(403).json({
            error: "Owner record not found for this user"
          });
        }
        reservationOwnerId = owner.Owner_id;
      } else {
        return res.status(403).json({
          error: "Only administrators and owners can make reservations"
        });
      }

      // Default status is 1 (Pending)
      const initialStatusId = 1;

      const reservationId = await ReservationModel.create({
        owner_id: reservationOwnerId,
        type_id,
        status_id: initialStatusId,
        facility_id,
        start_date: startDateTime.toISOString(),
        end_date: endDateTime.toISOString(),
        description: description || null,
      });

      if (reservationId.error) {
        return res.status(400).json({ error: reservationId.error });
      }

      res.status(201).json({
        message: "Reservation created successfully",
        data: {
          id: reservationId,
          owner_id: reservationOwnerId,
          type_id,
          status_id: initialStatusId,
          facility_id,
          start_date: startDateTime.toISOString(),
          end_date: endDateTime.toISOString(),
          description,
        },
      });
    } catch (error) {
      console.error("Error creating reservation:", error);
      res
        .status(500)
        .json({ error: "Internal server error while creating reservation" });
    }
  }

  static async show(req, res) {
    try {
      const reservations = await ReservationModel.show();

      if (reservations.error) {
        return res.status(500).json({ error: reservations.error });
      }
      if (reservations.length === 0) {
        return res.status(404).json({ error: "No reservations found" });
      }

      res.status(200).json({
        message: "Reservations retrieved successfully",
        data: reservations,
      });
    } catch (error) {
      console.error("Error fetching reservations:", error);
      res
        .status(500)
        .json({ error: "Internal server error while fetching reservations" });
    }
  }

  static async findById(req, res) {
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
        data: reservation,
      });
    } catch (error) {
      console.error("Error finding reservation:", error);
      res
        .status(500)
        .json({ error: "Internal server error while finding reservation" });
    }
  }

  static async update(req, res) {
    try {
      const id = req.params.id;
      const {
        type_id,
        status_id,
        facility_id,
        start_date,
        end_date,
        description,
      } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Reservation ID is required" });
      }

      // Validate date format and range if dates are being updated
      if (start_date || end_date) {
        const startDateTime = new Date(start_date);
        const endDateTime = new Date(end_date);
        const now = new Date();

        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
          return res.status(400).json({
            error: "Invalid date format. Please use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)",
          });
        }

        if (startDateTime < now) {
          return res.status(400).json({
            error: "Start date cannot be in the past",
          });
        }

        if (endDateTime <= startDateTime) {
          return res.status(400).json({
            error: "End date must be after start date",
          });
        }
      }

      const updateResult = await ReservationModel.update(id, {
        type_id,
        status_id,
        facility_id,
        start_date: start_date ? new Date(start_date).toISOString() : undefined,
        end_date: end_date ? new Date(end_date).toISOString() : undefined,
        description,
      });

      if (updateResult.error) {
        return res.status(404).json({ error: updateResult.error });
      }

      res.status(200).json({
        message: "Reservation updated successfully",
        data: {
          id,
          type_id,
          status_id,
          facility_id,
          start_date: start_date ? new Date(start_date).toISOString() : undefined,
          end_date: end_date ? new Date(end_date).toISOString() : undefined,
          description,
        },
      });
    } catch (error) {
      console.error("Error updating reservation:", error);
      res
        .status(500)
        .json({ error: "Internal server error while updating reservation" });
    }
  }

  static async delete(req, res) {
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
        data: { id },
      });
    } catch (error) {
      console.error("Error deleting reservation:", error);
      res
        .status(500)
        .json({ error: "Internal server error while deleting reservation" });
    }
  }

  static async findByDateRange(req, res) {
    try {
      const { start_date, end_date } = req.query;

      if (!start_date || !end_date) {
        return res
          .status(400)
          .json({ error: "Start date and end date are required" });
      }

      const reservations = await ReservationModel.findByDateRange(
        start_date,
        end_date
      );

      if (reservations.error) {
        return res.status(500).json({ error: reservations.error });
      }

      res.status(200).json({
        message: "Reservations found successfully",
        data: reservations,
      });
    } catch (error) {
      console.error("Error finding reservations by date range:", error);
      res
        .status(500)
        .json({ error: "Internal server error while finding reservations" });
    }
  }

  static async findMyReservations(req, res) {
    try {
      let reservations;

      if (req.user.roleId === 1) { // Admin role
        // Admins can see all reservations
        reservations = await ReservationModel.show();
      } else if (req.user.roleId === 3) { // Owner role
        // Get owner ID from the authenticated user
        const owner = await OwnerModel.findByUserId(req.user.id);
        if (!owner) {
          return res.status(403).json({
            error: "Owner record not found for this user"
          });
        }
        reservations = await ReservationModel.findByOwner(owner.Owner_id);
      } else {
        return res.status(403).json({
          error: "Only administrators and owners can view reservations"
        });
      }

      if (reservations.error) {
        return res.status(500).json({ error: reservations.error });
      }

      res.status(200).json({
        message: "Reservations retrieved successfully",
        data: reservations,
      });
    } catch (error) {
      console.error("Error finding reservations:", error);
      res
        .status(500)
        .json({
          error: "Internal server error while finding reservations",
        });
    }
  }

  static async findByOwner(req, res) {
    try {
      const ownerId = req.params.owner_id;
      const reservations = await ReservationModel.findByOwner(ownerId);

      if (reservations.error) {
        return res.status(500).json({ error: reservations.error });
      }

      res.status(200).json({
        message: "Reservations found successfully",
        data: reservations,
      });
    } catch (error) {
      console.error("Error finding reservations by owner:", error);
      res
        .status(500)
        .json({ error: "Internal server error while finding reservations by owner" });
    }
  }
}

export default ReservationController;