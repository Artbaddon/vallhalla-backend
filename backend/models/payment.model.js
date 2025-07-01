import { connect } from "../config/db/connectMysql.js";

class PaymentModel {
  static async create({ reference_number, amount, owner_id, status_id, payment_date, method }) {
    try {
      let sqlQuery = `INSERT INTO payment (Payment_reference_number, Payment_total_payment, Owner_ID_FK, Payment_Status_ID_FK, Payment_date, Payment_method, Payment_createdAt, Payment_updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`;
      const [result] = await connect.query(sqlQuery, [reference_number, amount, owner_id, status_id, payment_date, method]);
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
        LEFT JOIN payment_status ps ON p.Payment_Status_ID_FK = ps.Payment_status_id
        LEFT JOIN owner o ON p.Owner_ID_FK = o.Owner_id
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
        ORDER BY p.Payment_date DESC
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async update(id, { reference_number, amount, owner_id, status_id, payment_date, method }) {
    try {
      let sqlQuery = `UPDATE payment SET Payment_reference_number = ?, Payment_total_payment = ?, Owner_ID_FK = ?, Payment_Status_ID_FK = ?, Payment_date = ?, Payment_method = ?, Payment_updatedAt = NOW() WHERE payment_id = ?`;
      const [result] = await connect.query(sqlQuery, [reference_number, amount, owner_id, status_id, payment_date, method, id]);
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
        LEFT JOIN payment_status ps ON p.Payment_Status_ID_FK = ps.Payment_status_id
        LEFT JOIN owner o ON p.Owner_ID_FK = o.Owner_id
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
        LEFT JOIN payment_status ps ON p.Payment_Status_ID_FK = ps.Payment_status_id
        WHERE p.Owner_ID_FK = ?
        ORDER BY p.Payment_date DESC
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
          SUM(p.Payment_total_payment) as total_amount
        FROM payment p
        LEFT JOIN payment_status ps ON p.Payment_Status_ID_FK = ps.Payment_status_id
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