import { Router } from "express";
import QuestionController from "../controllers/question.controller.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = Router();

// Protected routes
router.route("/")
  .post(requirePermission("questions", "create"), QuestionController.register); // Create question

router.route("/survey/:survey_id")
  .get(requirePermission("questions", "read"), QuestionController.findBySurvey); // List questions by survey

router.route("/:id")
  .get(requirePermission("questions", "read"), QuestionController.findById)     // Get question by ID
  .put(requirePermission("questions", "update"), QuestionController.update)     // Update question
  .delete(requirePermission("questions", "delete"), QuestionController.delete); // Delete question

export default router;