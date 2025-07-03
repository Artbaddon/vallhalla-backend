import { connect } from "../config/db/connectMysql.js";
import ProfileModel from "./profile.model.js";
import UserModel from "./user.model.js";
import bcrypt from "bcrypt";

class OwnerModel {
  static async create({ username, password, user_status_id, role_id, is_tenant, birth_date, profile_data }) {
    try {
      // Start a transaction
      await connect.query("START TRANSACTION");
      
      // 1. Create the user first
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      let sqlCreateUser = `INSERT INTO users (Users_name, Users_password, User_status_FK_ID, Role_FK_ID, Users_createdAt, Users_updatedAt) 
                          VALUES (?, ?, ?, ?, NOW(), NOW())`;
      const [userResult] = await connect.query(sqlCreateUser, [username, hashedPassword, user_status_id, role_id]);
      const userId = userResult.insertId;
      
      if (!userId) {
        throw new Error("Failed to create user");
      }
      
      // 2. Create the owner with the new user ID
      let sqlCreateOwner = `INSERT INTO owner (User_FK_ID, Owner_is_tenant, Owner_birth_date, Owner_createdAt, Owner_updatedAt) 
                           VALUES (?, ?, ?, NOW(), NOW())`;
      const [ownerResult] = await connect.query(sqlCreateOwner, [userId, is_tenant, birth_date]);
      const ownerId = ownerResult.insertId;
      
      // 3. Create the profile for the user
      if (profile_data) {
        const { first_name, last_name, document_type, document_number, phone, photo_url } = profile_data;
        const fullName = `${first_name} ${last_name}`;
        let sqlCreateProfile = `INSERT INTO profile (Profile_fullName, User_FK_ID, Profile_document_type, Profile_document_number, Profile_telephone_number, Profile_photo) 
                              VALUES (?, ?, ?, ?, ?, ?)`;
        await connect.query(sqlCreateProfile, [
          fullName,
          userId,
          document_type || '',
          document_number || '',
          phone || '',
          photo_url || null
        ]);
      }
      
      // Commit the transaction
      await connect.query("COMMIT");
      
      return {
        owner_id: ownerId,
        user_id: userId
      };
    } catch (error) {
      // Rollback in case of error
      await connect.query("ROLLBACK");
      return { error: error.message };
    }
  }

