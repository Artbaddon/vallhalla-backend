import express from 'express';
import * as facilityController from '../controllers/facility.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { ROLES } from '../middleware/rbacConfig.js';

const router = express.Router();

// Admin-only routes
router.post('/', authMiddleware([ROLES.ADMIN]), facilityController.register);
router.put('/:id', authMiddleware([ROLES.ADMIN]), facilityController.update);
router.put('/:id/status', authMiddleware([ROLES.ADMIN]), facilityController.updateStatus);
router.delete('/:id', authMiddleware([ROLES.ADMIN]), facilityController.remove);

// Admin and Staff routes
router.get('/availability', authMiddleware([ROLES.ADMIN, ROLES.STAFF]), facilityController.getAvailability);

// Routes accessible to all authenticated users
router.get('/', authMiddleware([ROLES.ADMIN, ROLES.STAFF, ROLES.OWNER, ROLES.SECURITY]), facilityController.show);
router.get('/status', authMiddleware([ROLES.ADMIN, ROLES.STAFF, ROLES.OWNER, ROLES.SECURITY]), facilityController.findByStatus);
router.get('/:id', authMiddleware([ROLES.ADMIN, ROLES.STAFF, ROLES.OWNER, ROLES.SECURITY]), facilityController.findById);

export default router; 