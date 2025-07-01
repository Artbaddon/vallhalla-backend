import { Router } from "express";
import VehicleTypeController from "../controllers/vehicleType.controller.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = Router();

// Protected routes
router.route("/")
  .post(requirePermission("vehicleTypes", "create"), VehicleTypeController.register)
  .get(requirePermission("vehicleTypes", "read"), VehicleTypeController.show);

router.route(`/:id`)
  .get(requirePermission("vehicleTypes", "read"), VehicleTypeController.findById)
  .put(requirePermission("vehicleTypes", "update"), VehicleTypeController.update)
  .delete(requirePermission("vehicleTypes", "delete"), VehicleTypeController.delete);

export default router;