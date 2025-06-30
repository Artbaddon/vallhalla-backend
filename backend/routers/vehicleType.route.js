import { Router } from "express";
import VehicleTypeController from "../controllers/vehicleType.controller.js";

const router = Router();
const name = "/vehicleType";

router.route(name)
  .post(VehicleTypeController.register)
  .get(VehicleTypeController.show);

router.route(`${name}/:id`)
  .get(VehicleTypeController.findById)
  .put(VehicleTypeController.update)
  .delete(VehicleTypeController.delete);

export default router;
