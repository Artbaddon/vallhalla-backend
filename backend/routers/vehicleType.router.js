import { Router } from "express";
import VehicleTypeController from "../controllers/vehicleType.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { ROLES } from "../middleware/rbacConfig.js";

const router = Router();
const name = "/vehicleType";

router.route(name)
  .post(authMiddleware([ROLES.ADMIN, ROLES.OWNER]), VehicleTypeController.register)
  .get(authMiddleware([ROLES.ADMIN, ROLES.OWNER]), VehicleTypeController.show);

router.route(`${name}/:id`)
  .get(authMiddleware([ROLES.ADMIN, ROLES.OWNER]), VehicleTypeController.findById)
  .put(authMiddleware([ROLES.ADMIN, ROLES.OWNER]), VehicleTypeController.update)
  .delete(authMiddleware([ROLES.ADMIN, ROLES.OWNER]), VehicleTypeController.delete);

export default router;