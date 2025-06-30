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
}

export default new SurveyController();