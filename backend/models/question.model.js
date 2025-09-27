import { connect } from "../config/db/connectMysql.js";

class QuestionModel {
  static async create({ survey_id, title, question_type_id, options }) {
    try {
      const [result] = await connect.query(
        `INSERT INTO question (survey_id, title, question_type_id, options)
         VALUES (?, ?, ?, ?)`,
        [survey_id, title, question_type_id, options]
      );
      return result.insertId;
    } catch (error) {
      console.error("Error creating question:", error.message);
      return null;
    }
  }

  static async findBySurvey(survey_id) {
    try {
      const [questions] = await connect.query(
        `SELECT * FROM question WHERE survey_id = ?`,
        [survey_id]
      );
      return questions;
    } catch (error) {
      console.error("Error fetching questions by survey:", error.message);
      return [];
    }
  }

  static async update(id, { title, question_type_id, options }) {
    try {
      const [result] = await connect.query(
        `UPDATE question 
         SET title = ?, question_type_id = ?, options = ?, updatedAt = CURRENT_TIMESTAMP
         WHERE question_id = ?`,
        [title, question_type_id, options, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error updating question:", error.message);
      return false;
    }
  }

  static async delete(id) {
    try {
      const [result] = await connect.query(
        `DELETE FROM question WHERE question_id = ?`,
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error deleting question:", error.message);
      return false;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await connect.query(
        `SELECT * FROM question WHERE question_id = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Error finding question by ID:", error.message);
      return null;
    }
  }
}

export default QuestionModel;