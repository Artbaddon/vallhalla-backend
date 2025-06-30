import { connect } from "../config/db/connectMysql.js";

class SurveyModel {
  static async create({ number, status_id, type_id }) {
    try {
      const [result] = await connect.query(
        "INSERT INTO parking (Parking_number, Parking_status_id, Parking_type_id) VALUES (?, ?, ?)",
        [number, status_id, type_id]
      );
      return result.insertId; // Retorna solo el ID insertado
    } catch (error) {
      console.error("Error creating parking:", error.message);
      return null;
    }
  }

  static async show() {
    try {
      const [parkings] = await connect.query(
        "CALL sp_list_parkings_with_details()"
      );
      return parkings[0];
    } catch (error) {
      console.error("Error en ParkingModel.show:", error.message);
      return []; // Retornar array vacío en lugar de [0] para consistencia
    }
  }

  static async update(id, { number, type_id, status_id }) {
    try {
      const [result] = await connect.query(
        `UPDATE parking 
             SET 
                Parking_number = ?,
                Parking_type_id = ?,
                Parking_status_id = ?,
                Parking_updatedAt = CURRENT_TIMESTAMP
             WHERE Parking_id = ?`,
        [number, type_id, status_id, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error updating parking:", error.message);
      return false;
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = "DELETE FROM parking WHERE Parking_id=?";
      const [result] = await connect.query(sqlQuery, id);
      if (result.affectedRows === 0) {
        return [0];
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return [0];
    }
  }

  static async findById(id) {
    try {
      const [result] = await connect.query("CALL sp_get_parking_by_id(?)", [
        id,
      ]);
      return result[0][0] || null;
    } catch (error) {
      console.error("Error finding parking by ID:", error.message);
      return null;
    }
  }
}

export default SurveyModel;