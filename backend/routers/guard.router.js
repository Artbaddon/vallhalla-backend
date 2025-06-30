import { Router } from "express";
import GuardController from "../controllers/guard.controller.js";

const router = Router();
const name = "/guard";

// Public Routes
router.post(name, GuardController.register);
router.get(name + "/", GuardController.show);
router.get(name + "/:id", GuardController.findById);
router.get(name + "/shift/:shift", GuardController.findByShift);
router.put(name + "/:id", GuardController.update);
router.delete(name + "/:id", GuardController.delete);

export default router;
