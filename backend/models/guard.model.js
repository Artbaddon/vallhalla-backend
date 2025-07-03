import { connect } from "../config/db/connectMysql.js";
import bcrypt from "bcrypt";

class GuardModel {
  static async create({ 
    username, 
    password, 
    arl, 
    eps, 
    shift,
    fullName,
    documentType,
    documentNumber,
    telephoneNumber,
    photo = null
  }) {
    const connection = await connect.getConnection();
    try {
      await connection.beginTransaction();

      // Create the user with Security role
      const userQuery = `
        INSERT INTO users (Users_name, Users_password, User_status_FK_ID, Role_FK_ID) 
        VALUES (?, ?, 1, (SELECT Role_id FROM role WHERE Role_name = 'Security'))
      `;
      const hashedPassword = await bcrypt.hash(password, 10);
      const [userResult] = await connection.query(userQuery, [username, hashedPassword]);
      const userId = userResult.insertId;

      // Create the profile
      const profileQuery = `
        INSERT INTO profile (
          Profile_fullName,
          User_FK_ID,
          Profile_document_type,
          Profile_document_number,
          Profile_telephone_number,
          Profile_photo
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [profileResult] = await connection.query(profileQuery, [
        fullName,
        userId,
        documentType,
        documentNumber,
        telephoneNumber,
        photo
      ]);

      // Create the guard record
      const guardQuery = `
        INSERT INTO guard (
          User_FK_ID,
          Guard_arl,
          Guard_eps,
          Guard_shift,
          Guard_createdAt,
          Guard_updatedAt
        ) VALUES (?, ?, ?, ?, NOW(), NOW())
      `;
      const [guardResult] = await connection.query(guardQuery, [userId, arl, eps, shift]);

      await connection.commit();
      return {
        userId: userId,
        profileId: profileResult.insertId,
        guardId: guardResult.insertId
      };
    } catch (error) {
      await connection.rollback();
      return { error: error.message };
    } finally {
      connection.release();
    }
  }

  static async show() {
    try {
      let sqlQuery = `
        SELECT 
          g.Guard_id,
          g.Guard_arl,
          g.Guard_eps,
          g.Guard_shift,
          g.Guard_createdAt,
          g.Guard_updatedAt,
          u.Users_id,
          u.Users_name,
          u.Users_createdAt,
          us.User_status_id,
          us.User_status_name,
          p.Profile_id,
          p.Profile_fullName,
          p.Profile_document_type,
          p.Profile_document_number,
          p.Profile_telephone_number,
          p.Profile_photo
        FROM guard g
        INNER JOIN users u ON g.User_FK_ID = u.Users_id
        INNER JOIN user_status us ON u.User_status_FK_ID = us.User_status_id
        INNER JOIN profile p ON u.Users_id = p.User_FK_ID
        ORDER BY g.Guard_createdAt DESC
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async update(id, { 
    arl, 
    eps, 
    shift,
    fullName = null,
    documentType = null,
    documentNumber = null,
    telephoneNumber = null,
    photo = null,
    userStatus = null
  }) {
    const connection = await connect.getConnection();
    try {
      await connection.beginTransaction();

      // Get the user ID associated with this guard
      const [guardData] = await connection.query(
        'SELECT User_FK_ID FROM guard WHERE Guard_id = ?',
        [id]
      );

      if (guardData.length === 0) {
        throw new Error("Guard not found");
      }

      const userId = guardData[0].User_FK_ID;

      // Update guard information
      await connection.query(
        `UPDATE guard 
         SET Guard_arl = ?, 
             Guard_eps = ?, 
             Guard_shift = ?, 
             Guard_updatedAt = NOW() 
         WHERE Guard_id = ?`,
        [arl, eps, shift, id]
      );

      // Update profile if any profile field is provided
      if (fullName || documentType || documentNumber || telephoneNumber || photo) {
        let updateFields = [];
        let updateValues = [];

        if (fullName) {
          updateFields.push('Profile_fullName = ?');
          updateValues.push(fullName);
        }
        if (documentType) {
          updateFields.push('Profile_document_type = ?');
          updateValues.push(documentType);
        }
        if (documentNumber) {
          updateFields.push('Profile_document_number = ?');
          updateValues.push(documentNumber);
        }
        if (telephoneNumber) {
          updateFields.push('Profile_telephone_number = ?');
          updateValues.push(telephoneNumber);
        }
        if (photo) {
          updateFields.push('Profile_photo = ?');
          updateValues.push(photo);
        }

        if (updateFields.length > 0) {
          const profileQuery = `
            UPDATE profile 
            SET ${updateFields.join(', ')}
            WHERE User_FK_ID = ?
          `;
          updateValues.push(userId);
          await connection.query(profileQuery, updateValues);
        }
      }

      // Update user status if provided
      if (userStatus) {
        await connection.query(
          'UPDATE users SET User_status_FK_ID = ? WHERE Users_id = ?',
          [userStatus, userId]
        );
      }

      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      return { error: error.message };
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    const connection = await connect.getConnection();
    try {
      await connection.beginTransaction();

      // Get the user ID associated with this guard
      const [guardData] = await connection.query(
        'SELECT User_FK_ID FROM guard WHERE Guard_id = ?',
        [id]
      );

      if (guardData.length === 0) {
        throw new Error("Guard not found");
      }

      const userId = guardData[0].User_FK_ID;

      // Delete in order: guard -> profile -> user
      await connection.query('DELETE FROM guard WHERE Guard_id = ?', [id]);
      await connection.query('DELETE FROM profile WHERE User_FK_ID = ?', [userId]);
      await connection.query('DELETE FROM users WHERE Users_id = ?', [userId]);

      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      return { error: error.message };
    } finally {
      connection.release();
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = `
        SELECT 
          g.Guard_id,
          g.Guard_arl,
          g.Guard_eps,
          g.Guard_shift,
          g.Guard_createdAt,
          g.Guard_updatedAt,
          u.Users_id,
          u.Users_name,
          u.Users_createdAt,
          us.User_status_id,
          us.User_status_name,
          p.Profile_id,
          p.Profile_fullName,
          p.Profile_document_type,
          p.Profile_document_number,
          p.Profile_telephone_number,
          p.Profile_photo
        FROM guard g
        INNER JOIN users u ON g.User_FK_ID = u.Users_id
        INNER JOIN user_status us ON u.User_status_FK_ID = us.User_status_id
        INNER JOIN profile p ON u.Users_id = p.User_FK_ID
        WHERE g.Guard_id = ?
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

  static async findByShift(shift) {
    try {
      let sqlQuery = `
        SELECT 
          g.Guard_id,
          g.Guard_arl,
          g.Guard_eps,
          g.Guard_shift,
          g.Guard_createdAt,
          g.Guard_updatedAt,
          u.Users_id,
          u.Users_name,
          u.Users_createdAt,
          us.User_status_id,
          us.User_status_name,
          p.Profile_id,
          p.Profile_fullName,
          p.Profile_document_type,
          p.Profile_document_number,
          p.Profile_telephone_number,
          p.Profile_photo
        FROM guard g
        INNER JOIN users u ON g.User_FK_ID = u.Users_id
        INNER JOIN user_status us ON u.User_status_FK_ID = us.User_status_id
        INNER JOIN profile p ON u.Users_id = p.User_FK_ID
        WHERE g.Guard_shift = ?
        ORDER BY g.Guard_createdAt DESC
      `;
      const [result] = await connect.query(sqlQuery, [shift]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByDocument(documentNumber) {
    try {
      let sqlQuery = `
        SELECT 
          g.Guard_id,
          g.Guard_arl,
          g.Guard_eps,
          g.Guard_shift,
          g.Guard_createdAt,
          g.Guard_updatedAt,
          u.Users_id,
          u.Users_name,
          u.Users_createdAt,
          us.User_status_id,
          us.User_status_name,
          p.Profile_id,
          p.Profile_fullName,
          p.Profile_document_type,
          p.Profile_document_number,
          p.Profile_telephone_number,
          p.Profile_photo
        FROM guard g
        INNER JOIN users u ON g.User_FK_ID = u.Users_id
        INNER JOIN user_status us ON u.User_status_FK_ID = us.User_status_id
        INNER JOIN profile p ON u.Users_id = p.User_FK_ID
        WHERE p.Profile_document_number = ?
      `;
      const [result] = await connect.query(sqlQuery, [documentNumber]);
      
      if (result.length === 0) {
        return null;
      }
      return result[0];
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default GuardModel;
