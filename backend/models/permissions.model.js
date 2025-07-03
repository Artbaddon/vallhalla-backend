import { connect } from "../config/db/connectMysql.js";

class PermissionsModel {
  static async getUserPermissions(roleId) {
    try {
      const query = `
        SELECT DISTINCT 
          m.module_name,
          p.Permissions_name
        FROM module_role mr
        JOIN module m ON mr.Module_FK_ID = m.module_id
        JOIN permissions_module_role pmr ON pmr.Module_role_FK_ID = mr.Module_role_id
        JOIN permissions p ON pmr.Permissions_FK_ID = p.Permissions_id
        WHERE mr.Role_FK_ID = ?
      `;
      
      const [rows] = await connect.query(query, [roleId]);
      
      // Transform the flat results into a grouped structure
      const permissions = rows.reduce((acc, row) => {
        if (!acc[row.module_name]) {
          acc[row.module_name] = [];
        }
        acc[row.module_name].push(row.Permissions_name);
        return acc;
      }, {});
      
      return permissions;
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return null;
    }
  }

  static async checkPermission(roleId, moduleName, permissionName) {
    try {
      // Admin role (roleId = 1) has all permissions
      if (roleId === 1) {
        return true;
      }

      const query = `
        SELECT 1
        FROM module_role mr
        JOIN module m ON mr.Module_FK_ID = m.module_id
        JOIN permissions_module_role pmr ON pmr.Module_role_FK_ID = mr.Module_role_id
        JOIN permissions p ON pmr.Permissions_FK_ID = p.Permissions_id
        WHERE mr.Role_FK_ID = ?
        AND m.module_name = ?
        AND p.Permissions_name = ?
        LIMIT 1
      `;
      
      const [rows] = await connect.query(query, [roleId, moduleName, permissionName]);
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  static async getModulePermissions(moduleId) {
    try {
      const query = `
        SELECT DISTINCT p.Permissions_name
        FROM permissions_module_role pmr
        JOIN permissions p ON pmr.Permissions_FK_ID = p.Permissions_id
        JOIN module_role mr ON pmr.Module_role_FK_ID = mr.Module_role_id
        WHERE mr.Module_FK_ID = ?
      `;
      
      const [rows] = await connect.query(query, [moduleId]);
      return rows.map(row => row.Permissions_name);
    } catch (error) {
      console.error('Error getting module permissions:', error);
      return [];
    }
  }

  static async getRoleModules(roleId) {
    try {
      const query = `
        SELECT DISTINCT m.module_name
        FROM module_role mr
        JOIN module m ON mr.Module_FK_ID = m.module_id
        WHERE mr.Role_FK_ID = ?
      `;
      
      const [rows] = await connect.query(query, [roleId]);
      return rows.map(row => row.module_name);
    } catch (error) {
      console.error('Error getting role modules:', error);
      return [];
    }
  }

  static async getPermissions() {
    try {
      let sqlQuery = `SELECT * FROM permissions`;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
  static async create(permission) {
    try {
      let sqlQuery = `INSERT INTO permissions (Permissions_name) VALUES (?)`;
      const [result] = await connect.query(sqlQuery, [permission]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }
  static async update(id, { name }) {
    try {
      let sqlQuery = `UPDATE permissions SET Permissions_name = ? WHERE Permissions_id = ?`;
      const [result] = await connect.query(sqlQuery, [name, id]);
      return result.affectedRows;
    } catch (error) {
      return { error: error.message };
    }
  }
  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM permissions WHERE Permissions_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows;
    } catch (error) {
      return { error: error.message };
    }
  }
  static async findById(id) {
    try {
      let sqlQuery = `SELECT * FROM permissions WHERE Permissions_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]); 
      return result[0];
    } catch (error) {
      return { error: error.message };
    }
  }
  
}

export default PermissionsModel;
