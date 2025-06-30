import { connect } from "../config/db/connectMysql.js";

class PQRSModel {
  static async create({ owner_id, category_id, subject, description, priority }) {
    try {
      let sqlQuery = `INSERT INTO pqrs (Owner_FK_ID, PQRS_category_FK_ID, PQRS_subject, PQRS_description, PQRS_priority, PQRS_status_FK_ID, PQRS_createdAt, PQRS_updatedAt) VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())`;
      const [result] = await connect.query(sqlQuery, [owner_id, category_id, subject, description, priority]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async show() {
    try {
      let sqlQuery = `
        SELECT p.*, pc.PQRS_category_name, pts.PQRS_tracking_status_name,
               o.Owner_id, u.Users_name as owner_name
        FROM pqrs p
        LEFT JOIN pqrs_category pc ON p.PQRS_category_FK_ID = pc.PQRS_category_id
        LEFT JOIN pqrs_tracking_status pts ON p.PQRS_status_FK_ID = pts.PQRS_tracking_status_id
        LEFT JOIN owner o ON p.Owner_FK_ID = o.Owner_id
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
        ORDER BY p.PQRS_createdAt DESC
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async update(id, { owner_id, category_id, subject, description, priority, status_id }) {
    try {
      let sqlQuery = `UPDATE pqrs SET Owner_FK_ID = ?, PQRS_category_FK_ID = ?, PQRS_subject = ?, PQRS_description = ?, PQRS_priority = ?, PQRS_status_FK_ID = ?, PQRS_updatedAt = NOW() WHERE PQRS_id = ?`;
      const [result] = await connect.query(sqlQuery, [owner_id, category_id, subject, description, priority, status_id, id]);
      if (result.affectedRows === 0) {
        return { error: "PQRS not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM pqrs WHERE PQRS_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);

      if (result.affectedRows === 0) {
        return { error: "PQRS not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = `
        SELECT p.*, pc.PQRS_category_name, pts.PQRS_tracking_status_name,
               o.Owner_id, u.Users_name as owner_name
        FROM pqrs p
        LEFT JOIN pqrs_category pc ON p.PQRS_category_FK_ID = pc.PQRS_category_id
        LEFT JOIN pqrs_tracking_status pts ON p.PQRS_status_FK_ID = pts.PQRS_tracking_status_id
        LEFT JOIN owner o ON p.Owner_FK_ID = o.Owner_id
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
        WHERE p.PQRS_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [id]);

      if (result.length === 0) {
        return null;
      }
      return result[0];
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByOwner(owner_id) {
    try {
      let sqlQuery = `
        SELECT p.*, pc.PQRS_category_name, pts.PQRS_tracking_status_name
        FROM pqrs p
        LEFT JOIN pqrs_category pc ON p.PQRS_category_FK_ID = pc.PQRS_category_id
        LEFT JOIN pqrs_tracking_status pts ON p.PQRS_status_FK_ID = pts.PQRS_tracking_status_id
        WHERE p.Owner_FK_ID = ?
        ORDER BY p.PQRS_createdAt DESC
      `;
      const [result] = await connect.query(sqlQuery, [owner_id]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByStatus(status_id) {
    try {
      let sqlQuery = `
        SELECT p.*, pc.PQRS_category_name, pts.PQRS_tracking_status_name,
               o.Owner_id, u.Users_name as owner_name
        FROM pqrs p
        LEFT JOIN pqrs_category pc ON p.PQRS_category_FK_ID = pc.PQRS_category_id
        LEFT JOIN pqrs_tracking_status pts ON p.PQRS_status_FK_ID = pts.PQRS_tracking_status_id
        WHERE p.PQRS_status_FK_ID = ?
        ORDER BY p.PQRS_createdAt DESC
      `;
      const [result] = await connect.query(sqlQuery, [status_id]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByCategory(category_id) {
    try {
      let sqlQuery = `
        SELECT p.*, pc.PQRS_category_name, pts.PQRS_tracking_status_name,
               o.Owner_id, u.Users_name as owner_name
        FROM pqrs p
        LEFT JOIN pqrs_category pc ON p.PQRS_category_FK_ID = pc.PQRS_category_id
        LEFT JOIN pqrs_tracking_status pts ON p.PQRS_status_FK_ID = pts.PQRS_tracking_status_id
        WHERE p.PQRS_category_FK_ID = ?
        ORDER BY p.PQRS_createdAt DESC
      `;
      const [result] = await connect.query(sqlQuery, [category_id]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async getPQRSStats() {
    try {
      let sqlQuery = `
        SELECT 
          pts.PQRS_tracking_status_name,
          pc.PQRS_category_name,
          COUNT(*) as count
        FROM pqrs p
        LEFT JOIN pqrs_tracking_status pts ON p.PQRS_status_FK_ID = pts.PQRS_tracking_status_id
        LEFT JOIN pqrs_category pc ON p.PQRS_category_FK_ID = pc.PQRS_category_id
        GROUP BY pts.PQRS_tracking_status_id, pts.PQRS_tracking_status_name, pc.PQRS_category_id, pc.PQRS_category_name
        ORDER BY pts.PQRS_tracking_status_id, pc.PQRS_category_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async searchPQRS(searchTerm) {
    try {
      let sqlQuery = `
        SELECT p.*, pc.PQRS_category_name, pts.PQRS_tracking_status_name,
               o.Owner_id, u.Users_name as owner_name
        FROM pqrs p
        LEFT JOIN pqrs_category pc ON p.PQRS_category_FK_ID = pc.PQRS_category_id
        LEFT JOIN pqrs_tracking_status pts ON p.PQRS_status_FK_ID = pts.PQRS_tracking_status_id
        LEFT JOIN owner o ON p.Owner_FK_ID = o.Owner_id
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
        WHERE p.PQRS_subject LIKE ? OR p.PQRS_description LIKE ? OR u.Users_name LIKE ?
        ORDER BY p.PQRS_createdAt DESC
      `;
      const searchPattern = `%${searchTerm}%`;
      const [result] = await connect.query(sqlQuery, [searchPattern, searchPattern, searchPattern]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default PQRSModel;