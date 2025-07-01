import { Router } from "express";
import QuestionController from "../controllers/question.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { ROLES } from "../middleware/rbacConfig.js";

const router = Router();
const base = "/question";

router.route(base)
  .post(authMiddleware([ROLES.ADMIN, ROLES.OWNER]), QuestionController.register); // Crear pregunta

router.route(`${base}/bySurvey/:survey_id`)
  .get(authMiddleware([ROLES.ADMIN, ROLES.OWNER]), QuestionController.findBySurvey); // Listar preguntas por encuesta

router.route(`${base}/:id`)
  .get(authMiddleware([ROLES.ADMIN, ROLES.OWNER]), QuestionController.findById)     // Obtener pregunta por ID
  .put(authMiddleware([ROLES.ADMIN, ROLES.OWNER]), QuestionController.update)       // Actualizar pregunta
  .delete(authMiddleware([ROLES.ADMIN, ROLES.OWNER]), QuestionController.delete);   // Eliminar pregunta

export default router;