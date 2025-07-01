import express from "express";
import { authMiddleware, ownerResourceAccess } from "../middleware/authMiddleware.js";
import { ROLES } from "../middleware/rbacConfig.js";
import ReservationController from "../controllers/reservation.controller.js";

const router = express.Router();
const name = "";  // Base path is handled by app.js

// Define roles that can access these endpoints
const ADMIN_ROLES = [1]; // Assuming role ID 1 is admin
const MANAGER_ROLES = [1, 2]; // Assuming role IDs 1 and 2 are admin and manager
const VIEW_ROLES = [1, 2, 3]; // Assuming role IDs 1, 2, 3 are admin, manager, and regular user

// Define routes in order of specificity (most specific first)

// Special routes
router.get(name + "/my/reservations", authMiddleware([ROLES.OWNER]), ReservationController.findMyReservations);
router.get(name + "/date-range", authMiddleware([ROLES.ADMIN, ROLES.STAFF, ROLES.OWNER]), ReservationController.findByDateRange);

// Routes with owner_id parameter
router.get(name + "/owner/:owner_id", authMiddleware([ROLES.ADMIN, ROLES.STAFF, ROLES.OWNER]), ownerResourceAccess('owner_id'), ReservationController.findByOwner);

// Base routes
router.get(name + "/", authMiddleware([ROLES.ADMIN, ROLES.STAFF]), ReservationController.show);
router.post(name + "/", authMiddleware([ROLES.ADMIN, ROLES.STAFF, ROLES.OWNER]), ReservationController.register);

// Routes with id parameter (must come last)
router.get(name + "/:id", authMiddleware([ROLES.ADMIN, ROLES.STAFF, ROLES.OWNER]), ownerResourceAccess('id'), ReservationController.findById);
router.put(name + "/:id", authMiddleware([ROLES.ADMIN, ROLES.STAFF, ROLES.OWNER]), ownerResourceAccess('id'), ReservationController.update);
router.delete(name + "/:id", authMiddleware([ROLES.ADMIN]), ReservationController.delete);

export default router;
