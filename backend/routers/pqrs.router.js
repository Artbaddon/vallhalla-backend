import { Router } from "express";
import PQRSController from "../controllers/pqrs.controller.js";

const router = Router();
const name = "/pqrs";

// Public Routes
router.post(name, PQRSController.register);
router.get(name + "/", PQRSController.show);
router.get(name + "/search", PQRSController.search);
router.get(name + "/stats", PQRSController.getStats);
router.get(name + "/:id", PQRSController.findById);
router.get(name + "/owner/:owner_id", PQRSController.findByOwner);
router.get(name + "/status/:status_id", PQRSController.findByStatus);
router.get(name + "/category/:category_id", PQRSController.findByCategory);
router.put(name + "/:id", PQRSController.update);
router.put(name + "/:id/status", PQRSController.updateStatus);
router.delete(name + "/:id", PQRSController.delete);

export default router;