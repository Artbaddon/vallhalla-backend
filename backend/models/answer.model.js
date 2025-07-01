import { connect } from "../config/db/connectMysql.js";

class AnswerModel {
  static async create({ survey_id, question_id, user_id = null, value }) {
    try {
      const [result] = await connect.query(
        `INSERT INTO answer (survey_id, question_id, user_id, value) VALUES (?, ?, ?, ?)`,
        [survey_id, question_id, user_id, value]
      );
      return result.insertId;
    } catch (error) {
      console.error("Error creating answer:", error.message);
      return null;
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
}

export default AnswerModel;
