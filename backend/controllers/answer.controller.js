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

      const result = await AnswerModel.create({
        survey_id,
        question_id,
        user_id,
        value,
      });

      if (result.error) {
        if (result.error === "User already answered this question") {
          return res.status(409).json({
            success: false,
            error: "Ya has respondido esta pregunta anteriormente"
          });
        }
        return res.status(500).json({
          success: false,
          error: "Error al guardar la respuesta"
        });
      }

      res.status(201).json({
        success: true,
        message: "Respuesta guardada exitosamente",
        data: { id: result.id },
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
      if (answers.length === 0) {
        return res.status(404).json({ error: "Answers not found" });
      }
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
      if (answers.length === 0) {
        return res.status(404).json({ error: "Answers not found" });
      }
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

  // New method to get all answers
  async getAll(req, res) {
    try {
      const answers = await AnswerModel.getAll();
      
      if (!answers) {
        return res.status(500).json({
          success: false,
          error: "Error retrieving answers"
        });
      }
      
      res.status(200).json({
        success: true,
        message: "Answers retrieved successfully",
        data: answers,
        count: answers.length
      });
    } catch (error) {
      console.error("Error in getAll:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while retrieving answers"
      });
    }
  }

  // New method to get a specific answer by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Answer ID is required"
        });
      }
      
      const answer = await AnswerModel.findById(id);
      
      if (!answer) {
        return res.status(404).json({
          success: false,
          error: "Answer not found"
        });
      }
      
      res.status(200).json({
        success: true,
        message: "Answer retrieved successfully",
        data: answer
      });
    } catch (error) {
      console.error("Error in getById:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while retrieving answer"
      });
    }
  }

  // New method to get answers from the current user
  async getMyAnswers(req, res) {
    try {
      const userId = req.user.userId;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "User ID is required"
        });
      }
      
      const answers = await AnswerModel.findByUser(userId);
      
      res.status(200).json({
        success: true,
        message: "User answers retrieved successfully",
        data: answers,
        count: answers.length
      });
    } catch (error) {
      console.error("Error in getMyAnswers:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while retrieving user answers"
      });
    }
  }

  // New method to get answer statistics
  async getStats(req, res) {
    try {
      // You may need to add this method to your model
      const stats = await AnswerModel.getStats();
      
      if (!stats) {
        return res.status(500).json({
          success: false,
          error: "Failed to retrieve answer statistics"
        });
      }
      
      res.status(200).json({
        success: true,
        message: "Answer statistics retrieved successfully",
        data: stats
      });
    } catch (error) {
      console.error("Error in getStats:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while retrieving answer statistics"
      });
    }
  }
}

export default new AnswerController();
