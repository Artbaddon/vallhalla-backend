import { Router } from "express";
import PQRSCategoryController from "../controllers/pqrsCategory.controller.js";

const router = Router();
const name = "/pqrs-category";

// Public Routes
router.post(name, PQRSCategoryController.register);
router.get(name + "/", PQRSCategoryController.show);
router.get(name + "/:id", PQRSCategoryController.findById);
router.put(name + "/:id", PQRSCategoryController.update);
router.delete(name + "/:id", PQRSCategoryController.delete);

export default router;