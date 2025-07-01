import { Router } from 'express';
import TenantController from '../controllers/tenant.controller.js';
import { requirePermission, requireOwnership } from '../middleware/permissionMiddleware.js';

const router = Router();

// Public routes (if any)

// Protected routes
// Owners can see their tenants, admin can see all
router.get('/', 
  requirePermission('tenants', 'read'),
  TenantController.getAll
);

// Owners can create tenants
router.post('/',
  requirePermission('tenants', 'create'),
  TenantController.create
);

// View specific tenant (owners can only see their own)
router.get('/:id',
  requirePermission('tenants', 'read'),
  requireOwnership('tenant'),
  TenantController.getById
);

// Owners can update their tenants
router.put('/:id',
  requirePermission('tenants', 'update'),
  requireOwnership('tenant'),
  TenantController.update
);

// Owners can delete their tenants
router.delete('/:id',
  requirePermission('tenants', 'delete'),
  requireOwnership('tenant'),
  TenantController.remove
);

// Get my tenants
router.get('/my/tenants',
  requirePermission('tenants', 'read'),
  TenantController.getMyTenants
);

export default router; 