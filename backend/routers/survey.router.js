import { Router } from "express";
import SurveyController from "../controllers/survey.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { ROLES } from "../middleware/rbacConfig.js";

const router = Router();
const name = "/survey";

// Define all routes
router.route(name)
  .post(authMiddleware([ROLES.ADMIN, ROLES.OWNER]), SurveyController.register)  // Crear encuesta
  .get(authMiddleware([ROLES.ADMIN, ROLES.OWNER]), SurveyController.show);      // Listar todas las encuestas

router.route(`${name}/:id`)
  .get(authMiddleware([ROLES.ADMIN, ROLES.OWNER]), SurveyController.findById)  // Obtener encuesta por ID
  .put(authMiddleware([ROLES.ADMIN, ROLES.OWNER]), SurveyController.update)    // Actualizar encuesta
  .delete(authMiddleware([ROLES.ADMIN, ROLES.OWNER]), SurveyController.delete); // Eliminar encuesta

export default router;