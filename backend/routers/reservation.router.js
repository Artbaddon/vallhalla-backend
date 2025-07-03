import { Router } from "express";
import ReservationController from "../controllers/reservation.controller.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = Router();

// Get all reservations (requires read permission)
router.get("/", 
  requirePermission("reservations", "read"),
  ReservationController.show
);

// Create reservation (requires create permission)
router.post("/",
  requirePermission("reservations", "create"),
  ReservationController.create
);

// Get reservations by date range (requires read permission)
router.get("/date-range",
  requirePermission("reservations", "read"),
  ReservationController.findByDateRange
);

// Get my reservations (requires read permission)
router.get("/my/reservations",
  requirePermission("reservations", "read"),
  ReservationController.findMyReservations
);

// Get specific reservation (requires read permission)
router.get("/:id",
  requirePermission("reservations", "read"),
  ReservationController.findById
);

// Update reservation (requires update permission)
router.put("/:id",
  requirePermission("reservations", "update"),
  ReservationController.update
);

// Delete reservation (requires delete permission)
router.delete("/:id",
  requirePermission("reservations", "delete"),
  ReservationController.delete
);

// Get reservations by owner
router.get('/owner/:owner_id',
  requirePermission('reservations', 'read'),
  ReservationController.findByOwner
);

export default router;
