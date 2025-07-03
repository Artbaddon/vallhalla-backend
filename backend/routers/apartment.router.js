import express from "express";

import ApartmentController from "../controllers/apartment.controller.js";
import {
  requirePermission,
  requireOwnership,
} from "../middleware/permissionMiddleware.js";

const router = express.Router();

// Public Routes - None for apartments

// Admin-only routes
router.post(
  "/",
  requirePermission("apartments", "create"),
  ApartmentController.register
);

router.get(
  "/report/occupancy",
  requirePermission("apartments", "read"),
  ApartmentController.getOccupancyReport
);

router.get(
  "/details",
  requirePermission("apartments", "read"),
  requireOwnership("apartment"),
  ApartmentController.showWithDetails
);

router.get(
  "/search/number",
  requirePermission("apartments", "read"),
  ApartmentController.findByNumber
);

router.get(
  "/search/owner",
  requirePermission("apartments", "read"),
  ApartmentController.findByOwner
);

router.get(
  "/search/status",
  requirePermission("apartments", "read"),
  ApartmentController.findByStatus
);

router.get(
  "/search/tower",
  requirePermission("apartments", "read"),
  ApartmentController.findByTower
);

router.get(
  "/",
  requirePermission("apartments", "read"),
  requireOwnership("apartment"),
  ApartmentController.show
);

// Routes with :id parameter must come last
router.get(
  "/:id/details",
  requirePermission("apartments", "read"),
  ApartmentController.findWithDetails
);

router.get(
  "/:id",
  requirePermission("apartments", "read"),
  ApartmentController.findById
);

router.put(
  "/:id",
  requirePermission("apartments", "update"),
  ApartmentController.update
);

router.patch(
  "/:id/status",
  requirePermission("apartments", "update"),
  ApartmentController.updateStatus
);

router.delete(
  "/:id",
  requirePermission("apartments", "delete"),
  ApartmentController.delete
);

export default router;
