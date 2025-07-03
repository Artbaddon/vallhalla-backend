import { connect } from "../config/db/connectMysql.js";

class VehicleTypeModel {
  static async findByName(Vehicle_type_name) {
    try {
      const [rows] = await connect.query(
        `SELECT * FROM vehicle_type WHERE Vehicle_type_name = ?`,
        [Vehicle_type_name]
      );
      return rows[0] || null;
    } catch (error) {
      console.error("Error buscando vehicle_type por nombre:", error.message);
      return null;
    }
  }

  static async create({ Vehicle_type_name, vehicle_plate, vehicle_model, vehicle_brand, vehicle_color }) {
    try {
      // Check if vehicle type already exists
      const existing = await this.findByName(Vehicle_type_name);
      if (existing) {
        return { error: "duplicate" };
      }

      const [result] = await connect.query(
        `INSERT INTO vehicle_type (Vehicle_type_name, vehicle_plate, vehicle_model, vehicle_brand, vehicle_color) 
         VALUES (?, ?, ?, ?, ?)`,
        [Vehicle_type_name, vehicle_plate, vehicle_model, vehicle_brand, vehicle_color]
      );
      return { id: result.insertId };
    } catch (error) {
      console.error("Error creando vehicle_type:", error.message);
      if (error.code === 'ER_DUP_ENTRY') {
        return { error: "duplicate" };
      }
      return { error: "database" };
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

  static async update(id, { Vehicle_type_name, vehicle_plate, vehicle_model, vehicle_brand, vehicle_color }) {
    try {
      // Check if new name already exists for a different vehicle type
      if (Vehicle_type_name) {
        const existing = await this.findByName(Vehicle_type_name);
        if (existing && existing.Vehicle_type_id !== parseInt(id)) {
          return { error: "duplicate" };
        }
      }

      const [result] = await connect.query(
        `UPDATE vehicle_type 
         SET Vehicle_type_name = ?, vehicle_plate = ?, vehicle_model = ?, vehicle_brand = ?, vehicle_color = ? 
         WHERE Vehicle_type_id = ?`,
        [Vehicle_type_name, vehicle_plate, vehicle_model, vehicle_brand, vehicle_color, id]
      );
      return { success: result.affectedRows > 0 };
    } catch (error) {
      console.error("Error actualizando vehicle_type:", error.message);
      if (error.code === 'ER_DUP_ENTRY') {
        return { error: "duplicate" };
      }
      return { error: "database" };
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