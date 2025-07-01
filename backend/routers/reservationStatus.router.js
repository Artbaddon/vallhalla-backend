import { Router } from "express";
import ReservationStatusController from "../controllers/reservationStatus.controller.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = Router();

// Protected routes
router.get("/", 
  requirePermission("reservationStatus", "read"), 
  ReservationStatusController.show
);

router.get("/:id", 
  requirePermission("reservationStatus", "read"), 
  ReservationStatusController.findById
);

router.post("/", 
  requirePermission("reservationStatus", "create"), 
  ReservationStatusController.create
);

router.put("/:id", 
  requirePermission("reservationStatus", "update"), 
  ReservationStatusController.update
);

router.delete("/:id", 
  requirePermission("reservationStatus", "delete"), 
  ReservationStatusController.delete
);

export default router;
