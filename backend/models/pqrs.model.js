import { connect } from "../config/db/connectMysql.js";

class PQRSModel {
  static async validateForeignKeys({ owner_id, category_id }) {
    try {
      // Check if owner exists
      if (owner_id) {
        const [ownerResult] = await connect.query('SELECT Owner_id FROM owner WHERE Owner_id = ?', [owner_id]);
        if (ownerResult.length === 0) {
          return { error: "Owner not found" };
        }
      }

      // Check if category exists
      if (category_id) {
        const [categoryResult] = await connect.query('SELECT PQRS_category_id FROM pqrs_category WHERE PQRS_category_id = ?', [category_id]);
        if (categoryResult.length === 0) {
          return { error: "PQRS category not found" };
        }
      }

      return { valid: true };
    } catch (error) {
      return { error: error.message };
    }
  }

  static async create({
    owner_id,
    category_id,
    subject,
    description,
    priority,
  }) {
    let connection;
    try {
      // Get a connection from the pool
      connection = await connect.getConnection();

      // Validate foreign keys first
      const validation = await this.validateForeignKeys({ owner_id, category_id });
      if (validation.error) {
        return { error: validation.error };
      }

      // Start transaction
      await connection.beginTransaction();

      try {
        // Create PQRS
        let sqlQuery = `INSERT INTO pqrs (
          Owner_FK_ID, 
          PQRS_category_FK_ID, 
          PQRS_subject, 
          PQRS_description, 
          PQRS_priority, 
          PQRS_createdAt, 
          PQRS_updatedAt
        ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`;

        const [result] = await connection.query(sqlQuery, [
          owner_id,
          category_id,
          subject,
          description,
          priority,
        ]);

        const pqrsId = result.insertId;

        // Create initial tracking record with status 1 (assuming 1 is "Open" or initial status)
        let trackingQuery = `INSERT INTO pqrs_tracking (
          PQRS_tracking_PQRS_FK_ID,
          PQRS_tracking_status_FK_ID,
          PQRS_tracking_user_FK_ID,
          PQRS_tracking_date_update
        ) VALUES (?, 1, ?, NOW())`;

        await connection.query(trackingQuery, [pqrsId, owner_id]);

        // Commit transaction
        await connection.commit();
        return pqrsId;
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    } catch (error) {
      return { error: error.message };
    } finally {
      if (connection) {
        connection.release(); // Release the connection back to the pool
      }
    }
  }

  static async show() {
    try {
      let sqlQuery = `
        SELECT p.*, pc.PQRS_category_name,
               o.Owner_id, u.Users_name as owner_name
        FROM pqrs p
        LEFT JOIN pqrs_category pc ON p.PQRS_category_FK_ID = pc.PQRS_category_id
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

  static async update(id, { owner_id, category_id, subject, description, priority }) {
    try {
      // Validate foreign keys first if they are being updated
      if (owner_id || category_id) {
        const validation = await this.validateForeignKeys({ 
          owner_id: owner_id || undefined, 
          category_id: category_id || undefined 
        });
        if (validation.error) {
          return { error: validation.error };
        }
      }

      // Build the update query dynamically based on provided fields
      const updates = [];
      const values = [];

      if (subject) {
        updates.push('PQRS_subject = ?');
        values.push(subject);
      }
      if (description) {
        updates.push('PQRS_description = ?');
        values.push(description);
      }
      if (priority) {
        updates.push('PQRS_priority = ?');
        values.push(priority);
      }
      if (owner_id) {
        updates.push('Owner_FK_ID = ?');
        values.push(owner_id);
      }
      if (category_id) {
        updates.push('PQRS_category_FK_ID = ?');
        values.push(category_id);
      }

      updates.push('PQRS_updatedAt = NOW()');

      // Add the ID to values array
      values.push(id);

      let sqlQuery = `UPDATE pqrs SET ${updates.join(', ')} WHERE PQRS_id = ?`;
      const [result] = await connect.query(sqlQuery, values);
      
      if (result.affectedRows === 0) {
        return { error: "PQRS not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

static async updateStatus(id, { status_id, admin_response }) {
  let connection;
  try {
    // Get a connection from the pool
    connection = await connect.getConnection();
    
    // First check if there's an existing tracking record
    let checkQuery = `SELECT * FROM pqrs_tracking WHERE PQRS_tracking_PQRS_FK_ID = ? ORDER BY PQRS_tracking_createdAt DESC LIMIT 1`;
    const [existing] = await connection.query(checkQuery, [id]);

    // Start a transaction
    await connection.beginTransaction();

    try {
      // Update the PQRS_answer in the main pqrs table if admin_response is provided
      if (admin_response) {
        let updateAnswerQuery = `UPDATE pqrs SET PQRS_answer = ?, PQRS_updatedAt = NOW() WHERE PQRS_id = ?`;
        await connection.query(updateAnswerQuery, [admin_response, id]);
      }

      // Insert new tracking record
      let trackingQuery = `INSERT INTO pqrs_tracking (
        PQRS_tracking_PQRS_FK_ID, 
        PQRS_tracking_status_FK_ID,
        PQRS_tracking_user_FK_ID,
        PQRS_tracking_date_update
      ) VALUES (?, ?, ?, NOW())`;
      
      // TODO: Get the actual user ID from the session/request
      const userId = 1; // This should be replaced with the actual admin user ID
      const [result] = await connection.query(trackingQuery, [id, status_id, userId]);

      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    return { error: error.message };
  } finally {
    if (connection) {
      connection.release(); // Release the connection back to the pool
    }
  }
}

static async delete(id) {
  let connection;
  try {
    // Get a connection from the pool
    connection = await connect.getConnection();
    
    // Start a transaction
    await connection.beginTransaction();

    try {
      // First delete all tracking records
      let deleteTrackingQuery = `DELETE FROM pqrs_tracking WHERE PQRS_tracking_PQRS_FK_ID = ?`;
      await connection.query(deleteTrackingQuery, [id]);

      // Then delete the PQRS itself
      let deletePQRSQuery = `DELETE FROM pqrs WHERE PQRS_id = ?`;
      const [result] = await connection.query(deletePQRSQuery, [id]);

      if (result.affectedRows === 0) {
        await connection.rollback();
        return { error: "PQRS not found" };
      }

      await connection.commit();
      return result.affectedRows;
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    return { error: error.message };
  } finally {
    if (connection) {
      connection.release(); // Release the connection back to the pool
    }
  }
}

static async findById(id) {
  try {
    let sqlQuery = `
      SELECT p.*, pc.PQRS_category_name,
              o.Owner_id, u.Users_name as owner_name
        FROM pqrs p
        LEFT JOIN pqrs_category pc ON p.PQRS_category_FK_ID = pc.PQRS_category_id
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
        SELECT p.*, pc.PQRS_category_name
        FROM pqrs p
        LEFT JOIN pqrs_category pc ON p.PQRS_category_FK_ID = pc.PQRS_category_id
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
        LEFT JOIN pqrs_tracking pt ON p.PQRS_id = pt.PQRS_tracking_PQRS_FK_ID
        LEFT JOIN pqrs_tracking_status pts ON pt.PQRS_tracking_status_FK_ID = pts.PQRS_tracking_status_id
        LEFT JOIN owner o ON p.Owner_FK_ID = o.Owner_id
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
        WHERE pt.PQRS_tracking_status_FK_ID = ?
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
        SELECT p.*, pc.PQRS_category_name,
               o.Owner_id, u.Users_name as owner_name
        FROM pqrs p
        LEFT JOIN pqrs_category pc ON p.PQRS_category_FK_ID = pc.PQRS_category_id
        LEFT JOIN owner o ON p.Owner_FK_ID = o.Owner_id
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
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
          pc.PQRS_category_name,
          COUNT(*) as count
        FROM pqrs p
        LEFT JOIN pqrs_category pc ON p.PQRS_category_FK_ID = pc.PQRS_category_id
        GROUP BY pc.PQRS_category_id, pc.PQRS_category_name
        ORDER BY pc.PQRS_category_id
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
        SELECT p.*, pc.PQRS_category_name,
               o.Owner_id, u.Users_name as owner_name
        FROM pqrs p
        LEFT JOIN pqrs_category pc ON p.PQRS_category_FK_ID = pc.PQRS_category_id
        LEFT JOIN owner o ON p.Owner_FK_ID = o.Owner_id
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
        WHERE p.PQRS_subject LIKE ? OR p.PQRS_description LIKE ? OR u.Users_name LIKE ?
        ORDER BY p.PQRS_createdAt DESC
      `;
      const searchPattern = `%${searchTerm}%`;
      const [result] = await connect.query(sqlQuery, [
        searchPattern,
        searchPattern,
        searchPattern,
      ]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default PQRSModel;
