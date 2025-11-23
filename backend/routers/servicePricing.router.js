import { Router } from "express";
import ServicePricingController from "../controllers/servicePricing.controller.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  requirePermission,
  requireAdmin,
} from "../middleware/permissionMiddleware.js";

const router = Router();

// CRUD Routes - Solo Admin puede crear/actualizar/eliminar
router.post("/", verifyToken, requireAdmin, ServicePricingController.create);
router.get(
  "/",
  verifyToken,
  requirePermission("servicepricing", "read"),
  ServicePricingController.getAll
);
router.get(
  "/:id",
  verifyToken,
  requirePermission("servicepricing", "read"),
  ServicePricingController.getById
);

router.get(
  "/vehicle/:vehicle_type_id",
  verifyToken,
  requirePermission("servicepricing", "read"),
  ServicePricingController.getVehiclePrice
);
router.get(
  "/reservation/:reservation_type_id",
  verifyToken,
  requirePermission("servicepricing", "read"),
  ServicePricingController.getReservationPrice
);
// Cálculo de precios - Accesible para usuarios con permisos de lectura
router.post(
  "/calculate/parking",
  verifyToken,
  requirePermission("servicepricing", "read"),
  ServicePricingController.calculateParkingPrice
);

router.post(
  "/calculate/reservation",
  verifyToken,
  requirePermission("servicepricing", "read"),
  ServicePricingController.calculateReservationPrice
);

// Operaciones de administración - Solo Admin
router.put("/:id", verifyToken, requireAdmin, ServicePricingController.update);
router.delete(
  "/:id",
  verifyToken,
  requireAdmin,
  ServicePricingController.delete
);

export default router;
