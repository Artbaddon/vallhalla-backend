import { Router } from "express";
import ReservationController from "../controllers/reservation.controller.js";

const router = Router();
const name = "/reservation";

// Public Routes
router.post(name, ReservationController.register);
router.get(name + "/", ReservationController.show);
router.get(name + "/:id", ReservationController.findById);
router.get(name + "/owner/:owner_id", ReservationController.findByOwner);
router.get(name + "/date-range", ReservationController.findByDateRange);
router.put(name + "/:id", ReservationController.update);
router.delete(name + "/:id", ReservationController.delete);

export default router;
