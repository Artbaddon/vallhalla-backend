import QuestionModel from "../models/question.model.js";

class QuestionController {
  async register(req, res) {
    try {
      const { survey_id, title, question_type_id, options } = req.body;

      if (!survey_id || !title || !question_type_id) {
        return res.status(400).json({
          success: false,
          error:
            "Faltan campos requeridos (survey_id, title, question_type_id)",
        });
      }

      const questionId = await QuestionModel.create({
        survey_id,
        title,
        question_type_id,
        options: options ? JSON.stringify(options) : null,
      });

      if (!questionId) {
        return res.status(500).json({
          success: false,
          error: "Error al crear la pregunta",
        });
      }

      res.status(201).json({
        success: true,
        message: "Pregunta creada exitosamente",
        data: { id: questionId },
      });
    } catch (error) {
      console.error("Error en QuestionController.register:", error.message);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
      });
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

      const questions = await QuestionModel.findBySurvey(survey_id);

      res.status(200).json({
        success: true,
        data: questions,
        count: questions.length,
      });
    } catch (error) {
      console.error("Error en QuestionController.findBySurvey:", error.message);
      res
        .status(500)
        .json({ success: false, error: "Error interno del servidor" });
    }
  }

  async findById(req, res) {
    try {
      const { id } = req.params;

      const question = await QuestionModel.findById(id);

      if (!question) {
        return res
          .status(404)
          .json({ success: false, error: "Pregunta no encontrada" });
      }

      res.status(200).json({
        success: true,
        data: question,
      });
    } catch (error) {
      console.error("Error en QuestionController.findById:", error.message);
      res
        .status(500)
        .json({ success: false, error: "Error interno del servidor" });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, question_type_id, options } = req.body;

      const success = await QuestionModel.update(id, {
        title,
        question_type_id,
        options: options ? JSON.stringify(options) : null,
      });

      if (!success) {
        return res.status(400).json({
          success: false,
          error: "No se pudo actualizar la pregunta",
        });
      }

      res.status(200).json({
        success: true,
        message: "Pregunta actualizada con éxito",
      });
    } catch (error) {
      console.error("Error en QuestionController.update:", error.message);
      res
        .status(500)
        .json({ success: false, error: "Error interno del servidor" });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const success = await QuestionModel.delete(id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: "Pregunta no encontrada o ya eliminada",
        });
      }

      res.status(200).json({
        success: true,
        message: "Pregunta eliminada con éxito",
      });
    } catch (error) {
      console.error("Error en QuestionController.delete:", error.message);
      res
        .status(500)
        .json({ success: false, error: "Error interno del servidor" });
    }
  }
}

export default new QuestionController();
