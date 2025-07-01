import { Router } from "express";
import SurveyController from "../controllers/survey.controller.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = Router();

// Public routes (if any)

// Protected routes
// Everyone can see all surveys
router.get("/", 
  requirePermission("surveys", "read"),
  SurveyController.show
);

// Only admin can create surveys
router.post("/",
  requirePermission("surveys", "create"),
  SurveyController.register
);

// Everyone can view specific surveys
router.get("/:id",
  requirePermission("surveys", "read"),
  SurveyController.findById
);

// Only admin can update surveys
router.put("/:id",
  requirePermission("surveys", "update"),
  SurveyController.update
);

// Only admin can delete surveys
router.delete("/:id",
  requirePermission("surveys", "delete"),
  SurveyController.delete
);

// Everyone can get survey questions
router.get("/:id/questions",
  requirePermission("surveys", "read"),
  SurveyController.getQuestions
);

// Everyone can submit survey answers
router.post("/:id/answer",
  requirePermission("surveys", "create"),
  SurveyController.submitAnswer
);

// Get my answered surveys
router.get("/my/answered",
  requirePermission("surveys", "read"),
  SurveyController.getMyAnsweredSurveys
);

// Get surveys I haven't answered yet
router.get("/my/pending",
  requirePermission("surveys", "read"),
  SurveyController.getMyPendingSurveys
);

// Get survey statistics (admin only)
router.get("/stats/overview",
  requirePermission("surveys", "read"),
  SurveyController.getStats
);

export default router;