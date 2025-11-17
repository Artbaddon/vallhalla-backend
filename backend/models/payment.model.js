import { connect } from "../config/db/connectMysql.js";
import { resolveOwnerId } from "../utils/ownerUtils.js";

class PaymentModel {
  constructor() {
    this.db = connect;
  }

  async show() {
    try {
      let sqlQuery = `
        SELECT 
          p.*,
          ps.Payment_status_name,
          o.Owner_id,
          u.Users_name as owner_name
        FROM payment p
        LEFT JOIN payment_status ps ON p.Payment_Status_ID_FK = ps.Payment_status_id
        LEFT JOIN owner o ON p.Owner_ID_FK = o.Owner_id
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
        ORDER BY p.Payment_date DESC
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async create(paymentData) {
    const {
      user_id,
      currency = "COP",
      status,
      payment_method,
      reference,
    } = paymentData;

    const query = `
      INSERT INTO payment 
      (Owner_ID_FK, Payment_Status_ID_FK, Payment_method, Payment_reference_number, currency)
      VALUES (?, ?, ?, ?, ?)
    `;

    try {
      const [result] = await this.db.execute(query, [
        user_id,
        status,
        payment_method,
        reference,
        currency,
      ]);

      return this.findById(result.insertId);
    } catch (error) {
      console.error("Error creating payment:", error);
      throw error;
    }
  }

  async findById(payment_id) {
    try {
      console.log("Finding payment by ID:", payment_id);
      const [rows] = await connect.query(
        `SELECT p.*, 
                ps.Payment_status_name as status_name,
                CONCAT(pr.Profile_fullName) as owner_name
         FROM payment p
         LEFT JOIN payment_status ps ON p.Payment_Status_ID_FK = ps.Payment_status_id
         LEFT JOIN owner o ON p.Owner_ID_FK = o.Owner_id
         LEFT JOIN profile pr ON o.User_FK_ID = pr.User_FK_ID
         WHERE p.payment_id = ?`,
        [payment_id]
      );
      console.log("Found payment:", rows[0]);
      return rows[0];
    } catch (error) {
      console.error("Error in findById:", error);
      throw error;
    }
  }

  async findByOwner(ownerIdentifier) {
    try {
      console.log("Finding payments for owner identifier:", ownerIdentifier);

      const ownerId = await resolveOwnerId(ownerIdentifier);
      if (!ownerId) {
        const error = new Error("Owner not found for the provided identifier");
        error.statusCode = 404;
        throw error;
      }

      console.log("Resolved owner ID:", ownerId);
      const [rows] = await connect.query(
        `SELECT p.*, 
                ps.Payment_status_name as payment_status,
                pr.Profile_fullName as owner_name
         FROM payment p
         LEFT JOIN payment_status ps ON p.Payment_Status_ID_FK = ps.Payment_status_id
         LEFT JOIN owner o ON p.Owner_ID_FK = o.Owner_id
         LEFT JOIN profile pr ON o.User_FK_ID = pr.User_FK_ID
         WHERE p.Owner_ID_FK = ?
         ORDER BY p.Payment_date DESC`,
        [ownerId]
      );
      console.log("Found payments:", rows.length);
      return rows;
    } catch (error) {
      console.error("Error in findByOwner:", error);
      throw error;
    }
  }

  async findByReference(reference) {
    const query = `SELECT * FROM payment WHERE Payment_reference_number = ?`;
    try {
      const [rows] = await this.db.execute(query, [reference]);
      return rows[0];
    } catch (error) {
      console.error("Error finding payment by reference:", error);
      throw error;
    }
  }

  isValidStatusTransition(currentStatus, newStatus) {
    const allowedTransitions = {
      1: [2, 3, 4], // PENDING -> PROCESSING, COMPLETED, FAILED
      2: [3, 4], // PROCESSING -> COMPLETED, FAILED
      3: [], // COMPLETED -> no puede cambiar
      4: [], // FAILED -> no puede cambiar
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) || false;
  }

  async updateByReference(reference, { status_id }) {
    try {
      await connect.query("START TRANSACTION");

      // First check if payment exists and get current status using reference
      const currentPayment = await this.findByReference(reference);
      if (!currentPayment) {
        throw new Error("Payment not found");
      }

      // Validate status transition
      if (
        !this.isValidStatusTransition(
          currentPayment.Payment_Status_ID_FK,
          status_id
        )
      ) {
        throw new Error("Invalid payment status transition");
      }

      let sqlQuery = `
        UPDATE payment 
        SET Payment_Status_ID_FK = ?
        WHERE Payment_reference_number = ?`;

      const [result] = await connect.query(sqlQuery, [status_id, reference]);

      await connect.query("COMMIT");
      return result.affectedRows > 0;
    } catch (error) {
      await connect.query("ROLLBACK");
      throw error;
    }
  }

  async delete(id) {
    try {
      const sqlQuery = "DELETE FROM payment WHERE payment_id = ?";
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  async getPaymentHistory(userId, page = 1, limit = 10, status = null) {
    let query = `
      SELECT * FROM payment 
      WHERE Owner_ID_FK = ?
    `;
    const params = [userId];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    query += ` ORDER BY Payment_date DESC LIMIT ? OFFSET ?`;
    params.push(limit, (page - 1) * limit);

    try {
      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      console.error("Error getting payment history:", error);
      throw error;
    }
  }

  async getPendingPayments(userId = null) {
    let query = `SELECT * FROM payment WHERE status = 'PENDING'`;
    const params = [];

    if (userId) {
      query += ` AND Owner_ID_FK = ?`;
      params.push(userId);
    }

    query += ` ORDER BY Payment_date ASC`;

    try {
      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      console.error("Error getting pending payments:", error);
      throw error;
    }
  }

  async getPaymentReports(startDate, endDate, groupBy = "day") {
    let dateFormat;
    switch (groupBy) {
      case "day":
        dateFormat = "%Y-%m-%d";
        break;
      case "month":
        dateFormat = "%Y-%m";
        break;
      case "year":
        dateFormat = "%Y";
        break;
      default:
        dateFormat = "%Y-%m-%d";
    }

    const query = `
      SELECT 
        DATE_FORMAT(Payment_date, ?) as period,
        status,
        currency,
        COUNT(*) as total_count,
        SUM(Payment_total_payment) as total_amount,
        COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) as approved_count,
        COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_count
      FROM payment 
      WHERE Payment_date BETWEEN ? AND ?
      GROUP BY period, status, currency
      ORDER BY period DESC
    `;

    try {
      const [rows] = await this.db.execute(query, [
        dateFormat,
        startDate,
        endDate,
      ]);
      return rows;
    } catch (error) {
      console.error("Error getting payment reports:", error);
      throw error;
    }
  }

  async getIndividualReport(userId, startDate = null, endDate = null) {
    let query = `
      SELECT 
        status,
        COUNT(*) as count,
        SUM(Payment_total_payment) as total_amount,
        currency
      FROM payment 
      WHERE Owner_ID_FK = ?
    `;

    const params = [userId];

    if (startDate && endDate) {
      query += ` AND Payment_date BETWEEN ? AND ?`;
      params.push(startDate, endDate);
    }

    query += ` GROUP BY status, currency`;

    try {
      const [rows] = await this.db.execute(query, params);
      return rows;
    } catch (error) {
      console.error("Error getting individual report:", error);
      throw error;
    }
  }
}

export default new PaymentModel();
