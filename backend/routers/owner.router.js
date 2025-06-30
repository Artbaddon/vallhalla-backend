import { Router } from "express";
import OwnerController from "../controllers/owner.controller.js";

const router = Router();
const name = "/owners";

// Public Routes
router.post(name, OwnerController.register);
router.get(name + "/", OwnerController.show);
router.get(name + "/details", OwnerController.showWithDetails);
router.get(name + "/search", OwnerController.findByUserId);
router.get(name + "/tenant-status", OwnerController.getByTenantStatus);
router.get(name + "/:id", OwnerController.findById);
router.get(name + "/:id/details", OwnerController.findWithDetails);
router.put(name + "/:id", OwnerController.update);
router.delete(name + "/:id", OwnerController.delete);

export default router; 