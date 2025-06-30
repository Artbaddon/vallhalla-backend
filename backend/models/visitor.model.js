import { connect } from "../config/db/connectMysql.js";

class VisitorModel {
  static async create({ host_id, visitor_name, document_number, phone, visit_date, visit_purpose, vehicle_plate }) {
    try {
      let sqlQuery = `INSERT INTO visitor (host, visitor_name, visitor_document, visitor_phone, visit_date, visit_purpose, vehicle_plate, visitor_createdAt, visitor_updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
      const [result] = await connect.query(sqlQuery, [host_id, visitor_name, document_number, phone, visit_date, visit_purpose, vehicle_plate]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async show() {
    try {
      let sqlQuery = `
        SELECT v.*, o.Owner_id, u.Users_name as host_name
        FROM visitor v
        LEFT JOIN owner o ON v.host = o.Owner_id
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
        ORDER BY v.visitor_createdAt DESC
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async update(id, { host_id, visitor_name, document_number, phone, visit_date, visit_purpose, vehicle_plate }) {
    try {
      let sqlQuery = `UPDATE visitor SET host = ?, visitor_name = ?, visitor_document = ?, visitor_phone = ?, visit_date = ?, visit_purpose = ?, vehicle_plate = ?, visitor_updatedAt = NOW() WHERE ID = ?`;
      const [result] = await connect.query(sqlQuery, [host_id, visitor_name, document_number, phone, visit_date, visit_purpose, vehicle_plate, id]);
      if (result.affectedRows === 0) {
        return { error: "Visitor not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM visitor WHERE ID = ?`;
      const [result] = await connect.query(sqlQuery, [id]);

      if (result.affectedRows === 0) {
        return { error: "Visitor not found" };
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
        SELECT v.*, o.Owner_id, u.Users_name as host_name
        FROM visitor v
        LEFT JOIN owner o ON v.host = o.Owner_id
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
        WHERE v.ID = ?
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

  static async findByHost(host_id) {
    try {
      let sqlQuery = `
        SELECT v.*
        FROM visitor v
        WHERE v.host = ?
        ORDER BY v.visitor_createdAt DESC
      `;
      const [result] = await connect.query(sqlQuery, [host_id]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByDate(visit_date) {
    try {
      let sqlQuery = `
        SELECT v.*, o.Owner_id, u.Users_name as host_name
        FROM visitor v
        LEFT JOIN owner o ON v.host = o.Owner_id
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
        WHERE DATE(v.visit_date) = ?
        ORDER BY v.visit_date
      `;
      const [result] = await connect.query(sqlQuery, [visit_date]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default VisitorModel;