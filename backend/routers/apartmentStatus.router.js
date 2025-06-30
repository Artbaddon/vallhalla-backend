import { Router } from "express";
import AparmentStatusController from "../controllers/apartmentStatus.controller.js";
const router = Router();
const name = "/apartmentStatus";

//Public Route

router.post(name, AparmentStatusController.register);
router.get(name + "/", AparmentStatusController.show);
router.get(name + "/:id", AparmentStatusController.findById);
router.put(name + "/:id", AparmentStatusController.update);
router.delete(name + "/:id", AparmentStatusController.delete);

export default router;
