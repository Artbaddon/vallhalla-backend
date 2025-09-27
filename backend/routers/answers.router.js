import { Router } from "express";
import AnswerController from "../controllers/answer.controller.js";
import { requirePermission, requireOwnership } from "../middleware/permissionMiddleware.js";

const router = Router();

// Protected routes
// Admin can see all answers
router.get('/', 
  requirePermission('surveys', 'read'),
  AnswerController.getAll
);

// Submit an answer
router.post('/',
  requirePermission('surveys', 'create'),
  AnswerController.register
);

// View specific answer (owners can only see their own)
router.get('/:id',
  requirePermission('surveys', 'read'),
  requireOwnership('answer'),
  AnswerController.getById
);

// Get answers by survey
router.get('/survey/:survey_id',
  requirePermission('surveys', 'read'),
  AnswerController.findBySurvey
);

// Get answers by user
router.get('/user/:user_id',
  requirePermission('surveys', 'read'),
  AnswerController.findByUser
);

// Get my answers
router.get('/my/answers',
  requirePermission('surveys', 'read'),
  AnswerController.getMyAnswers
);

// Get answers statistics (admin only)
router.get('/stats/overview',
  requirePermission('surveys', 'read'),
  AnswerController.getStats
);

// Only admin can delete answers
router.delete('/:id',
  requirePermission('surveys', 'delete'),
  AnswerController.delete
);

export default router;