import { Router } from "express";
import VisitorController from "../controllers/visitor.controller.js";

const router = Router();
const name = "/visitor";

// Public Routes
router.post(name, VisitorController.register);
router.get(name + "/", VisitorController.show);
router.get(name + "/:id", VisitorController.findById);
router.get(name + "/host/:host_id", VisitorController.findByHost);
router.get(name + "/date/:visit_date", VisitorController.findByDate);
router.put(name + "/:id", VisitorController.update);
router.delete(name + "/:id", VisitorController.delete);

export default router;