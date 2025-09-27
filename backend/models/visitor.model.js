import { connect } from "../config/db/connectMysql.js";

class VisitorModel {
  static async create({ host_id, visitor_name, document_number }) {
    try {
      let sqlQuery = `INSERT INTO visitor ( name,documentNumber, host, enter_date) VALUES (?, ?, ?, NOW())`;
      const [result] = await connect.query(sqlQuery, [
        visitor_name,
        document_number,
        host_id,
      ]);
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
        ORDER BY enter_date DESC
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async update(id, { visitor_name, document_number }) {
    try {
      let sqlQuery = `UPDATE visitor SET name = ?, documentNumber = ? WHERE ID = ?`;
      const [result] = await connect.query(sqlQuery, [
        visitor_name,
        document_number,
        id,
      ]);
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
       SELECT v.* FROM visitor v WHERE v.host = ? ORDER BY v.enter_date DESC;
      `;
      const [result] = await connect.query(sqlQuery, [host_id]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByDate(enter_date) {
    try {
      let sqlQuery = `
        SELECT v.*, o.Owner_id, u.Users_name as host_name
        FROM visitor v
        LEFT JOIN owner o ON v.host = o.Owner_id
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
        WHERE DATE(v.enter_date) = ?
        ORDER BY v.enter_date
      `;
      const [result] = await connect.query(sqlQuery, [enter_date]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default VisitorModel;
