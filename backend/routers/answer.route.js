import { Router } from "express";
import AnswerController from "../controllers/answer.controller.js";

const router = Router();
const base = "/answer";

router.route(base)
  .post(AnswerController.register);          // Crear respuesta

router.route(`${base}/bySurvey/:survey_id`)
  .get(AnswerController.findBySurvey);       // Obtener respuestas por encuesta

router.route(`${base}/byUser/:user_id`)
  .get(AnswerController.findByUser);         // Obtener respuestas por usuario

router.route(`${base}/:id`)
  .delete(AnswerController.delete);           // Eliminar respuesta

export default router;
