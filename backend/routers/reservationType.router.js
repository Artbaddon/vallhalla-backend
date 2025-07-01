import { Router } from "express";
import ReservationTypeController from "../controllers/reservationType.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

// Define roles that can access these endpoints
const ADMIN_ROLES = [1]; // Assuming role ID 1 is admin
const MANAGER_ROLES = [1, 2]; // Assuming role IDs 1 and 2 are admin and manager
const VIEW_ROLES = [1, 2, 3]; // Assuming role IDs 1, 2, 3 are admin, manager, and regular user

// Public endpoints (view only)
router.get("/", authMiddleware(VIEW_ROLES), ReservationTypeController.show);
router.get("/:id", authMiddleware(VIEW_ROLES), ReservationTypeController.findById);

// Protected endpoints (admin/manager only)
router.post("/", authMiddleware(MANAGER_ROLES), ReservationTypeController.create);
router.put("/:id", authMiddleware(MANAGER_ROLES), ReservationTypeController.update);
router.delete("/:id", authMiddleware(ADMIN_ROLES), ReservationTypeController.delete);

export default router; 