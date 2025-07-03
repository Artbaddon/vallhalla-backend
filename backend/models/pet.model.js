import { connect } from "../config/db/connectMysql.js";

class PetModel {
  static async create({ name, species, breed, vaccination_card, photo, owner_id }) {
    try {
      const [result] = await connect.query(
        "INSERT INTO pet (Pet_name, Pet_species, Pet_Breed, Pet_vaccination_card, Pet_Photo, Owner_FK_ID) VALUES (?, ?, ?, ?, ?, ?)",
        [name, species, breed, vaccination_card, photo, owner_id]
      );
      return result.insertId;
    } catch (error) {
      console.error("Error creating pet:", error.message);
      throw error;
    }
  }

  static async show() {
    const [rows] = await connect.query(
      'SELECT * FROM pet ORDER BY Pet_id'
    );
    return rows;
  }

  static async update(id, { name, species, breed, vaccination_card, photo, owner_id }) {
    try {
      const [result] = await connect.query(
        `UPDATE pet 
             SET 
                Pet_name = ?, 
                Pet_species = ?, 
                Pet_Breed = ?, 
                Pet_vaccination_card = ?, 
                Pet_Photo = ?, 
                Owner_FK_ID = ?
             WHERE Pet_id = ?`,
        [name, species, breed, vaccination_card, photo, owner_id, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error updating pet:", error.message);
      throw error;
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = "DELETE FROM pet WHERE Pet_id=?";
      const [result] = await connect.query(sqlQuery, id);
      if (result.affectedRows === 0) {
        return [0];
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await connect.query(
        "SELECT * FROM pet WHERE Pet_id = ?", 
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error("Error finding pet by ID:", error.message);
      throw error;
    }
  }

  // Find owner by user ID
  static async findOwnerByUserId(userId) {
    try {
      const [rows] = await connect.query(
        `SELECT o.* 
         FROM owner o
         WHERE o.User_FK_ID = ?`,
        [userId]
      );
      return rows[0];
    } catch (error) {
      console.error("Error finding owner by user ID:", error.message);
      throw error;
    }
  }

  // Find pets by owner ID
  static async findByOwner(ownerId) {
    try {
      const [rows] = await connect.query(
        `SELECT p.*
         FROM pet p
         WHERE p.Owner_FK_ID = ?`,
        [ownerId]
      );
      return rows;
    } catch (error) {
      console.error("Error finding pets by owner:", error.message);
      throw error;
    }
  }
}

export default PetModel;