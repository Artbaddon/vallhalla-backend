import { Router } from "express";
import ApartmentController from "../controllers/apartment.controller.js";

const router = Router();
const name = "/apartments";

// Public Routes
router.post(name, ApartmentController.register);
router.get(name + "/", ApartmentController.show);
router.get(name + "/details", ApartmentController.showWithDetails);
router.get(name + "/search/number", ApartmentController.findByNumber);
router.get(name + "/search/owner", ApartmentController.findByOwner);
router.get(name + "/search/status", ApartmentController.findByStatus);
router.get(name + "/search/tower", ApartmentController.findByTower);
router.get(name + "/report/occupancy", ApartmentController.getOccupancyReport);
router.get(name + "/:id", ApartmentController.findById);
router.get(name + "/:id/details", ApartmentController.findWithDetails);
router.put(name + "/:id", ApartmentController.update);
router.patch(name + "/:id/status", ApartmentController.updateStatus);
router.delete(name + "/:id", ApartmentController.delete);

export default router; 