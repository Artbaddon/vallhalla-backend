import { Router } from "express";
import PetController from "../controllers/pet.controller.js";

const router = Router();
const name = "/pet";

// Public Routes
router.post(name, PetController.register);
router.get(name + "/", PetController.show);
router.get(name + "/:id", PetController.findById);
router.put(name + "/:id", PetController.update);
router.delete(name + "/:id", PetController.delete);

export default router; 