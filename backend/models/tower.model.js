import { connect } from "../config/db/connectMysql.js";

class towerModel {
  static async create({ Tower_name }) {
    try {
      let sqlQuery = `INSERT INTO tower (Tower_name) VALUES (?)`;
      const [result] = await connect.query(sqlQuery, [Tower_name]);
      return result.insertTower_id;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT * FROM `tower` ORDER BY `Tower_id` ";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
  static async update(Tower_id, { Tower_name }) {
    try {
      let sqlQuery = `UPDATE tower SET Tower_name = ? WHERE Tower_id = ?`;
      const [result] = await connect.query(sqlQuery, [Tower_name, Tower_id]);
      if (result.affectedRows === 0) {
        return { error: "Torre no encontrada" };
      }
      // Return the updated tower
      const [updated] = await connect.query('SELECT * FROM tower WHERE Tower_id = ?', [Tower_id]);
      return updated[0];
    } catch (error) {
      return { error: error.message };
    }
  }

  static async delete(Tower_id) {
    try {
      // First check if there are any apartments in this tower
      const [apartments] = await connect.query(
        `SELECT COUNT(*) as count FROM apartment WHERE Tower_FK_ID = ?`,
        [Tower_id]
      );

      if (apartments[0].count > 0) {
        return { 
          error: "No se puede eliminar la torre porque tiene apartamentos asignados. Debe reasignar o eliminar los apartamentos primero." 
        };
      }

      let sqlQuery = `DELETE FROM tower WHERE Tower_id = ?`;
      const [result] = await connect.query(sqlQuery, [Tower_id]);

      if (result.affectedRows === 0) {
        return { error: "Torre no encontrada" };
      }
      return { success: true, message: "Torre eliminada exitosamente" };
    } catch (error) {
      return { error: error.message };
    }
  }
  static async findByTower_id(Tower_id) {
    try {
      let sqlQuery = `SELECT * FROM tower WHERE Tower_id = ?`;
      const [result] = await connect.query(sqlQuery, Tower_id);

      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default towerModel;
