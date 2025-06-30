import { Router } from "express";
import ParkingController from "../controllers/parking.controller.js";

const router = Router();
const name = "/parking";

// Define all routes
router.post(`${name}/assignVehicle`, ParkingController.assignVehicle);

router.route(name)
  .post(ParkingController.register)    // Create parking
  .get(ParkingController.show);        // List all parkings

router.route(`${name}/:id`)
  .get(ParkingController.findById)     // Get specific parking
  .put(ParkingController.update)       // Update parking
  .delete(ParkingController.delete);   // Delete parking

export default router;