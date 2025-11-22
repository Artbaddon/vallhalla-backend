import { Router } from "express";
import ParkingController from "../controllers/parking.controller.js";
import { requirePermission, requireAdmin, requireRoles } from "../middleware/permissionMiddleware.js";
import { ROLES } from "../middleware/rbacConfig.js";

const router = Router();

// Gate access to parking module according to new role rules
router.use(requireRoles(ROLES.OWNER, ROLES.SECURITY));

// Protected routes
// View all parking spots
router.get('/', 
  requirePermission('parking', 'read'),
  ParkingController.show
);

router.get('/parking-types', 
  requirePermission('parking', 'read'),
  ParkingController.getParkingTypes
);

router.get('/parking-statuses', 
  requirePermission('parking', 'read'),
  ParkingController.getParkingStatus
);


// View specific parking spot
router.get('/:id',
  requirePermission('parking', 'read'),
  ParkingController.findById
);

// Only admin can create new parking spots
router.post('/',
  requireAdmin,
  ParkingController.register
);

router.put('/reserve',
  requirePermission('parking', 'update'),
  ParkingController.reserve
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
