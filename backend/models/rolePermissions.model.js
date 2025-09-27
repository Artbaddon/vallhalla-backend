import { connect } from "../config/db/connectMysql.js";

class RolePermissionModel {
  static async create({ roleId, permissionId, moduleId }) {
    try {
      // First create or get the module_role entry
      let moduleRoleQuery = `
        SELECT Module_role_id 
        FROM module_role 
        WHERE Role_FK_ID = ? AND Module_FK_ID = ?
      `;
      const [moduleRoleResult] = await connect.query(moduleRoleQuery, [roleId, moduleId]);
      
      let moduleRoleId;
      if (moduleRoleResult.length > 0) {
        moduleRoleId = moduleRoleResult[0].Module_role_id;
      } else {
        // Create new module_role entry
        const [newModuleRole] = await connect.query(
          'INSERT INTO module_role (Role_FK_ID, Module_FK_ID) VALUES (?, ?)',
          [roleId, moduleId]
        );
        moduleRoleId = newModuleRole.insertId;
      }

      // Check if this permission is already assigned
      const [existingPermission] = await connect.query(
        'SELECT Permissions_module_role_id FROM permissions_module_role WHERE Module_role_FK_ID = ? AND Permissions_FK_ID = ?',
        [moduleRoleId, permissionId]
      );

      if (existingPermission.length > 0) {
        return { error: "This permission is already assigned to this role for this module" };
      }

      // Create the permissions_module_role entry
      let sqlQuery = `
        INSERT INTO permissions_module_role 
        (Module_role_FK_ID, Permissions_FK_ID) 
        VALUES (?, ?)
      `;
      const [result] = await connect.query(sqlQuery, [moduleRoleId, permissionId]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async show() {
    try {
      let sqlQuery = `
        SELECT 
          pmr.Permissions_module_role_id as id,
          r.Role_id as role_id,
          r.Role_name,
          p.Permissions_id as permission_id,
          p.Permissions_name,
          m.module_id,
          m.module_name
        FROM permissions_module_role pmr
        JOIN module_role mr ON pmr.Module_role_FK_ID = mr.Module_role_id
        JOIN role r ON mr.Role_FK_ID = r.Role_id
        JOIN permissions p ON pmr.Permissions_FK_ID = p.Permissions_id
        JOIN module m ON mr.Module_FK_ID = m.module_id
        ORDER BY r.Role_id, m.module_id, p.Permissions_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async update(id, { roleId, permissionId, moduleId }) {
    try {
      // First get or create the module_role for the new combination
      let moduleRoleQuery = `
        SELECT Module_role_id 
        FROM module_role 
        WHERE Role_FK_ID = ? AND Module_FK_ID = ?
      `;
      const [moduleRoleResult] = await connect.query(moduleRoleQuery, [roleId, moduleId]);
      
      let moduleRoleId;
      if (moduleRoleResult.length > 0) {
        moduleRoleId = moduleRoleResult[0].Module_role_id;
      } else {
        // Create new module_role entry
        const [newModuleRole] = await connect.query(
          'INSERT INTO module_role (Role_FK_ID, Module_FK_ID) VALUES (?, ?)',
          [roleId, moduleId]
        );
        moduleRoleId = newModuleRole.insertId;
      }

      // Check if this permission is already assigned (excluding current record)
      const [existingPermission] = await connect.query(
        'SELECT Permissions_module_role_id FROM permissions_module_role WHERE Module_role_FK_ID = ? AND Permissions_FK_ID = ? AND Permissions_module_role_id != ?',
        [moduleRoleId, permissionId, id]
      );

      if (existingPermission.length > 0) {
        return { error: "This permission is already assigned to this role for this module" };
      }

      let sqlQuery = `
        UPDATE permissions_module_role 
        SET Module_role_FK_ID = ?, 
            Permissions_FK_ID = ?
        WHERE Permissions_module_role_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [moduleRoleId, permissionId, id]);
      
      if (result.affectedRows === 0) {
        return { error: "Permission-role mapping not found" };
      }
      return result.affectedRows;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = `
        DELETE FROM permissions_module_role 
        WHERE Permissions_module_role_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [id]);

      if (result.affectedRows === 0) {
        return { error: "Permission-role mapping not found" };
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
          pmr.Permissions_module_role_id as id,
          r.Role_id as role_id,
          r.Role_name,
          p.Permissions_id as permission_id,
          p.Permissions_name,
          m.module_id,
          m.module_name
        FROM permissions_module_role pmr
        JOIN module_role mr ON pmr.Module_role_FK_ID = mr.Module_role_id
        JOIN role r ON mr.Role_FK_ID = r.Role_id
        JOIN permissions p ON pmr.Permissions_FK_ID = p.Permissions_id
        JOIN module m ON mr.Module_FK_ID = m.module_id
        WHERE pmr.Permissions_module_role_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0] || null;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default RolePermissionModel;
