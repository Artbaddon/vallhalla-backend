import { Router } from 'express';
import ReservationController from '../controllers/reservation.controller.js';
import { requirePermission, requireOwnership } from '../middleware/permissionMiddleware.js';

const router = Router();

// Public routes (if any)

// Protected routes
// Admin can see all reservations
router.get('/', 
  requirePermission('reservations', 'read'),
  ReservationController.show
);

// Create reservation
router.post('/',
  requirePermission('reservations', 'create'),
  ReservationController.register
);

// View specific reservation (owners can only see their own)
router.get('/:id',
  requirePermission('reservations', 'read'),
  requireOwnership('reservation'),
  ReservationController.findById
);

// Update reservation (owners can only update their own)
router.put('/:id',
  requirePermission('reservations', 'update'),
  requireOwnership('reservation'),
  ReservationController.update
);

// Only admin can delete reservations
router.delete('/:id',
  requirePermission('reservations', 'delete'),
  ReservationController.delete
);

// Get reservations by date range
router.get('/date-range/:start/:end',
  requirePermission('reservations', 'read'),
  ReservationController.findByDateRange
);

// Get my reservations
router.get('/my/reservations',
  requirePermission('reservations', 'read'),
  ReservationController.findMyReservations
);

export default router;