  static async show(includeInactive = false) {
    try {
      let sqlQuery = `
        SELECT o.* 
        FROM owner o
        JOIN users u ON o.User_FK_ID = u.Users_id
        ${!includeInactive ? 'WHERE u.User_status_FK_ID = 1' : ''}
        ORDER BY o.Owner_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async update(id, { 
    username, 
    password, 
    user_status_id, 
    role_id, 
    is_tenant, 
    birth_date,
    first_name,
    last_name,
    document_type,
    document_number,
    phone,
    photo_url
  }) {
    try {
      // Start a transaction
      await connect.query("START TRANSACTION");
      
      // First, get the current owner to find the user_id
      let sqlGetOwner = `SELECT User_FK_ID FROM owner WHERE Owner_id = ?`;
      const [ownerResult] = await connect.query(sqlGetOwner, [id]);
      
      if (ownerResult.length === 0) {
        await connect.query("ROLLBACK");
        return { error: "Owner not found" };
      }
      
      const userId = ownerResult[0].User_FK_ID;
      
      // 1. Update the user
      let userUpdateFields = [];
      let userUpdateValues = [];
      
      if (username) {
        userUpdateFields.push("Users_name = ?");
        userUpdateValues.push(username);
      }
      
      if (password) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        userUpdateFields.push("Users_password = ?");
        userUpdateValues.push(hashedPassword);
      }
      
      if (user_status_id) {
        userUpdateFields.push("User_status_FK_ID = ?");
        userUpdateValues.push(user_status_id);
      }
      
      if (role_id) {
        userUpdateFields.push("Role_FK_ID = ?");
        userUpdateValues.push(role_id);
      }
      
      if (userUpdateFields.length > 0) {
        userUpdateFields.push("Users_updatedAt = NOW()");
        let sqlUpdateUser = `UPDATE users SET ${userUpdateFields.join(", ")} WHERE Users_id = ?`;
        userUpdateValues.push(userId);
        await connect.query(sqlUpdateUser, userUpdateValues);
      }
      
      // 2. Update the owner
      let ownerUpdateFields = [];
      let ownerUpdateValues = [];
      
      if (is_tenant !== undefined) {
        ownerUpdateFields.push("Owner_is_tenant = ?");
        ownerUpdateValues.push(is_tenant);
      }
      
      if (birth_date) {
        ownerUpdateFields.push("Owner_birth_date = ?");
        ownerUpdateValues.push(birth_date);
      }
      
      if (ownerUpdateFields.length > 0) {
        ownerUpdateFields.push("Owner_updatedAt = NOW()");
        let sqlUpdateOwner = `UPDATE owner SET ${ownerUpdateFields.join(", ")} WHERE Owner_id = ?`;
        ownerUpdateValues.push(id);
        await connect.query(sqlUpdateOwner, ownerUpdateValues);
      }
      
      // 3. Update or create the profile
      // First check if profile exists
      let sqlCheckProfile = `SELECT Profile_id FROM profile WHERE User_FK_ID = ?`;
      const [profileResult] = await connect.query(sqlCheckProfile, [userId]);
      
      if (first_name || last_name || document_type || document_number || phone || photo_url) {
        if (profileResult.length > 0) {
          // Profile exists, update it
          const profileId = profileResult[0].Profile_id;
          let profileUpdateFields = [];
          let profileUpdateValues = [];
          
          if (first_name && last_name) {
            profileUpdateFields.push("Profile_fullName = ?");
            profileUpdateValues.push(`${first_name} ${last_name}`);
          }
          
          if (document_type) {
            profileUpdateFields.push("Profile_document_type = ?");
            profileUpdateValues.push(document_type);
          }
          
          if (document_number) {
            profileUpdateFields.push("Profile_document_number = ?");
            profileUpdateValues.push(document_number);
          }
          
          if (phone) {
            profileUpdateFields.push("Profile_telephone_number = ?");
            profileUpdateValues.push(phone);
          }
          
          if (photo_url) {
            profileUpdateFields.push("Profile_photo = ?");
            profileUpdateValues.push(photo_url);
          }
          
          if (profileUpdateFields.length > 0) {
            let sqlUpdateProfile = `UPDATE profile SET ${profileUpdateFields.join(", ")} WHERE Profile_id = ?`;
            profileUpdateValues.push(profileId);
            await connect.query(sqlUpdateProfile, profileUpdateValues);
          }
        } else {
          // Profile doesn't exist, create it
          if (first_name && last_name) {
            const fullName = `${first_name} ${last_name}`;
            let sqlCreateProfile = `INSERT INTO profile (Profile_fullName, User_FK_ID, Profile_document_type, Profile_document_number, Profile_telephone_number, Profile_photo) 
                                  VALUES (?, ?, ?, ?, ?, ?)`;
            await connect.query(sqlCreateProfile, [
              fullName,
              userId,
              document_type || '',
              document_number || '',
              phone || '',
              photo_url || null
            ]);
          }
        }
      }
      
      // Commit the transaction
      await connect.query("COMMIT");
      return { success: true };
    } catch (error) {
      // Rollback in case of error
      await connect.query("ROLLBACK");
      return { error: error.message };
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM owner WHERE Owner_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      if (result.affectedRows === 0) {
        return { error: "Owner not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = `SELECT * FROM owner WHERE Owner_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0] || null;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByUserId(user_id) {
    try {
      let sqlQuery = `SELECT * FROM owner WHERE User_FK_ID = ?`;
      const [result] = await connect.query(sqlQuery, [user_id]);
      return result[0] || null;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async getOwnersWithDetails(includeInactive = false) {
    try {
      let sqlQuery = `
        SELECT 
          o.*,
          u.Users_name,
          u.User_status_FK_ID,
          us.User_status_name,
          p.Profile_fullName,
          p.Profile_document_type,
          p.Profile_document_number,
          p.Profile_telephone_number
        FROM owner o
        JOIN users u ON o.User_FK_ID = u.Users_id
        JOIN user_status us ON u.User_status_FK_ID = us.User_status_id
        LEFT JOIN profile p ON u.Users_id = p.User_FK_ID
        ${!includeInactive ? 'WHERE u.User_status_FK_ID = 1' : ''}
        ORDER BY o.Owner_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async getOwnerWithDetails(id) {
    try {
      let sqlQuery = `
        SELECT 
          o.Owner_id,
          u.Users_name,
          p.Profile_fullName,
          p.Profile_document_number,
          p.Profile_telephone_number,
          o.Owner_is_tenant,
          o.Owner_birth_date,
          o.Owner_createdAt,
          o.Owner_updatedAt
        FROM owner o
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
        LEFT JOIN profile p ON u.Users_id = p.User_FK_ID
        WHERE o.Owner_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0] || null;
    } catch (error) {
      return { error: error.message };
    }
  }

}

export default OwnerModel; 