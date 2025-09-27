import SurveyModel from "../models/survey.model.js";
import dotenv from "dotenv";
dotenv.config();

class SurveyController {
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

  // Get questions for a specific survey
  async getQuestions(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Survey ID is required",
        });
      }

      const questions = await SurveyModel.getQuestions(id);

      if (!questions) {
        return res.status(404).json({
          success: false,
          error: "No questions found for this survey",
        });
      }

      res.status(200).json({
        success: true,
        message: "Survey questions retrieved successfully",
        data: questions,
        count: questions.length,
      });
    } catch (error) {
      console.error("Error in getQuestions:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while retrieving survey questions",
      });
    }
  }

  // Submit answers to survey questions
  async submitAnswer(req, res) {
    try {
      const { id } = req.params;
      const { answers } = req.body;
      const userId = req.user.userId;

      if (!id || !answers || !Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Survey ID and answers array are required",
        });
      }

      // Validate each answer
      for (const answer of answers) {
        if (!answer.question_id || answer.value === undefined) {
          return res.status(400).json({
            success: false,
            error: "Each answer must have question_id and value",
          });
        }
      }

      // Submit all answers in a transaction
      const results = await Promise.all(
        answers.map((answer) =>
          SurveyModel.submitAnswer({
            survey_id: id,
            question_id: answer.question_id,
            user_id: userId,
            value: answer.value,
          })
        )
      );

      if (results.some((result) => !result)) {
        return res.status(500).json({
          success: false,
          error: "Failed to submit some answers",
        });
      }

      res.status(201).json({
        success: true,
        message: "Answers submitted successfully",
        data: { answersSubmitted: results.length },
      });
    } catch (error) {
      console.error("Error in submitAnswer:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while submitting answers",
      });
    }
  }

  // Get surveys the user has already answered
  async getMyAnsweredSurveys(req, res) {
    try {
      const userId = req.user.userId;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "User ID is required",
        });
      }

      const answeredSurveys = await SurveyModel.getAnsweredSurveys(userId);

      if (!answeredSurveys) {
        return res.status(404).json({
          success: false,
          error: "No answered surveys found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Answered surveys retrieved successfully",
        data: answeredSurveys,
        count: answeredSurveys.length,
      });
    } catch (error) {
      console.error("Error in getMyAnsweredSurveys:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while retrieving answered surveys",
      });
    }
  }

  // Get surveys the user hasn't answered yet
  async getMyPendingSurveys(req, res) {
    try {
      const userId = req.user.userId;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "User ID is required",
        });
      }

      const pendingSurveys = await SurveyModel.getPendingSurveys(userId);

      if (!pendingSurveys) {
        return res.status(404).json({
          success: false,
          error: "No pending surveys found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Pending surveys retrieved successfully",
        data: pendingSurveys,
        count: pendingSurveys.length,
      });
    } catch (error) {
      console.error("Error in getMyPendingSurveys:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while retrieving pending surveys",
      });
    }
  }

  // Get survey statistics
  async getStats(req, res) {
    try {
      const stats = await SurveyModel.getStats();

      if (!stats) {
        return res.status(500).json({
          success: false,
          error: "Failed to retrieve survey statistics",
        });
      }

      res.status(200).json({
        success: true,
        message: "Survey statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      console.error("Error in getStats:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while retrieving survey statistics",
      });
    }
  }

  // Create a new survey with initial question
  async createWithQuestions(req, res) {
    try {
      const { title, status, question } = req.body;

      // Validate required fields
      if (!title) {
        return res.status(400).json({
          success: false,
          error: "El título de la encuesta es requerido",
        });
      }

      if (!question || !question.title || !question.question_type_id) {
        return res.status(400).json({
          success: false,
          error: "Se requiere una pregunta inicial con título y tipo",
        });
      }

      const surveyId = await SurveyModel.createWithQuestions({
        title,
        status: status || "active",
        question,
      });

      res.status(201).json({
        success: true,
        message: "Encuesta creada exitosamente con pregunta inicial",
        data: { surveyId, title, status, question },
      });
    } catch (error) {
      console.error("Error en createWithQuestions survey:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error interno del servidor",
      });
    }
  }

  // Update survey details (title and status only)
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

      const updateResult = await SurveyModel.update(id, { 
        title: title || existingSurvey.title,
        status: status || existingSurvey.status,
      });

      if (!updateResult) {
        return res.status(400).json({
          success: false,
          error: "No se realizaron cambios en la encuesta",
        });
      }

      res.status(200).json({
        success: true,
        message: "Encuesta actualizada exitosamente",
        data: { 
          id,
          title: title || existingSurvey.title,
          status: status || existingSurvey.status,
        },
      });
    } catch (error) {
      console.error("Error en update survey:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor al actualizar encuesta",
      });
    }
  }
}

export default new SurveyController();
