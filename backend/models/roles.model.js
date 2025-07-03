import { connect } from "../config/db/connectMysql.js";

class RoleModel {
  static async create({ name, description }) {
    try {
      let sqlQuery = `INSERT INTO role (Role_name, Role_description) VALUES (?, ?)`;
      const [result] = await connect.query(sqlQuery, [name, description]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT Role_id as id, Role_name as name, Role_description as description FROM role ORDER BY Role_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async update(id, { name, description }) {
    try {
      let sqlQuery = "UPDATE role SET Role_name = ?, Role_description = ? WHERE Role_id = ?";
      const [result] = await connect.query(sqlQuery, [name, description, id]);
      if (result.affectedRows === 0) {
        return { error: "Role not found" };
      }
      return result.affectedRows;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async delete(id) {
    try {
      // First check if role has any module_role associations
      let checkQuery = `SELECT Module_role_id FROM module_role WHERE Role_FK_ID = ? LIMIT 1`;
      const [associations] = await connect.query(checkQuery, [id]);
      
      if (associations.length > 0) {
        return { error: "Cannot delete role: it has associated module permissions" };
      }

      let sqlQuery = `DELETE FROM role WHERE Role_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);

      if (result.affectedRows === 0) {
        return { error: "Role not found" };
      }
      return result.affectedRows;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = `
        SELECT 
          Role_id as id, 
          Role_name as name, 
          Role_description as description 
        FROM role 
        WHERE Role_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0];
    } catch (error) {
      return { error: error.message };
    }
  }

  // New method to check if a role exists
  static async exists(id) {
    try {
      let sqlQuery = `SELECT 1 FROM role WHERE Role_id = ? LIMIT 1`;
      const [result] = await connect.query(sqlQuery, [id]);
      return result.length > 0;
    } catch (error) {
      return false;
    }
  }
}

export default RoleModel;
