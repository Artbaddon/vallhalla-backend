import { Router } from "express";
import SurveyController from "../controllers/survey.controller.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = Router();

// Public routes (if any)

// Protected routes
// Everyone can see all surveys (but must be authenticated)
router.get(
  "/",
  verifyToken,
  requirePermission("surveys", "read"),
  SurveyController.show
);

// Create survey with initial question (admin only)
// Expected body format:
// {
//   title: string,
//   status: string,
//   question: {
//     title: string,
//     question_type_id: number,
//     options?: any // For multiple choice questions
//   }
// }
router.post(
  "/",
  verifyToken,
  requirePermission("surveys", "create"),
  SurveyController.createWithQuestions
);

// Everyone can view specific surveys (but must be authenticated)
router.get(
  "/:id",
  verifyToken,
  requirePermission("surveys", "read"),
  SurveyController.findById
);

// Only admin can update survey details
router.put(
  "/:id",
  verifyToken,
  requirePermission("surveys", "update"),
  SurveyController.update
);

// Only admin can delete surveys (this will also delete related questions and answers)
router.delete(
  "/:id",
  verifyToken,
  requirePermission("surveys", "delete"),
  SurveyController.delete
);

// Everyone can get survey questions (but must be authenticated)
router.get(
  "/:id/questions",
  verifyToken,
  requirePermission("surveys", "read"),
  SurveyController.getQuestions
);

// Everyone can submit survey answers (but must be authenticated)
// Expected body format:
// {
//   answers: [
//     {
//       question_id: number,
//       value: string | number | boolean // depends on question type
//     }
//   ]
// }
router.post(
  "/:id/answer",
  verifyToken,
  requirePermission("surveys", "create"),
  SurveyController.submitAnswer
);

// Get my answered surveys (authenticated user's own data)
router.get(
  "/my/answered",
  verifyToken,
  requirePermission("surveys", "read"),
  SurveyController.getMyAnsweredSurveys
);

// Get surveys I haven't answered yet (authenticated user's own data)
router.get(
  "/my/pending",
  verifyToken,
  requirePermission("surveys", "read"),
  SurveyController.getMyPendingSurveys
);

// Get survey statistics (admin only)
router.get(
  "/stats/overview",
  verifyToken,
  requirePermission("surveys", "manage"),
  SurveyController.getStats
);

export default router;
