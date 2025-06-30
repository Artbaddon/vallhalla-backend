import { Router } from "express";
import QuestionController from "../controllers/question.controller.js";

const router = Router();
const base = "/question";

router.route(base)
  .post(QuestionController.register); // Crear pregunta

router.route(`${base}/bySurvey/:survey_id`)
  .get(QuestionController.findBySurvey); // Listar preguntas por encuesta

router.route(`${base}/:id`)
  .get(QuestionController.findById)     // Obtener pregunta por ID
  .put(QuestionController.update)       // Actualizar pregunta
  .delete(QuestionController.delete);   // Eliminar pregunta

export default router;
