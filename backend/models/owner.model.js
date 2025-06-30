import { connect } from "../config/db/connectMysql.js";

class OwnerModel {
  static async create({ user_id, is_tenant, birth_date }) {
    try {
      let sqlQuery = `INSERT INTO owner (User_FK_ID, Owner_is_tenant, Owner_birth_date, Owner_createdAt, Owner_updatedAt) VALUES (?, ?, ?, NOW(), NOW())`;
      const [result] = await connect.query(sqlQuery, [user_id, is_tenant, birth_date]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT * FROM owner ORDER BY Owner_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async update(id, { user_id, is_tenant, birth_date }) {
    try {
      let sqlQuery = "UPDATE owner SET User_FK_ID = ?, Owner_is_tenant = ?, Owner_birth_date = ?, Owner_updatedAt = NOW() WHERE Owner_id = ?";
      const [result] = await connect.query(sqlQuery, [user_id, is_tenant, birth_date, id]);
      if (result.affectedRows === 0) {
        return { error: "Owner not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM owner WHERE Owner_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      if (result.affectedRows === 0) {
        return { error: "Owner not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = `SELECT * FROM owner WHERE Owner_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0] || null;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByUserId(user_id) {
    try {
      let sqlQuery = `SELECT * FROM owner WHERE User_FK_ID = ?`;
      const [result] = await connect.query(sqlQuery, [user_id]);
      return result[0] || null;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async getOwnersWithDetails() {
    try {
      let sqlQuery = `
        SELECT 
          o.Owner_id,
          u.Users_name,
          p.Profile_fullName,
          p.Profile_document_number,
          p.Profile_telephone_number,
          o.Owner_is_tenant,
          o.Owner_birth_date,
          o.Owner_createdAt,
          o.Owner_updatedAt
        FROM owner o
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
        LEFT JOIN profile p ON u.Users_id = p.User_FK_ID
        ORDER BY o.Owner_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async getOwnerWithDetails(id) {
    try {
      let sqlQuery = `
        SELECT 
          o.Owner_id,
          u.Users_name,
          p.Profile_fullName,
          p.Profile_document_number,
          p.Profile_telephone_number,
          o.Owner_is_tenant,
          o.Owner_birth_date,
          o.Owner_createdAt,
          o.Owner_updatedAt
        FROM owner o
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
        LEFT JOIN profile p ON u.Users_id = p.User_FK_ID
        WHERE o.Owner_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0] || null;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async getOwnersByTenantStatus(is_tenant) {
    try {
      let sqlQuery = `
        SELECT 
          o.Owner_id,
          u.Users_name,
          p.Profile_fullName,
          o.Owner_is_tenant,
          o.Owner_birth_date
        FROM owner o
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
        LEFT JOIN profile p ON u.Users_id = p.User_FK_ID
        WHERE o.Owner_is_tenant = ?
        ORDER BY o.Owner_id
      `;
      const [result] = await connect.query(sqlQuery, [is_tenant]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default OwnerModel; 