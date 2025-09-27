import { Router } from "express";
import ReservationTypeController from "../controllers/reservationType.controller.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = Router();

// Protected routes
router.get("/", 
  requirePermission("reservationTypes", "read"), 
  ReservationTypeController.show
);

router.get("/:id", 
  requirePermission("reservationTypes", "read"), 
  ReservationTypeController.findById
);

router.post("/", 
  requirePermission("reservationTypes", "create"), 
  ReservationTypeController.create
);

router.put("/:id", 
  requirePermission("reservationTypes", "update"), 
  ReservationTypeController.update
);

router.delete("/:id", 
  requirePermission("reservationTypes", "delete"), 
  ReservationTypeController.delete
);

export default router; 