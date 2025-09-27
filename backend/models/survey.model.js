import { connect } from "../config/db/connectMysql.js";

class SurveyModel {
  static async create({ title, status }) {
    try {
      const [result] = await connect.query(
        "INSERT INTO survey (title, status) VALUES (?, ?)",
        [title, status]
      );
      return result.insertId;
    } catch (error) {
      console.error("Error creating survey:", error.message);
      return null;
    }
  }

  static async show() {
    try {
      const [surveys] = await connect.query("SELECT * FROM survey");
      return surveys;
    } catch (error) {
      console.error("Error in SurveyModel.show:", error.message);
      return [];
    }
  }

  static async update(id, { title, status }) {
    try {
      const [result] = await connect.query(
        `UPDATE survey 
         SET 
           title = ?,
           status = ?,
           updatedAt = CURRENT_TIMESTAMP
         WHERE survey_id = ?`,
        [title, status, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error updating survey:", error.message);
      return false;
    }
  }

  static async delete(id) {
    try {
      const [result] = await connect.query(
        "DELETE FROM survey WHERE survey_id = ?",
        [id]
      );
      return result.affectedRows;
    } catch (error) {
      console.error("Error deleting survey:", error.message);
      return 0;
    }
  }

  static async findById(id) {
    try {
      const [result] = await connect.query(
        "SELECT * FROM survey WHERE survey_id = ?",
        [id]
      );
      return result[0] || null;
    } catch (error) {
      console.error("Error finding survey by ID:", error.message);
      return null;
    }
  }

  // New method to get questions for a specific survey
  static async getQuestions(surveyId) {
    try {
      const [questions] = await connect.query(
        `SELECT q.* 
         FROM question q
         WHERE q.survey_id = ?
         ORDER BY q.question_order ASC`,
        [surveyId]
      );
      return questions;
    } catch (error) {
      console.error("Error getting survey questions:", error.message);
      return [];
    }
  }

  // New method to submit an answer to a survey question
  static async submitAnswer({ survey_id, question_id, user_id, value }) {
    try {
      const [result] = await connect.query(
        `INSERT INTO answer 
         (survey_id, question_id, user_id, value, created_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [survey_id, question_id, user_id, value]
      );
      return result.insertId;
    } catch (error) {
      console.error("Error submitting answer:", error.message);
      return null;
    }
  }

  // New method to get surveys the user has already answered
  static async getAnsweredSurveys(userId) {
    try {
      const [surveys] = await connect.query(
        `SELECT DISTINCT s.* 
         FROM survey s
         JOIN answer a ON s.survey_id = a.survey_id
         WHERE a.user_id = ?`,
        [userId]
      );
      return surveys;
    } catch (error) {
      console.error("Error getting answered surveys:", error.message);
      return [];
    }
  }

  // New method to get surveys the user hasn't answered yet
  static async getPendingSurveys(userId) {
    try {
      const [surveys] = await connect.query(
        `SELECT s.*
         FROM survey s
         WHERE s.status = 'active'
         AND s.survey_id NOT IN (
           SELECT DISTINCT a.survey_id
           FROM answer a
           WHERE a.user_id = ?
         )`,
        [userId]
      );
      return surveys;
    } catch (error) {
      console.error("Error getting pending surveys:", error.message);
      return [];
    }
  }

  // New method to get survey statistics
  static async getStats() {
    try {
      // Get overall survey stats
      const [totalSurveys] = await connect.query(
        `SELECT COUNT(*) as total FROM survey`
      );
      
      // Get answer stats
      const [answerStats] = await connect.query(
        `SELECT 
           s.survey_id,
           s.title,
           COUNT(DISTINCT a.user_id) as total_respondents,
           COUNT(a.answer_id) as total_answers
         FROM survey s
         LEFT JOIN answer a ON s.survey_id = a.survey_id
         GROUP BY s.survey_id
         ORDER BY total_respondents DESC`
      );
      
      // Get question stats
      const [questionStats] = await connect.query(
        `SELECT 
           q.question_id,
           q.survey_id,
           q.question_text,
           COUNT(a.answer_id) as answer_count,
           AVG(CASE WHEN q.question_type = 'rating' THEN a.value END) as avg_rating
         FROM question q
         LEFT JOIN answer a ON q.question_id = a.question_id
         GROUP BY q.question_id`
      );
      
      return {
        total_surveys: totalSurveys[0].total,
        surveys: answerStats,
        questions: questionStats
      };
    } catch (error) {
      console.error("Error getting survey stats:", error.message);
      return null;
    }
  }

  static async createWithQuestions({ title, status, question }) {
    const connection = await connect.getConnection();
    try {
      await connection.beginTransaction();

      // Create the survey first
      const [surveyResult] = await connection.query(
        "INSERT INTO survey (title, status) VALUES (?, ?)",
        [title, status]
      );
      const surveyId = surveyResult.insertId;

      // Insert the initial question
      await connection.query(
        `INSERT INTO question 
         (survey_id, title, question_type_id, options)
         VALUES (?, ?, ?, ?)`,
        [surveyId, question.title, question.question_type_id, 
         question.options ? JSON.stringify(question.options) : null]
      );

      await connection.commit();
      return surveyId;
    } catch (error) {
      await connection.rollback();
      console.error("Error creating survey with question:", error.message);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async addQuestions(surveyId, questions) {
    const connection = await connect.getConnection();
    try {
      await connection.beginTransaction();

      // Insert additional questions
      for (const question of questions) {
        await connection.query(
          `INSERT INTO question 
           (survey_id, title, question_type_id, options)
           VALUES (?, ?, ?, ?)`,
          [surveyId, question.title, question.question_type_id, 
           question.options ? JSON.stringify(question.options) : null]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error("Error adding questions:", error.message);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async updateWithQuestions(id, { title, status, questions }) {
    const connection = await connect.getConnection();
    try {
      await connection.beginTransaction();

      // Update survey
      await connection.query(
        `UPDATE survey 
         SET 
           title = ?,
           status = ?,
           updatedAt = CURRENT_TIMESTAMP
         WHERE survey_id = ?`,
        [title, status, id]
      );

      // Delete existing questions
      await connection.query(
        "DELETE FROM question WHERE survey_id = ?",
        [id]
      );

      // Insert updated questions
      for (const question of questions) {
        await connection.query(
          `INSERT INTO question 
           (survey_id, title, question_type_id, options)
           VALUES (?, ?, ?, ?)`,
          [id, question.title, question.question_type_id, 
           question.options ? JSON.stringify(question.options) : null]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      console.error("Error updating survey with questions:", error.message);
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default SurveyModel;
