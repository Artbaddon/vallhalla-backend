import { connect } from "../config/db/connectMysql.js";

class AnswerModel {
  static async hasExistingAnswer(survey_id, question_id, user_id) {
    try {
      const [rows] = await connect.query(
        `SELECT COUNT(*) as count 
         FROM answer 
         WHERE survey_id = ? AND question_id = ? AND user_id = ?`,
        [survey_id, question_id, user_id]
      );
      return rows[0].count > 0;
    } catch (error) {
      console.error("Error checking existing answer:", error.message);
      return false;
    }
  }

  static async create({ survey_id, question_id, user_id = null, value }) {
    try {
      // Check for existing answer if user_id is provided
      if (user_id) {
        const hasExisting = await this.hasExistingAnswer(survey_id, question_id, user_id);
        if (hasExisting) {
          return { error: "User already answered this question" };
        }
      }

      const [result] = await connect.query(
        `INSERT INTO answer (survey_id, question_id, user_id, value) VALUES (?, ?, ?, ?)`,
        [survey_id, question_id, user_id, value]
      );
      return { id: result.insertId };
    } catch (error) {
      console.error("Error creating answer:", error.message);
      return { error: error.message };
    }
  }

  static async findBySurvey(survey_id) {
    try {
      const [rows] = await connect.query(
        `SELECT * FROM answer WHERE survey_id = ?`,
        [survey_id]
      );
      return rows;
    } catch (error) {
      console.error("Error fetching answers by survey:", error.message);
      return [];
    }
  }

  static async findByUser(user_id) {
    try {
      const [rows] = await connect.query(
        `SELECT * FROM answer WHERE user_id = ?`,
        [user_id]
      );
      return rows;
    } catch (error) {
      console.error("Error fetching answers by user:", error.message);
      return [];
    }
  }

  static async delete(id) {
    try {
      const [result] = await connect.query(
        `DELETE FROM answer WHERE answer_id = ?`,
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error deleting answer:", error.message);
      return false;
    }
  }

  // New method to get all answers
  static async getAll() {
    try {
      const [rows] = await connect.query(`
        SELECT a.*, 
               s.title as survey_title, 
               q.question_text,
               u.Users_name as user_name
        FROM answer a
        LEFT JOIN survey s ON a.survey_id = s.survey_id
        LEFT JOIN question q ON a.question_id = q.question_id
        LEFT JOIN users u ON a.user_id = u.Users_id
        ORDER BY a.created_at DESC
      `);
      return rows;
    } catch (error) {
      console.error("Error fetching all answers:", error.message);
      return [];
    }
  }

  // New method to find answer by ID
  static async findById(id) {
    try {
      const [rows] = await connect.query(
        `SELECT a.*, 
                s.title as survey_title, 
                q.question_text,
                u.Users_name as user_name
         FROM answer a
         LEFT JOIN survey s ON a.survey_id = s.survey_id
         LEFT JOIN question q ON a.question_id = q.question_id
         LEFT JOIN users u ON a.user_id = u.Users_id
         WHERE a.answer_id = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Error fetching answer by ID:", error.message);
      return null;
    }
  }

  // New method to get answer statistics
  static async getStats() {
    try {
      // Get total answers
      const [totalAnswers] = await connect.query(
        `SELECT COUNT(*) as total FROM answer`
      );
      
      // Get answers per survey
      const [surveyStats] = await connect.query(
        `SELECT 
           s.survey_id,
           s.title,
           COUNT(a.answer_id) as answer_count
         FROM survey s
         LEFT JOIN answer a ON s.survey_id = a.survey_id
         GROUP BY s.survey_id
         ORDER BY answer_count DESC`
      );
      
      // Get answers per question type
      const [questionTypeStats] = await connect.query(
        `SELECT 
           q.question_type,
           COUNT(a.answer_id) as answer_count
         FROM question q
         LEFT JOIN answer a ON q.question_id = a.question_id
         GROUP BY q.question_type`
      );
      
      // Get answers per user (top 10)
      const [userStats] = await connect.query(
        `SELECT 
           u.Users_id,
           u.Users_name,
           COUNT(a.answer_id) as answer_count
         FROM users u
         JOIN answer a ON u.Users_id = a.user_id
         GROUP BY u.Users_id
         ORDER BY answer_count DESC
         LIMIT 10`
      );
      
      return {
        total_answers: totalAnswers[0].total,
        surveys: surveyStats,
        question_types: questionTypeStats,
        top_users: userStats
      };
    } catch (error) {
      console.error("Error getting answer stats:", error.message);
      return null;
    }
  }
}

export default AnswerModel;
