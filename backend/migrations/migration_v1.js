import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "crud_node",
  multipleStatements: true,
};

const sqlStatements = [
  
  `DROP TABLE IF EXISTS parking`,
  `DROP TABLE IF EXISTS vehicle_type`,
  `DROP TABLE IF EXISTS owner`,
  `DROP TABLE IF EXISTS parkingstatus`,
  `DROP TABLE IF EXISTS parking_status`,
  `DROP TABLE IF EXISTS parking_type`,

  //create table

    `CREATE TABLE vehicle_type (
    Vehicle_type_id int(11) NOT NULL AUTO_INCREMENT,
    Vehicle_name varchar(30) NOT NULL,
    Vehicle_number varchar(30) NOT NULL,
    Owner varchar(50),
    PRIMARY KEY (Vehicle_type_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE parking_status (
    Parking_status_id int(11) NOT NULL AUTO_INCREMENT,
    Parking_status_name varchar(30) NOT NULL,
    PRIMARY KEY (Parking_status_id),
    UNIQUE KEY Parking_status_name (Parking_status_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE parking_type (
    Parking_type_id int(11) NOT NULL AUTO_INCREMENT,
    Parking_type_name varchar(30) NOT NULL,
    PRIMARY KEY (Parking_type_id),
    UNIQUE KEY Parking_type_name (Parking_type_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

   `CREATE TABLE parking (
    Parking_id int(11) NOT NULL AUTO_INCREMENT,
    Parking_number varchar(20) NOT NULL,
    Parking_status_id int(11),
    Parking_type_id int(11),
    Vehicle_type_id int(11),
    Parking_createdAt timestamp DEFAULT current_timestamp(),
    Parking_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Parking_id),
    UNIQUE KEY (Parking_number),
    FOREIGN KEY (Parking_status_id) REFERENCES parking_status(Parking_status_id) ON DELETE SET NULL,
    FOREIGN KEY (Parking_type_id) REFERENCES parking_type(Parking_type_id) ON DELETE SET NULL,
    FOREIGN KEY (Vehicle_type_id) REFERENCES vehicle_type(Vehicle_type_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert a user first, then insert guard referencing that user
  `INSERT INTO parking (Parking_updatedAt) VALUES (NOW());`,
  `INSERT INTO parking_status (Parking_status_name) VALUES ('Inactive'), ('Free'), ('Occupied');`,
  `INSERT INTO parking_type (Parking_type_name) VALUES ('Car'), ('Bike');`,
];
// --- STORED PROCEDURES ---
sqlStatements.push(
  // Example: Simple CRUD/listing SPs for a few tables
  // List parkings with details
  `DROP PROCEDURE IF EXISTS sp_list_parkings_with_details;`,
  `CREATE PROCEDURE sp_list_parkings_with_details()
   BEGIN
    SELECT 
        p.Parking_id,
        p.Parking_number,
        pt.Parking_type_name AS type,
        ps.Parking_status_name AS status,
        p.Parking_createdAt,
        p.Parking_updatedAt
    FROM 
        parking p
    LEFT JOIN parking_type pt ON p.Parking_type_id = pt.Parking_type_id
    LEFT JOIN parking_status ps ON p.Parking_status_id = ps.Parking_status_id
    ORDER BY p.Parking_number;
   END;`,
  // Get parking by ID
  `DROP PROCEDURE IF EXISTS sp_get_parking_by_id;`,
  `CREATE PROCEDURE sp_get_parking_by_id(IN p_parking_id INT)
   BEGIN
    SELECT 
        p.Parking_id,
        p.Parking_number,
        p.Parking_type_id,
        pt.Parking_type_name AS type_name,
        p.Parking_status_id,
        ps.Parking_status_name AS status_name,
        p.Parking_createdAt,
        p.Parking_updatedAt
    FROM 
        parking p
    LEFT JOIN parking_type pt ON p.Parking_type_id = pt.Parking_type_id
    LEFT JOIN parking_status ps ON p.Parking_status_id = ps.Parking_status_id
    WHERE 
        p.Parking_id = p_parking_id;
   END;`
);

export async function runMigration() {
  let conecction;
  try {
    conecction = await mysql.createConnection(dbConfig);
    console.log("coneccted to MySQL database");

    for (const sql of sqlStatements) {
      try {
        await conecction.query(sql);
        console.log("Executed SQL statement succesfully");
      } catch (error) {
        console.error("Error executing SQL:", error.message);
        throw error;
      }
    }

    console.log("Database migration completed succesfully!");
    return { success: true };
  } catch (error) {
    console.error("Migration failed:", error);
    return { success: false, error };
  } finally {
    if (conecction) {
      await conecction.end();
      console.log("Database conecction closed");
    }
  }
}
