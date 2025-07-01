import { Router } from "express";
import towerController from "../controllers/tower.controller.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = Router();

// Protected routes
router.post("/", 
  requirePermission("towers", "create"),
  towerController.register
);

router.get("/", 
  requirePermission("towers", "read"),
  towerController.show
);

router.get("/:Tower_id", 
  requirePermission("towers", "read"),
  towerController.findByTower_id
);

router.put("/:Tower_id", 
  requirePermission("towers", "update"),
  towerController.update
);

router.delete("/:Tower_id", 
  requirePermission("towers", "delete"),
  towerController.delete
);

export default router;
