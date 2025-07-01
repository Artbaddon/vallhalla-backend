import { Router } from "express";
import PetController from "../controllers/pet.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { ROLES } from "../middleware/rbacConfig.js";

const router = Router();

// Public Routes
router.post(
  "/",
  authMiddleware([ROLES.ADMIN, ROLES.OWNER]),
  PetController.register
);
router.get("/", authMiddleware([ROLES.ADMIN, ROLES.OWNER]), PetController.show);
router.get(
  "/:id",
  authMiddleware([ROLES.ADMIN, ROLES.OWNER]),
  PetController.findById
);
router.put(
  "/:id",
  authMiddleware([ROLES.ADMIN, ROLES.OWNER]),
  PetController.update
);
router.delete(
  "/:id",
  authMiddleware([ROLES.ADMIN, ROLES.OWNER]),
  PetController.delete
);

export default router;
