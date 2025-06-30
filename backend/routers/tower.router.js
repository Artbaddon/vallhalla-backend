import { Router } from "express";
import towerController from "../controllers/tower.controller.js";
const router = Router();
const name = "/tower";

//Public Route

router.post(name, towerController.register);
router.get(name + "/", towerController.show);
router.get(name + "/:id", towerController.findById);
router.put(name + "/:id", towerController.update);
router.delete(name + "/:id", towerController.delete);

export default router;
