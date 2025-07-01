import { connect } from "../config/db/connectMysql.js";

class VehicleTypeModel {
  static async create({ Vehicle_name, Vehicle_number, Owner }) {
    try {
      const [result] = await connect.query(
        `INSERT INTO vehicle_type (Vehicle_name, Vehicle_number, Owner) VALUES (?, ?, ?)`,
        [Vehicle_name, Vehicle_number, Owner]
      );
      return result.insertId;
    } catch (error) {
      console.error("Error creando vehicle_type:", error.message);
      return null;
    }
  }

  static async findAll() {
    try {
      const [rows] = await connect.query(`SELECT * FROM vehicle_type`);
      return rows;
    } catch (error) {
      console.error("Error obteniendo vehicle_types:", error.message);
      return [];
    }
  }

  static async findById(id) {
    try {
      const [rows] = await connect.query(
        `SELECT * FROM vehicle_type WHERE Vehicle_type_id = ?`,
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Error buscando vehicle_type por id:", error.message);
      return null;
    }
  }

  static async update(id, { Vehicle_name, Vehicle_number, Owner }) {
    try {
      const [result] = await connect.query(
        `UPDATE vehicle_type SET Vehicle_name = ?, Vehicle_number = ?, Owner = ? WHERE Vehicle_type_id = ?`,
        [Vehicle_name, Vehicle_number, Owner, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error actualizando vehicle_type:", error.message);
      return false;
    }
  }

  static async delete(id) {
    try {
      const [result] = await connect.query(
        `DELETE FROM vehicle_type WHERE Vehicle_type_id = ?`,
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error("Error eliminando vehicle_type:", error.message);
      return false;
    }
  }
}

export default VehicleTypeModel;