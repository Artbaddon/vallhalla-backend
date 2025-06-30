import { Router } from "express";
import PaymentController from "../controllers/payment.controller.js";

const router = Router();
const name = "/payment";

// Public Routes
router.post(name, PaymentController.register);
router.get(name + "/", PaymentController.show);
router.get(name + "/stats", PaymentController.getStats);
router.get(name + "/:id", PaymentController.findById);
router.get(name + "/owner/:owner_id", PaymentController.findByOwner);
router.put(name + "/:id", PaymentController.update);
router.delete(name + "/:id", PaymentController.delete);

export default router;
