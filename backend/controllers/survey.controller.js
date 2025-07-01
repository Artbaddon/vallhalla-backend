import SurveyModel from "../models/survey.model.js";
import dotenv from "dotenv";
dotenv.config();

class SurveyController {
  async register(req, res) {
    try {
      const { title, status } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          error: "El título de la encuesta es requerido",
        });
      }

      const surveyId = await SurveyModel.create({ title, status });

      if (!surveyId) {
        return res.status(500).json({
          success: false,
          error: "Error al crear la encuesta",
        });
      }

      res.status(201).json({
        success: true,
        message: "Encuesta creada exitosamente",
        data: { id: surveyId },
      });
    } catch (error) {
      console.error("Error en register survey:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error interno del servidor",
      });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, status } = req.body;

      if (!title && !status) {
        return res.status(400).json({
          success: false,
          error: "Debe proporcionar al menos un campo para actualizar",
        });
      }

      const existingSurvey = await SurveyModel.findById(id);
      if (!existingSurvey) {
        return res.status(404).json({
          success: false,
          error: "Encuesta no encontrada",
        });
      }

      const updateResult = await SurveyModel.update(id, { title, status });

      if (!updateResult) {
        return res.status(400).json({
          success: false,
          error: "No se realizaron cambios en la encuesta",
        });
      }

      res.status(200).json({
        success: true,
        message: "Encuesta actualizada exitosamente",
        data: { id },
      });
    } catch (error) {
      console.error("Error en update survey:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor al actualizar encuesta",
      });
    }
  }

  async show(req, res) {
    try {
      const surveys = await SurveyModel.show();

      res.status(200).json({
        success: true,
        message: "Lista de encuestas obtenida exitosamente",
        data: surveys,
        count: surveys.length,
      });
    } catch (error) {
      console.error("Error en show surveys:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor al obtener encuestas",
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "El ID es requerido" });
      }

      const deleteResult = await SurveyModel.delete(id);

      if (!deleteResult) {
        return res.status(404).json({
          success: false,
          error: "Encuesta no encontrada o ya eliminada",
        });
      }

      res.status(200).json({
        success: true,
        message: "Encuesta eliminada exitosamente",
        data: { id },
      });
    } catch (error) {
      console.error("Error en delete survey:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  async findById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: "El ID es requerido" });
      }

      const survey = await SurveyModel.findById(id);

      if (!survey) {
        return res.status(404).json({
          success: false,
          error: "Encuesta no encontrada",
        });
      }

      res.status(200).json({
        success: true,
        message: "Encuesta obtenida exitosamente",
        data: survey,
      });
    } catch (error) {
      console.error("Error en findById survey:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }

  // New method to get questions for a specific survey
  async getQuestions(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ 
          success: false,
          error: "Survey ID is required" 
        });
      }

      // You may need to add this method to your model
      const questions = await SurveyModel.getQuestions(id);

      if (!questions) {
        return res.status(404).json({
          success: false,
          error: "No questions found for this survey"
        });
      }

      res.status(200).json({
        success: true,
        message: "Survey questions retrieved successfully",
        data: questions,
        count: questions.length
      });
    } catch (error) {
      console.error("Error in getQuestions:", error);
      res.status(500).json({ 
        success: false,
        error: "Internal server error while retrieving survey questions" 
      });
    }
  }

  // New method to submit an answer to a survey question
  async submitAnswer(req, res) {
    try {
      const { id } = req.params;
      const { question_id, answer_value } = req.body;
      const userId = req.user.userId;

      if (!id || !question_id || !answer_value) {
        return res.status(400).json({
          success: false,
          error: "Survey ID, question ID, and answer value are required"
        });
      }

      // You may need to add this method to your model
      const answerResult = await SurveyModel.submitAnswer({
        survey_id: id,
        question_id,
        user_id: userId,
        value: answer_value
      });

      if (!answerResult) {
        return res.status(500).json({
          success: false,
          error: "Failed to submit answer"
        });
      }

      res.status(201).json({
        success: true,
        message: "Answer submitted successfully",
        data: answerResult
      });
    } catch (error) {
      console.error("Error in submitAnswer:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while submitting answer"
      });
    }
  }

  // New method to get surveys the user has already answered
  async getMyAnsweredSurveys(req, res) {
    try {
      const userId = req.user.userId;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "User ID is required"
        });
      }

      // You may need to add this method to your model
      const answeredSurveys = await SurveyModel.getAnsweredSurveys(userId);

      if (!answeredSurveys) {
        return res.status(404).json({
          success: false,
          error: "No answered surveys found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Answered surveys retrieved successfully",
        data: answeredSurveys,
        count: answeredSurveys.length
      });
    } catch (error) {
      console.error("Error in getMyAnsweredSurveys:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while retrieving answered surveys"
      });
    }
  }

  // New method to get surveys the user hasn't answered yet
  async getMyPendingSurveys(req, res) {
    try {
      const userId = req.user.userId;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "User ID is required"
        });
      }

      // You may need to add this method to your model
      const pendingSurveys = await SurveyModel.getPendingSurveys(userId);

      if (!pendingSurveys) {
        return res.status(404).json({
          success: false,
          error: "No pending surveys found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Pending surveys retrieved successfully",
        data: pendingSurveys,
        count: pendingSurveys.length
      });
    } catch (error) {
      console.error("Error in getMyPendingSurveys:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while retrieving pending surveys"
      });
    }
  }

  // New method to get survey statistics
  async getStats(req, res) {
    try {
      // You may need to add this method to your model
      const stats = await SurveyModel.getStats();

      if (!stats) {
        return res.status(500).json({
          success: false,
          error: "Failed to retrieve survey statistics"
        });
      }

      res.status(200).json({
        success: true,
        message: "Survey statistics retrieved successfully",
        data: stats
      });
    } catch (error) {
      console.error("Error in getStats:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while retrieving survey statistics"
      });
    }
  }
}

export default new SurveyController();