import express from "express";
import { authMiddleware, ownerResourceAccess } from "../middleware/authMiddleware.js";
import { ROLES } from "../middleware/rbacConfig.js";
import ApartmentController from "../controllers/apartment.controller.js";

const router = express.Router();

// Public Routes - None for apartments

// Admin-only routes
router.post("/", authMiddleware([ROLES.ADMIN]), ApartmentController.register);
router.put("/:id", authMiddleware([ROLES.ADMIN]), ApartmentController.update);
router.patch("/:id/status", authMiddleware([ROLES.ADMIN]), ApartmentController.updateStatus);
router.delete("/:id", authMiddleware([ROLES.ADMIN]), ApartmentController.delete);

// Admin and Staff routes
router.get("/report/occupancy", authMiddleware([ROLES.ADMIN, ROLES.STAFF]), ApartmentController.getOccupancyReport);

// Admin, Staff, and Owner routes
router.get("/", authMiddleware([ROLES.ADMIN, ROLES.STAFF, ROLES.OWNER]), ownerResourceAccess(), ApartmentController.show);
router.get("/details", authMiddleware([ROLES.ADMIN, ROLES.STAFF, ROLES.OWNER]), ownerResourceAccess(), ApartmentController.showWithDetails);
router.get("/search/number", authMiddleware([ROLES.ADMIN, ROLES.STAFF, ROLES.OWNER]), ApartmentController.findByNumber);
router.get("/search/status", authMiddleware([ROLES.ADMIN, ROLES.STAFF, ROLES.OWNER]), ApartmentController.findByStatus);
router.get("/search/tower", authMiddleware([ROLES.ADMIN, ROLES.STAFF, ROLES.OWNER]), ApartmentController.findByTower);

// Owner can only see their own apartments
router.get("/search/owner", authMiddleware([ROLES.ADMIN, ROLES.STAFF, ROLES.OWNER]), ownerResourceAccess(), ApartmentController.findByOwner);
router.get("/:id", authMiddleware([ROLES.ADMIN, ROLES.STAFF, ROLES.OWNER]), ownerResourceAccess('id'), ApartmentController.findById);
router.get("/:id/details", authMiddleware([ROLES.ADMIN, ROLES.STAFF, ROLES.OWNER]), ownerResourceAccess('id'), ApartmentController.findWithDetails);

export default router;
