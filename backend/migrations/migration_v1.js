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
  // Drop tables if exist (in dependency order)
  `DROP TABLE IF EXISTS visitor`,
  `DROP TABLE IF EXISTS apartment`,
  `DROP TABLE IF EXISTS apartment_status`,
  `DROP TABLE IF EXISTS guard`,
  `DROP TABLE IF EXISTS module`,
  `DROP TABLE IF EXISTS module_role`,
  `DROP TABLE IF EXISTS notification`,
  `DROP TABLE IF EXISTS notification_type`,
  `DROP TABLE IF EXISTS owner`,
  `DROP TABLE IF EXISTS parking`,
  `DROP TABLE IF EXISTS parkingstatus`,
  `DROP TABLE IF EXISTS parking_status`,
  `DROP TABLE IF EXISTS parking_type`,
  `DROP TABLE IF EXISTS payment`,
  `DROP TABLE IF EXISTS payment_status`,
  `DROP TABLE IF EXISTS permissions`,
  `DROP TABLE IF EXISTS permissions_module_role`,
  `DROP TABLE IF EXISTS pet`,
  `DROP TABLE IF EXISTS pqrs`,
  `DROP TABLE IF EXISTS pqrs_category`,
  `DROP TABLE IF EXISTS pqrs_tracking`,
  `DROP TABLE IF EXISTS pqrs_tracking_status`,
  `DROP TABLE IF EXISTS profile`,
  `DROP TABLE IF EXISTS questions`,
  `DROP TABLE IF EXISTS question_type`,
  `DROP TABLE IF EXISTS reservation`,
  `DROP TABLE IF EXISTS reservation_status`,
  `DROP TABLE IF EXISTS reservation_type`,
  `DROP TABLE IF EXISTS role`,
  `DROP TABLE IF EXISTS survey`,
  `DROP TABLE IF EXISTS tower`,
  `DROP TABLE IF EXISTS users`,
  `DROP TABLE IF EXISTS user_status`,
  `DROP TABLE IF EXISTS vehicle_type`,

  // Create tables (structure and names as in vallhalladb.sql)
  `CREATE TABLE apartment (
    Apartment_id int(11) NOT NULL AUTO_INCREMENT,
    Owner_FK_ID int(11) NOT NULL,
    PRIMARY KEY (Apartment_id),
    KEY Owner_FK_ID (Owner_FK_ID)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,
   `CREATE TABLE apartment_status (
    Apartment_status_id int(11) NOT NULL AUTO_INCREMENT,
    Apartment_status_name varchar(30) NOT NULL,
    PRIMARY KEY (Apartment_status_id),
    UNIQUE KEY Apartment_status_name (Apartment_status_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE guard (
    Guard_id int(11) NOT NULL AUTO_INCREMENT,
    Guard_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Guard_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE module (
    module_id int(11) NOT NULL AUTO_INCREMENT,
    module_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (module_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE module_role (
    Module_role_id int(11) NOT NULL AUTO_INCREMENT,
    Module_FK_ID int(11) NOT NULL,
    PRIMARY KEY (Module_role_id),
    KEY Module_FK_ID (Module_FK_ID)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE notification (
    Notification_id int(11) NOT NULL AUTO_INCREMENT,
    Notification_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Notification_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE notification_type (
    Notification_type_id int(11) NOT NULL AUTO_INCREMENT,
    Notification_type_name varchar(30) NOT NULL,
    PRIMARY KEY (Notification_type_id),
    UNIQUE KEY Notification_type_name (Notification_type_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE owner (
    Owner_id int(11) NOT NULL AUTO_INCREMENT,
    Owner_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Owner_id)
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
    Parking_createdAt timestamp DEFAULT current_timestamp(),
    Parking_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Parking_id),
    UNIQUE KEY (Parking_number),
    FOREIGN KEY (Parking_status_id) REFERENCES parking_status(Parking_status_id) ON DELETE SET NULL,
    FOREIGN KEY (Parking_type_id) REFERENCES parking_type(Parking_type_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,
  `CREATE TABLE payment (
    payment_id int(11) NOT NULL AUTO_INCREMENT,
    Payment_reference_number varchar(50) DEFAULT NULL,
    PRIMARY KEY (payment_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE payment_status (
    Payment_status_id int(11) NOT NULL AUTO_INCREMENT,
    Payment_status_name varchar(30) NOT NULL,
    PRIMARY KEY (Payment_status_id),
    UNIQUE KEY Payment_status_name (Payment_status_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE permissions (
    Permissions_id int(11) NOT NULL AUTO_INCREMENT,
    Permissions_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Permissions_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE permissions_module_role (
    Permissions_module_role_id int(11) NOT NULL AUTO_INCREMENT,
    Permissions_FK_ID int(11) NOT NULL,
    PRIMARY KEY (Permissions_module_role_id),
    KEY Permissions_FK_ID (Permissions_FK_ID)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE pet (
    Pet_id int(11) NOT NULL AUTO_INCREMENT,
    Pet_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Pet_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE pqrs (
    PQRS_id int(11) NOT NULL AUTO_INCREMENT,
    PQRS_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (PQRS_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE pqrs_category (
    PQRS_category_id int(11) NOT NULL AUTO_INCREMENT,
    PQRS_category_name varchar(30) NOT NULL,
    PRIMARY KEY (PQRS_category_id),
    UNIQUE KEY PQRS_category_name (PQRS_category_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE pqrs_tracking (
    PQRS_tracking_id int(11) NOT NULL AUTO_INCREMENT,
    PQRS_tracking_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (PQRS_tracking_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE pqrs_tracking_status (
    PQRS_tracking_status_id int(11) NOT NULL AUTO_INCREMENT,
    PQRS_tracking_status_name varchar(30) NOT NULL,
    PRIMARY KEY (PQRS_tracking_status_id),
    UNIQUE KEY PQRS_tracking_status_name (PQRS_tracking_status_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE profile (
    Profile_id int(11) NOT NULL AUTO_INCREMENT,
    Profile_photo varchar(255) DEFAULT NULL,
    PRIMARY KEY (Profile_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE questions (
    Questions_id int(11) NOT NULL AUTO_INCREMENT,
    Questions_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Questions_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE question_type (
    Question_type_id int(11) NOT NULL AUTO_INCREMENT,
    Question_type_name varchar(30) NOT NULL,
    PRIMARY KEY (Question_type_id),
    UNIQUE KEY Question_type_name (Question_type_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE reservation (
    Reservation_id int(11) NOT NULL AUTO_INCREMENT,
    Owner_FK_ID int(11) NOT NULL,
    PRIMARY KEY (Reservation_id),
    KEY Owner_FK_ID (Owner_FK_ID)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE reservation_status (
    Reservation_status_id int(11) NOT NULL AUTO_INCREMENT,
    Reservation_status_name varchar(30) NOT NULL,
    PRIMARY KEY (Reservation_status_id),
    UNIQUE KEY Reservation_status_name (Reservation_status_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE reservation_type (
    Reservation_type_id int(11) NOT NULL AUTO_INCREMENT,
    Reservation_type_name varchar(30) NOT NULL,
    PRIMARY KEY (Reservation_type_id),
    UNIQUE KEY Reservation_type_name (Reservation_type_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE role (
    Role_id int(11) NOT NULL AUTO_INCREMENT,
    Role_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    Role_name varchar(50),
    PRIMARY KEY (Role_id),
    UNIQUE KEY Role_name (Role_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE survey (
    Survey_id int(11) NOT NULL AUTO_INCREMENT,
    Survey_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Survey_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE tower (
    Tower_id int(11) NOT NULL AUTO_INCREMENT,
    Tower_name varchar(30) NOT NULL,
    PRIMARY KEY (Tower_id),
    UNIQUE KEY Tower_name (Tower_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE users (
    Users_id int(11) NOT NULL AUTO_INCREMENT,
    Users_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Users_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE user_status (
    User_status_id int(11) NOT NULL AUTO_INCREMENT,
    User_status_name varchar(30) NOT NULL,
    PRIMARY KEY (User_status_id),
    UNIQUE KEY User_status_name (User_status_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE vehicle_type (
    Vehicle_type_id int(11) NOT NULL AUTO_INCREMENT,
    vehicle_engineCC varchar(30) DEFAULT NULL,
    PRIMARY KEY (Vehicle_type_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE visitor (
    ID int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    host int(11),
    FOREIGN KEY (host) REFERENCES owner (Owner_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `INSERT INTO apartment_status (Apartment_status_name) VALUES ('Available'), ('Occupied');`,
  // Insert a user first, then insert guard referencing that user
  `INSERT INTO parking (Parking_updatedAt) VALUES (NOW());`,
  `INSERT INTO parking_status (Parking_status_name) VALUES ('Inactive'), ('Free'), ('Occupied');`,
  `INSERT INTO parking_type (Parking_type_name) VALUES ('Car'), ('Bike');`,
];
// --- STORED PROCEDURES ---
sqlStatements.push(
  // Example: Simple CRUD/listing SPs for a few tables
  // Apartment: List all
  `DROP PROCEDURE IF EXISTS sp_list_apartments;`,
  `CREATE PROCEDURE sp_list_apartments() BEGIN SELECT * FROM apartment; END;`,
  // Owner: Insert
  `DROP PROCEDURE IF EXISTS sp_insert_owner;`,
  `CREATE PROCEDURE sp_insert_owner() BEGIN INSERT INTO owner (Owner_updatedAt) VALUES (NOW()); END;`,
  // Reservation: List all
  `DROP PROCEDURE IF EXISTS sp_list_reservations;`,
  `CREATE PROCEDURE sp_list_reservations() BEGIN SELECT * FROM reservation; END;`,
  // User status: List all
  `DROP PROCEDURE IF EXISTS sp_list_user_status;`,
  `CREATE PROCEDURE sp_list_user_status() BEGIN SELECT * FROM user_status; END;`,
  // Insert a new pet
  `DROP PROCEDURE IF EXISTS sp_insert_pet;`,
  `CREATE PROCEDURE sp_insert_pet() BEGIN INSERT INTO pet (Pet_updatedAt) VALUES (NOW()); END;`,
  // List all modules
  `DROP PROCEDURE IF EXISTS sp_list_modules;`,
  `CREATE PROCEDURE sp_list_modules() BEGIN SELECT * FROM module; END;`,
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
