import { connect } from "../config/db/connectMysql.js";

class PaymentModel {
  static async create(paymentData) {
    try {
      const { amount, owner_id } = paymentData;

      // Generate a unique reference number
      const reference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const [result] = await connect.query(
        `INSERT INTO payment (
          Owner_ID_FK,
          Payment_total_payment,
          Payment_Status_ID_FK,
          Payment_reference_number,
          Payment_method
        ) VALUES (?, ?, ?, ?, ?)`,
        [
          owner_id,
          amount,
          1, // Status 1 = PENDING
          reference,
          'PENDING' // Default method until payment is processed
        ]
      );

      if (result.insertId) {
        return this.findById(result.insertId);
      }
      throw new Error('Failed to create payment');
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  static async processPayment(payment_id, { method, payment_date = new Date() }) {
    try {
      const [result] = await connect.query(
        `UPDATE payment 
         SET Payment_Status_ID_FK = ?,
             Payment_method = ?,
             Payment_date = ?
         WHERE payment_id = ? AND Payment_Status_ID_FK = 1`,
        [2, method, payment_date, payment_id] // 2 = COMPLETED
      );

      if (result.affectedRows === 0) {
        throw new Error('Payment not found or not in pending status');
      }

      return this.findById(payment_id);
    } catch (error) {
      console.error('Error in processPayment:', error);
      throw error;
    }
  }

  static async show() {
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

  static async findById(payment_id) {
    try {
      console.log('Finding payment by ID:', payment_id);
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
      console.log('Found payment:', rows[0]);
      return rows[0];
    } catch (error) {
      console.error('Error in findById:', error);
      throw error;
    }
  }

  static async findByOwner(owner_id) {
    try {
      console.log('Finding payments for owner:', owner_id);
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
        [owner_id]
      );
      console.log('Found payments:', rows.length);
      return rows;
    } catch (error) {
      console.error('Error in findByOwner:', error);
      throw error;
    }
  }

  static async update(id, { status_id }) {
    try {
      await connect.query('START TRANSACTION');

      // First check if payment exists and get current status
      const currentPayment = await this.findById(id);
      if (!currentPayment) {
        throw new Error("Payment not found");
      }

      // Validate status transition
      if (!this.isValidStatusTransition(currentPayment.Payment_Status_ID_FK, status_id)) {
        throw new Error("Invalid payment status transition");
      }

      let sqlQuery = `
        UPDATE payment 
        SET Payment_Status_ID_FK = ?
        WHERE payment_id = ?`;

      const [result] = await connect.query(sqlQuery, [status_id, id]);

      // If status changed, create notification
      if (status_id !== currentPayment.Payment_Status_ID_FK) {
        const statusMap = {
          1: 'PENDING',
          2: 'PROCESSING',
          3: 'COMPLETED',
          4: 'FAILED'
        };

        await connect.query(`
          INSERT INTO notification (
            Notification_type_FK_ID,
            Notification_description,
            Notification_User_FK_ID
          ) VALUES (
            2, # Payment notification type
            ?,
            (SELECT User_FK_ID FROM owner WHERE Owner_id = ?)
          )`, [
            `Payment status updated: ${currentPayment.Payment_reference_number} is now ${statusMap[status_id]}`,
            currentPayment.Owner_ID_FK
          ]
        );
      }

      await connect.query('COMMIT');
      return result.affectedRows > 0;
    } catch (error) {
      await connect.query('ROLLBACK');
      throw error;
    }
  }

  static async delete(id) {
    try {
      const sqlQuery = "DELETE FROM payment WHERE payment_id = ?";
      const [result] = await connect.query(sqlQuery, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getPaymentStats() {
    try {
      const sqlQuery = `
        SELECT 
          COUNT(*) as total_payments,
          SUM(CASE WHEN Payment_Status_ID_FK = 1 THEN 1 ELSE 0 END) as pending_count,
          SUM(CASE WHEN Payment_Status_ID_FK = 2 THEN 1 ELSE 0 END) as completed_count,
          SUM(CASE WHEN Payment_Status_ID_FK = 3 THEN 1 ELSE 0 END) as failed_count,
          SUM(Payment_total_payment) as total_amount,
          SUM(CASE WHEN Payment_Status_ID_FK = 2 THEN Payment_total_payment ELSE 0 END) as collected_amount
        FROM payment
      `;
      const [result] = await connect.query(sqlQuery);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  static async getOwnerPendingPayments(owner_id) {
    try {
      console.log('Finding pending payments for owner:', owner_id);
      const [rows] = await connect.query(
        `SELECT p.*, 
                ps.Payment_status_name as payment_status,
                pr.Profile_fullName as owner_name
         FROM payment p
         LEFT JOIN payment_status ps ON p.Payment_Status_ID_FK = ps.Payment_status_id
         LEFT JOIN owner o ON p.Owner_ID_FK = o.Owner_id
         LEFT JOIN profile pr ON o.User_FK_ID = pr.User_FK_ID
         WHERE p.Owner_ID_FK = ? AND p.Payment_Status_ID_FK = 1
         ORDER BY p.Payment_date DESC`,
        [owner_id]
      );
      console.log('Found pending payments:', rows.length);
      return rows;
    } catch (error) {
      console.error('Error in getOwnerPendingPayments:', error);
      throw error;
    }
  }

  static isValidStatusTransition(currentStatus, newStatus) {
    // Define valid status transitions based on existing DB statuses:
    // 1 = PENDING
    // 2 = COMPLETED 
    // 3 = FAILED
    const validTransitions = {
      1: [2, 3], // From PENDING can go to COMPLETED or FAILED
      2: [], // From COMPLETED cannot change
      3: [1] // From FAILED can go back to PENDING
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  static async updateStatus(payment_id, status_id) {
    try {
      const [result] = await connect.query(
        'UPDATE payment SET Payment_Status_ID_FK = ? WHERE payment_id = ?',
        [status_id, payment_id]
      );

      if (result.affectedRows === 0) {
        throw new Error('Payment not found');
      }

      // Get the updated payment
      const [rows] = await connect.query(
        `SELECT p.*, ps.Payment_status_name as status_name
         FROM payment p
         LEFT JOIN payment_status ps ON p.Payment_Status_ID_FK = ps.Payment_status_id
         WHERE p.payment_id = ?`,
        [payment_id]
      );

      return rows[0];
    } catch (error) {
      console.error('Error in updateStatus:', error);
      throw error;
    }
  }
}

export default PaymentModel;