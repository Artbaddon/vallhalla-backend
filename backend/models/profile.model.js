import { connect } from "../config/db/connectMysql.js";

class ProfileModel {
  static async create({
    User_FK_ID,
    Profile_fullName,
    Profile_document_type,
    Profile_document_number,
    Profile_telephone_number,
    Profile_photo
  }) {
    try {
      // First check if user already has a profile
      const existingProfile = await this.findByUserId(User_FK_ID);
      if (existingProfile && !existingProfile.error) {
        return { error: "User already has a profile" };
      }

      let sqlQuery = `
        INSERT INTO profile (
          User_FK_ID,
          Profile_fullName,
          Profile_document_type,
          Profile_document_number,
          Profile_telephone_number,
          Profile_photo
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;

      const [result] = await connect.query(sqlQuery, [
        User_FK_ID,
        Profile_fullName,
        Profile_document_type,
        Profile_document_number,
        Profile_telephone_number,
        Profile_photo
      ]);

      return result.insertId;
    } catch (error) {
      console.error('Error creating profile:', error);
      return { error: error.message };
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT * FROM profile ORDER BY Profile_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async update(id, {
    first_name,
    last_name,
    phone,
    document_type_id,
    document_number,
    photo_url
  }) {
    try {
      let sqlQuery = `UPDATE profile SET 
        Profile_fullName = ?,
        Profile_document_type = ?,
        Profile_document_number = ?,
        Profile_telephone_number = ?,
        Profile_photo = ?
        WHERE Profile_id = ?`;
      const [result] = await connect.query(sqlQuery, [
        `${first_name} ${last_name}`,
        document_type_id,
        document_number,
        phone,
        photo_url,
        id
      ]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM profile WHERE Profile_id = ?`;
      const [result] = await connect.query(sqlQuery, id);
      if (result.affectedRows === 0) {
        return { error: "Profile not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = `SELECT * FROM profile WHERE Profile_id = ?`;
      const [result] = await connect.query(sqlQuery, id);
      return result[0];
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByUserId(userId) {
    try {
      let sqlQuery = `
        SELECT p.*, u.Users_name
        FROM profile p
        JOIN users u ON p.User_FK_ID = u.Users_id
        WHERE p.User_FK_ID = ?
      `;
      const [result] = await connect.query(sqlQuery, [userId]);
      return result[0] || null;
    } catch (error) {
      console.error('Error in findByUserId:', error);
      return { error: error.message };
    }
  }

  static async getUserProfile(userId) {
    try {
      let sqlQuery =
        "SELECT * FROM profile INNER JOIN user ON profile.User_FK_ID = user.id WHERE User_FK_ID = ? ";
      const [result] = await connect.query(sqlQuery, userId);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByWebUserId(web_user_id) {
    try {
      let sqlQuery = `SELECT * FROM profile WHERE User_FK_ID = ?`;
      const [result] = await connect.query(sqlQuery, [web_user_id]);
      return result[0] || null;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async updateByWebUserId(
    web_user_id,
    {
      first_name,
      last_name,
      address,
      phone,
      document_type_id,
      document_number,
      photo_url,
      birth_date,
    }
  ) {
    try {
      let sqlQuery = `UPDATE profile SET 
        Profile_fullName = ?,
        Profile_document_type = ?,
        Profile_document_number = ?,
        Profile_telephone_number = ?,
        Profile_photo = ?,
        Profile_birth_date = ?
        WHERE User_FK_ID = ?`;
      const [result] = await connect.query(sqlQuery, [
        `${first_name} ${last_name}`,
        document_type_id,
        document_number,
        phone,
        photo_url,
        birth_date,
        web_user_id
      ]);
      return result.affectedRows;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default ProfileModel;
