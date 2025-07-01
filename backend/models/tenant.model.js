import { connect } from "../config/db/connectMysql.js";

class TenantModel {
  static async getAll() {
    try {
      const [rows] = await connect.query(`
        SELECT t.*, o.Owner_id, u.Users_name as owner_name
        FROM tenant t
        LEFT JOIN owner o ON t.Owner_FK_ID = o.Owner_id
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
        ORDER BY t.Tenant_id
      `);
      return rows;
    } catch (error) {
      console.error("Error getting all tenants:", error.message);
      return [];
    }
  }

  static async create({ name, document_type, document_number, email, phone, start_date, end_date, owner_id }) {
    try {
      const [result] = await connect.query(
        `INSERT INTO tenant 
         (Tenant_name, Tenant_document_type, Tenant_document_number, Tenant_email, Tenant_phone, Tenant_start_date, Tenant_end_date, Owner_FK_ID) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, document_type, document_number, email, phone, start_date, end_date, owner_id]
      );
      return result.insertId;
    } catch (error) {
      console.error("Error creating tenant:", error.message);
      return null;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await connect.query(
        `SELECT t.*, o.Owner_id, u.Users_name as owner_name
         FROM tenant t
         LEFT JOIN owner o ON t.Owner_FK_ID = o.Owner_id
         LEFT JOIN users u ON o.User_FK_ID = u.Users_id
         WHERE t.Tenant_id = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Error finding tenant by ID:", error.message);
      return null;
    }
  }

  static async update(id, { name, document_type, document_number, email, phone, start_date, end_date }) {
    try {
      const [result] = await connect.query(
        `UPDATE tenant 
         SET 
           Tenant_name = COALESCE(?, Tenant_name),
           Tenant_document_type = COALESCE(?, Tenant_document_type),
           Tenant_document_number = COALESCE(?, Tenant_document_number),
           Tenant_email = COALESCE(?, Tenant_email),
           Tenant_phone = COALESCE(?, Tenant_phone),
           Tenant_start_date = COALESCE(?, Tenant_start_date),
           Tenant_end_date = COALESCE(?, Tenant_end_date),
           Tenant_updatedAt = CURRENT_TIMESTAMP
         WHERE Tenant_id = ?`,
        [name, document_type, document_number, email, phone, start_date, end_date, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error updating tenant:", error.message);
      return false;
    }
  }

  static async delete(id) {
    try {
      const [result] = await connect.query(
        `DELETE FROM tenant WHERE Tenant_id = ?`,
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error deleting tenant:", error.message);
      return false;
    }
  }

  static async findByOwner(ownerId) {
    try {
      const [rows] = await connect.query(
        `SELECT t.*
         FROM tenant t
         WHERE t.Owner_FK_ID = ?
         ORDER BY t.Tenant_name`,
        [ownerId]
      );
      return rows;
    } catch (error) {
      console.error("Error finding tenants by owner:", error.message);
      return [];
    }
  }

  static async findOwnerByUserId(userId) {
    try {
      const [rows] = await connect.query(
        `SELECT o.* 
         FROM owner o
         WHERE o.User_FK_ID = ?`,
        [userId]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Error finding owner by user ID:", error.message);
      return null;
    }
  }
}

export default TenantModel; 