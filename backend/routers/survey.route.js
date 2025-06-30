import { Router } from "express";
import SurveyController from "../controllers/survey.controller.js";

const router = Router();
const name = "/survey";

// Define all routes
router.route(name)
  .post(SurveyController.register)  // Crear encuesta
  .get(SurveyController.show);      // Listar todas las encuestas

router.route(`${name}/:id`)
  .get(SurveyController.findById)  // Obtener encuesta por ID
  .put(SurveyController.update)    // Actualizar encuesta
  .delete(SurveyController.delete); // Eliminar encuesta

export default router;