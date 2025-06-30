import { Router } from "express";
import UserController from "../controllers/user.controller.js";

const router = Router();
const name = "/users";

// Public Routes
router.post(name, UserController.register);
router.get(name + "/", UserController.show);
router.get(name + "/details", UserController.showWithDetails);
router.get(name + "/search", UserController.findByName);
router.get(name + "/:id", UserController.findById);
router.put(name + "/:id", UserController.update);
router.patch(name + "/:id/status", UserController.updateStatus);
router.delete(name + "/:id", UserController.delete);

export default router; 