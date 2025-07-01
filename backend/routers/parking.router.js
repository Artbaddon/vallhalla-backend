import { Router } from "express";
import ParkingController from "../controllers/parking.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { ROLES } from "../middleware/rbacConfig.js";

const router = Router();
const name = "/parking";

// Define all routes
router.post(
  `${name}/assignVehicle`,
  authMiddleware([ROLES.ADMIN, ROLES.OWNER]),
  ParkingController.assignVehicle
);

router
  .route(name)
  .post(authMiddleware([ROLES.ADMIN, ROLES.OWNER]), ParkingController.register) // Create parking
  .get(authMiddleware([ROLES.ADMIN, ROLES.OWNER]), ParkingController.show); // List all parkings

router
  .route(`${name}/:id`)
  .get(authMiddleware([ROLES.ADMIN, ROLES.OWNER]), ParkingController.findById) // Get specific parking
  .put(authMiddleware([ROLES.ADMIN, ROLES.OWNER]), ParkingController.update) // Update parking
  .delete(authMiddleware([ROLES.ADMIN, ROLES.OWNER]), ParkingController.delete); // Delete parking

export default router;
