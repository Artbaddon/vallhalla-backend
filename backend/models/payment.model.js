import { connect } from "../config/db/connectMysql.js";

class PaymentModel {
  static async create({ reference_number, amount, owner_id, status_id, payment_date, description }) {
    try {
      let sqlQuery = `INSERT INTO payment (Payment_reference_number, Payment_amount, Owner_FK_ID, Payment_status_FK_ID, Payment_date, Payment_description, Payment_createdAt, Payment_updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`;
      const [result] = await connect.query(sqlQuery, [reference_number, amount, owner_id, status_id, payment_date, description]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async show() {
    try {
      let sqlQuery = `
        SELECT p.*, ps.Payment_status_name, o.Owner_id, u.Users_name as owner_name
        FROM payment p
        LEFT JOIN payment_status ps ON p.Payment_status_FK_ID = ps.Payment_status_id
        LEFT JOIN owner o ON p.Owner_FK_ID = o.Owner_id
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
        ORDER BY p.Payment_createdAt DESC
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async update(id, { reference_number, amount, owner_id, status_id, payment_date, description }) {
    try {
      let sqlQuery = `UPDATE payment SET Payment_reference_number = ?, Payment_amount = ?, Owner_FK_ID = ?, Payment_status_FK_ID = ?, Payment_date = ?, Payment_description = ?, Payment_updatedAt = NOW() WHERE payment_id = ?`;
      const [result] = await connect.query(sqlQuery, [reference_number, amount, owner_id, status_id, payment_date, description, id]);
      if (result.affectedRows === 0) {
        return { error: "Payment not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM payment WHERE payment_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);

      if (result.affectedRows === 0) {
        return { error: "Payment not found" };
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
        SELECT p.*, ps.Payment_status_name, o.Owner_id, u.Users_name as owner_name
        FROM payment p
        LEFT JOIN payment_status ps ON p.Payment_status_FK_ID = ps.Payment_status_id
        LEFT JOIN owner o ON p.Owner_FK_ID = o.Owner_id
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
        WHERE p.payment_id = ?
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
        SELECT p.*, ps.Payment_status_name
        FROM payment p
        LEFT JOIN payment_status ps ON p.Payment_status_FK_ID = ps.Payment_status_id
        WHERE p.Owner_FK_ID = ?
        ORDER BY p.Payment_createdAt DESC
      `;
      const [result] = await connect.query(sqlQuery, [owner_id]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async getPaymentStats() {
    try {
      let sqlQuery = `
        SELECT 
          ps.Payment_status_name,
          COUNT(*) as count,
          SUM(p.Payment_amount) as total_amount
        FROM payment p
        LEFT JOIN payment_status ps ON p.Payment_status_FK_ID = ps.Payment_status_id
        GROUP BY ps.Payment_status_id, ps.Payment_status_name
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default PaymentModel;