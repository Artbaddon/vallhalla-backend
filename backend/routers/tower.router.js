import { Router } from "express";
import towerController from "../controllers/tower.controller.js";
import {
  authMiddleware,
  ownerResourceAccess,
} from "../middleware/authMiddleware.js";
import { ROLES } from "../middleware/rbacConfig.js";
const router = Router();

//Public Route

router.post("/", authMiddleware([ROLES.ADMIN]), towerController.register);
router.get(
  "/",
  authMiddleware([ROLES.ADMIN, ROLES.STAFF, ROLES.OWNER]),
  towerController.show
);
router.get(
  "/:Tower_id",
  authMiddleware([ROLES.ADMIN, ROLES.STAFF, ROLES.OWNER]),
  ownerResourceAccess("Tower_id"),
  towerController.findByTower_id
);
router.put(
  "/:Tower_id",
  authMiddleware([ROLES.ADMIN, ROLES.STAFF]),
  towerController.update
);
router.delete("/:Tower_id", authMiddleware([ROLES.ADMIN]), towerController.delete);

export default router;
