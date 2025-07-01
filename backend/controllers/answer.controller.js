import AnswerModel from "../models/answer.model.js";

class AnswerController {
  async register(req, res) {
    try {
      const { survey_id, question_id, user_id, value } = req.body;

      if (!survey_id || !question_id || !value) {
        return res.status(400).json({
          success: false,
          error: "survey_id, question_id y value son obligatorios",
        });
      }

      const answerId = await AnswerModel.create({
        survey_id,
        question_id,
        user_id,
        value,
      });

      if (!answerId) {
        return res.status(500).json({
          success: false,
          error: "Error al guardar la respuesta",
        });
      }

      res.status(201).json({
        success: true,
        message: "Respuesta guardada exitosamente",
        data: { id: answerId },
      });
    } catch (error) {
      console.error("Error en AnswerController.register:", error.message);
      res
        .status(500)
        .json({ success: false, error: "Error interno del servidor" });
    }
  }

  async findBySurvey(req, res) {
    try {
      const { survey_id } = req.params;
      if (!survey_id) {
        return res
          .status(400)
          .json({ success: false, error: "survey_id requerido" });
      }

      const answers = await AnswerModel.findBySurvey(survey_id);

      res.status(200).json({
        success: true,
        data: answers,
        count: answers.length,
      });
    } catch (error) {
      console.error("Error en AnswerController.findBySurvey:", error.message);
      res
        .status(500)
        .json({ success: false, error: "Error interno del servidor" });
    }
  }

  async findByUser(req, res) {
    try {
      const { user_id } = req.params;
      if (!user_id) {
        return res
          .status(400)
          .json({ success: false, error: "user_id requerido" });
      }

      const answers = await AnswerModel.findByUser(user_id);

      res.status(200).json({
        success: true,
        data: answers,
        count: answers.length,
      });
    } catch (error) {
      console.error("Error en AnswerController.findByUser:", error.message);
      res
        .status(500)
        .json({ success: false, error: "Error interno del servidor" });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const success = await AnswerModel.delete(id);

      if (!success) {
        return res
          .status(404)
          .json({ success: false, error: "Respuesta no encontrada" });
      }

      res
        .status(200)
        .json({ success: true, message: "Respuesta eliminada exitosamente" });
    } catch (error) {
      console.error("Error en AnswerController.delete:", error.message);
      res
        .status(500)
        .json({ success: false, error: "Error interno del servidor" });
    }
  }
}

export default new AnswerController();
