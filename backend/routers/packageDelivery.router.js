import express from 'express';
import packageDeliveryController from '../controllers/packageDelivery.controller.js';
import PackageAuthMiddleware from '../middleware/packageAuthMiddleware.js';

const router = express.Router();

// Apply authentication to all routes
router.use(PackageAuthMiddleware.authenticateUser);

// Guard-only routes - Package registration and management
router.post('/register', 
  PackageAuthMiddleware.checkGuardRole,
  PackageAuthMiddleware.validatePackageData,
  packageDeliveryController.registerPackage.bind(packageDeliveryController)
);


router.delete('/:id', 
  PackageAuthMiddleware.checkGuardRole, 
  packageDeliveryController.deletePackage.bind(packageDeliveryController)
);

// Routes accessible by both guards and owners
router.get('/', 
  PackageAuthMiddleware.checkOwnerOrGuardAccess, 
  packageDeliveryController.getPackages.bind(packageDeliveryController)
);

router.get('/my-packages', 
  PackageAuthMiddleware.checkOwnerOrGuardAccess, 
  packageDeliveryController.getMyPackages.bind(packageDeliveryController)
);

router.get('/:id', 
  PackageAuthMiddleware.checkOwnerOrGuardAccess, 
  packageDeliveryController.getPackageById.bind(packageDeliveryController)
);

// Status update - guards can update any status, owners can only mark as delivered
router.put('/:id/status', 
  PackageAuthMiddleware.checkOwnerOrGuardAccess,
  PackageAuthMiddleware.validateStatusUpdate,
  packageDeliveryController.updatePackageStatus.bind(packageDeliveryController)
);

// Owner-specific routes
router.get('/owner/:owner_id/packages', 
  PackageAuthMiddleware.checkOwnerOrGuardAccess,
  PackageAuthMiddleware.checkOwnerDataAccess,
  packageDeliveryController.getPackages.bind(packageDeliveryController)
);

export default router;
