import { Router } from "express";
import ReservationStatusController from "../controllers/reservationStatus.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// Define roles that can access these endpoints
const ADMIN_ROLES = [1]; // Assuming role ID 1 is admin
const MANAGER_ROLES = [1, 2]; // Assuming role IDs 1 and 2 are admin and manager
const VIEW_ROLES = [1, 2, 3]; // Assuming role IDs 1, 2, 3 are admin, manager, and regular user

// Public endpoints (view only)
router.get("/", authMiddleware(VIEW_ROLES), ReservationStatusController.show);
router.get("/:id", authMiddleware(VIEW_ROLES), ReservationStatusController.findById);

// Protected endpoints (admin/manager only)
router.post("/", authMiddleware(MANAGER_ROLES), ReservationStatusController.create);
router.put("/:id", authMiddleware(MANAGER_ROLES), ReservationStatusController.update);
router.delete("/:id", authMiddleware(ADMIN_ROLES), ReservationStatusController.delete);

export default router; 