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
}

export default SurveyModel;
