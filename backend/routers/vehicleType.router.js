import { Router } from "express";
import VehicleTypeController from "../controllers/vehicleType.controller.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = Router();

// Protected routes
router.route("/")
  .post(requirePermission("vehicle-type", "create"), VehicleTypeController.register)
  .get(requirePermission("vehicle-type", "read"), VehicleTypeController.show);

router.route(`/:id`)
  .get(requirePermission("vehicle-type", "read"), VehicleTypeController.findById)
  .put(requirePermission("vehicle-type", "update"), VehicleTypeController.update)
  .delete(requirePermission("vehicle-type", "delete"), VehicleTypeController.delete);

export default router;