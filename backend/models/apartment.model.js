import { connect } from "../config/db/connectMysql.js";

class ApartmentModel {
  static async create({ apartment_number, status_id, tower_id, owner_id }) {
    try {
      let sqlQuery = `INSERT INTO apartment (Apartment_number, Apartment_status_FK_ID, Tower_FK_ID, Owner_FK_ID) VALUES (?, ?, ?, ?)`;
      const [result] = await connect.query(sqlQuery, [apartment_number, status_id, tower_id, owner_id]);
      return result.insertId;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async show() {
    try {
      let sqlQuery = "SELECT * FROM apartment ORDER BY Apartment_id";
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async update(id, { apartment_number, status_id, tower_id, owner_id }) {
    try {
      let sqlQuery = "UPDATE apartment SET Apartment_number = ?, Apartment_status_FK_ID = ?, Tower_FK_ID = ?, Owner_FK_ID = ? WHERE Apartment_id = ?";
      const [result] = await connect.query(sqlQuery, [apartment_number, status_id, tower_id, owner_id, id]);
      if (result.affectedRows === 0) {
        return { error: "Apartment not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async delete(id) {
    try {
      let sqlQuery = `DELETE FROM apartment WHERE Apartment_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      if (result.affectedRows === 0) {
        return { error: "Apartment not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findById(id) {
    try {
      let sqlQuery = `SELECT * FROM apartment WHERE Apartment_id = ?`;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0] || null;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByNumber(apartment_number) {
    try {
      let sqlQuery = `SELECT * FROM apartment WHERE Apartment_number = ?`;
      const [result] = await connect.query(sqlQuery, [apartment_number]);
      return result[0] || null;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByOwner(owner_id) {
    try {
      let sqlQuery = `SELECT * FROM apartment WHERE Owner_FK_ID = ?`;
      const [result] = await connect.query(sqlQuery, [owner_id]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByStatus(status_id) {
    try {
      let sqlQuery = `SELECT * FROM apartment WHERE Apartment_status_FK_ID = ?`;
      const [result] = await connect.query(sqlQuery, [status_id]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async findByTower(tower_id) {
    try {
      let sqlQuery = `SELECT * FROM apartment WHERE Tower_FK_ID = ?`;
      const [result] = await connect.query(sqlQuery, [tower_id]);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async getApartmentsWithDetails() {
    try {
      let sqlQuery = `
        SELECT 
          a.Apartment_id,
          a.Apartment_number,
          ast.Apartment_status_name,
          t.Tower_name,
          o.Owner_id,
          p.Profile_fullName as owner_name
        FROM apartment a
        LEFT JOIN apartment_status ast ON a.Apartment_status_FK_ID = ast.Apartment_status_id
        LEFT JOIN tower t ON a.Tower_FK_ID = t.Tower_id
        LEFT JOIN owner o ON a.Owner_FK_ID = o.Owner_id
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
        LEFT JOIN profile p ON u.Users_id = p.User_FK_ID
        ORDER BY a.Apartment_id
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async getApartmentWithDetails(id) {
    try {
      let sqlQuery = `
        SELECT 
          a.Apartment_id,
          a.Apartment_number,
          ast.Apartment_status_name,
          t.Tower_name,
          o.Owner_id,
          p.Profile_fullName as owner_name
        FROM apartment a
        LEFT JOIN apartment_status ast ON a.Apartment_status_FK_ID = ast.Apartment_status_id
        LEFT JOIN tower t ON a.Tower_FK_ID = t.Tower_id
        LEFT JOIN owner o ON a.Owner_FK_ID = o.Owner_id
        LEFT JOIN users u ON o.User_FK_ID = u.Users_id
        LEFT JOIN profile p ON u.Users_id = p.User_FK_ID
        WHERE a.Apartment_id = ?
      `;
      const [result] = await connect.query(sqlQuery, [id]);
      return result[0] || null;
    } catch (error) {
      return { error: error.message };
    }
  }

  static async updateStatus(id, status_id) {
    try {
      let sqlQuery = "UPDATE apartment SET Apartment_status_FK_ID = ? WHERE Apartment_id = ?";
      const [result] = await connect.query(sqlQuery, [status_id, id]);
      if (result.affectedRows === 0) {
        return { error: "Apartment not found" };
      } else {
        return result.affectedRows;
      }
    } catch (error) {
      return { error: error.message };
    }
  }

  static async getOccupancyReport() {
    try {
      let sqlQuery = `
        SELECT 
          t.Tower_name,
          ast.Apartment_status_name,
          COUNT(*) as apartment_count
        FROM apartment a
        LEFT JOIN tower t ON a.Tower_FK_ID = t.Tower_id
        LEFT JOIN apartment_status ast ON a.Apartment_status_FK_ID = ast.Apartment_status_id
        GROUP BY t.Tower_id, ast.Apartment_status_id
        ORDER BY t.Tower_name, ast.Apartment_status_name
      `;
      const [result] = await connect.query(sqlQuery);
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
}

export default ApartmentModel; 