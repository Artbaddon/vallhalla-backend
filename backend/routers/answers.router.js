import { Router } from "express";
import AnswerController from "../controllers/answer.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { ROLES } from "../middleware/rbacConfig.js";

const router = Router();
const base = "/answer";

router.route(base)
  .post(authMiddleware([ROLES.ADMIN, ROLES.OWNER]), AnswerController.register);          // Crear respuesta

router.route(`${base}/bySurvey/:survey_id`)
  .get(authMiddleware([ROLES.ADMIN, ROLES.OWNER]), AnswerController.findBySurvey);       // Obtener respuestas por encuesta

router.route(`${base}/byUser/:user_id`)
  .get(authMiddleware([ROLES.ADMIN, ROLES.OWNER]), AnswerController.findByUser);         // Obtener respuestas por usuario

router.route(`${base}/:id`)
  .delete(authMiddleware([ROLES.ADMIN, ROLES.OWNER]), AnswerController.delete);           // Eliminar respuesta

export default router;