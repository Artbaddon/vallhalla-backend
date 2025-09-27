import express from 'express';
import paymentController from '../controllers/payment.controller.js';
import { verifyToken, ownerResourceAccess } from '../middleware/authMiddleware.js';
import { requirePermission, requireAdmin } from '../middleware/permissionMiddleware.js';

const router = express.Router();

// Admin routes
router.post('/', 
  verifyToken,
  requireAdmin,
  paymentController.create
);

router.get('/',
  verifyToken,
  requirePermission('payments', 'read'),
  paymentController.show
);

router.get('/stats',
  verifyToken,
  requirePermission('payments', 'read'),
  paymentController.getPaymentStats
);

router.get('/:id',
  verifyToken,
  requirePermission('payments', 'read'),
  paymentController.showById
);

router.put('/:id',
  verifyToken,
  requirePermission('payments', 'update'),
  paymentController.update
);

router.delete('/:id',
  verifyToken,
  requirePermission('payments', 'delete'),
  paymentController.delete
);

// Owner routes
router.get('/owner/:owner_id',
  verifyToken,
  ownerResourceAccess('owner_id', 'userId'),
  requirePermission('payments', 'read'),
  paymentController.getOwnerPayments
);

router.get('/owner/:owner_id/pending',
  verifyToken,
  ownerResourceAccess('owner_id', 'userId'),
  requirePermission('payments', 'read'),
  paymentController.getPendingPayments
);

router.post('/owner/:owner_id/pay/:payment_id',
  verifyToken,
  ownerResourceAccess('owner_id', 'userId'),
  requirePermission('payments', 'update'),
  paymentController.makePayment
);

export default router;
