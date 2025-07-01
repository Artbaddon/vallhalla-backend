import { Router } from "express";
import ParkingController from "../controllers/parking.controller.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = Router();

// Protected routes
// View all parking spots
router.get('/', 
  requirePermission('parking', 'read'),
  ParkingController.show
);

// View specific parking spot
router.get('/:id',
  requirePermission('parking', 'read'),
  ParkingController.findById
);

// Only admin can create new parking spots
router.post('/',
  requirePermission('parking', 'create'),
  ParkingController.register
);

// Only admin can update parking configuration
router.put('/:id',
  requirePermission('parking', 'update'),
  ParkingController.update
);

// Only admin can delete parking spots
router.delete('/:id',
  requirePermission('parking', 'delete'),
  ParkingController.delete
);

// Assign vehicle to parking spot
router.post('/assign',
  requirePermission('parking', 'update'),
  ParkingController.assignVehicle
);

export default router;
