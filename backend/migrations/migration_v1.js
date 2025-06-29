// Add indexes, auto-increment, and foreign keys as in the MySQL dump
sqlStatements.push(
  // Indexes and auto-increment
  `ALTER TABLE apartment MODIFY Apartment_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE apartment ADD PRIMARY KEY (Apartment_id), ADD KEY Owner_FK_ID (Owner_FK_ID);`,
  `ALTER TABLE apartment_status MODIFY Apartment_status_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE apartment_status ADD PRIMARY KEY (Apartment_status_id), ADD UNIQUE KEY Apartment_status_name (Apartment_status_name);`,
  `ALTER TABLE guard MODIFY Guard_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE guard ADD PRIMARY KEY (Guard_id);`,
  `ALTER TABLE module MODIFY module_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE module ADD PRIMARY KEY (module_id);`,
  `ALTER TABLE module_role MODIFY Module_role_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE module_role ADD PRIMARY KEY (Module_role_id), ADD KEY Module_FK_ID (Module_FK_ID);`,
  `ALTER TABLE notification MODIFY Notification_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE notification ADD PRIMARY KEY (Notification_id);`,
  `ALTER TABLE notification_type MODIFY Notification_type_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE notification_type ADD PRIMARY KEY (Notification_type_id), ADD UNIQUE KEY Notification_type_name (Notification_type_name);`,
  `ALTER TABLE owner MODIFY Owner_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE owner ADD PRIMARY KEY (Owner_id);`,
  `ALTER TABLE parking MODIFY Parking_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE parking ADD PRIMARY KEY (Parking_id);`,
  `ALTER TABLE parkingstatus MODIFY id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE parkingstatus ADD PRIMARY KEY (id);`,
  `ALTER TABLE parking_status MODIFY Parking_status_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE parking_status ADD PRIMARY KEY (Parking_status_id), ADD UNIQUE KEY Parking_status_name (Parking_status_name);`,
  `ALTER TABLE parking_type MODIFY Parking_type_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE parking_type ADD PRIMARY KEY (Parking_type_id), ADD UNIQUE KEY Parking_type_name (Parking_type_name);`,
  `ALTER TABLE payment MODIFY payment_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE payment ADD PRIMARY KEY (payment_id);`,
  `ALTER TABLE payment_status MODIFY Payment_status_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE payment_status ADD PRIMARY KEY (Payment_status_id), ADD UNIQUE KEY Payment_status_name (Payment_status_name);`,
  `ALTER TABLE permissions MODIFY Permissions_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE permissions ADD PRIMARY KEY (Permissions_id);`,
  `ALTER TABLE permissions_module_role MODIFY Permissions_module_role_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE permissions_module_role ADD PRIMARY KEY (Permissions_module_role_id), ADD KEY Permissions_FK_ID (Permissions_FK_ID);`,
  `ALTER TABLE pet MODIFY Pet_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE pet ADD PRIMARY KEY (Pet_id);`,
  `ALTER TABLE pqrs MODIFY PQRS_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE pqrs ADD PRIMARY KEY (PQRS_id);`,
  `ALTER TABLE pqrs_category MODIFY PQRS_category_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE pqrs_category ADD PRIMARY KEY (PQRS_category_id), ADD UNIQUE KEY PQRS_category_name (PQRS_category_name);`,
  `ALTER TABLE pqrs_tracking MODIFY PQRS_tracking_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE pqrs_tracking ADD PRIMARY KEY (PQRS_tracking_id);`,
  `ALTER TABLE pqrs_tracking_status MODIFY PQRS_tracking_status_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE pqrs_tracking_status ADD PRIMARY KEY (PQRS_tracking_status_id), ADD UNIQUE KEY PQRS_tracking_status_name (PQRS_tracking_status_name);`,
  `ALTER TABLE profile MODIFY Profile_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE profile ADD PRIMARY KEY (Profile_id);`,
  `ALTER TABLE questions MODIFY Questions_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE questions ADD PRIMARY KEY (Questions_id);`,
  `ALTER TABLE question_type MODIFY Question_type_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE question_type ADD PRIMARY KEY (Question_type_id), ADD UNIQUE KEY Question_type_name (Question_type_name);`,
  `ALTER TABLE reservation MODIFY Reservation_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE reservation ADD PRIMARY KEY (Reservation_id), ADD KEY Owner_FK_ID (Owner_FK_ID);`,
  `ALTER TABLE reservation_status MODIFY Reservation_status_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE reservation_status ADD PRIMARY KEY (Reservation_status_id), ADD UNIQUE KEY Reservation_status_name (Reservation_status_name);`,
  `ALTER TABLE reservation_type MODIFY Reservation_type_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE reservation_type ADD PRIMARY KEY (Reservation_type_id), ADD UNIQUE KEY Reservation_type_name (Reservation_type_name);`,
  `ALTER TABLE role MODIFY Role_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE role ADD PRIMARY KEY (Role_id), ADD UNIQUE KEY Role_name (Role_name);`,
  `ALTER TABLE survey MODIFY Survey_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE survey ADD PRIMARY KEY (Survey_id);`,
  `ALTER TABLE tower MODIFY Tower_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE tower ADD PRIMARY KEY (Tower_id), ADD UNIQUE KEY Tower_name (Tower_name);`,
  `ALTER TABLE users MODIFY Users_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE users ADD PRIMARY KEY (Users_id);`,
  `ALTER TABLE user_status MODIFY User_status_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE user_status ADD PRIMARY KEY (User_status_id), ADD UNIQUE KEY User_status_name (User_status_name);`,
  `ALTER TABLE vehicle_type MODIFY Vehicle_type_id int(11) NOT NULL AUTO_INCREMENT;`,
  `ALTER TABLE vehicle_type ADD PRIMARY KEY (Vehicle_type_id);`,
  `ALTER TABLE visitor ADD PRIMARY KEY (ID), ADD FOREIGN KEY (host) REFERENCES owner (Owner_id);`
);
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
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`

  `CREATE TABLE apartment_status (
    Apartment_status_id int(11) NOT NULL AUTO_INCREMENT,
    Apartment_status_name varchar(30) NOT NULL,
    PRIMARY KEY (Apartment_status_id),
    UNIQUE KEY Apartment_status_name (Apartment_status_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`
];

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

  `CREATE TABLE parking (
    Parking_id int(11) NOT NULL AUTO_INCREMENT,
    Parking_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Parking_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE parkingstatus (
    id int(11) NOT NULL AUTO_INCREMENT,
    status_name varchar(30) NOT NULL,
    PRIMARY KEY (id)
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
// --- DUMMY DATA INSERTS ---
sqlStatements.push(
  `INSERT INTO apartment_status (Apartment_status_name) VALUES ('Available'), ('Occupied');`,
  `INSERT INTO guard (Guard_updatedAt) VALUES (NOW());`,
  `INSERT INTO module (module_updatedAt) VALUES (NOW());`,
  `INSERT INTO module_role (Module_FK_ID) VALUES (1);`,
  `INSERT INTO notification (Notification_updatedAt) VALUES (NOW());`,
  `INSERT INTO notification_type (Notification_type_name) VALUES ('General'), ('Alert');`,
  `INSERT INTO owner (Owner_updatedAt) VALUES (NOW());`,
  `INSERT INTO apartment (Owner_FK_ID) VALUES (1);`,
  `INSERT INTO parking (Parking_updatedAt) VALUES (NOW());`,
  `INSERT INTO parkingstatus (status_name) VALUES ('Free'), ('Occupied');`,
  `INSERT INTO parking_status (Parking_status_name) VALUES ('Active'), ('Inactive');`,
  `INSERT INTO parking_type (Parking_type_name) VALUES ('Car'), ('Bike');`,
  `INSERT INTO payment (Payment_reference_number) VALUES ('REF123');`,
  `INSERT INTO payment_status (Payment_status_name) VALUES ('Paid'), ('Pending');`,
  `INSERT INTO permissions (Permissions_updatedAt) VALUES (NOW());`,
  `INSERT INTO permissions_module_role (Permissions_FK_ID) VALUES (1);`,
  `INSERT INTO pet (Pet_updatedAt) VALUES (NOW());`,
  `INSERT INTO pqrs (PQRS_updatedAt) VALUES (NOW());`,
  `INSERT INTO pqrs_category (PQRS_category_name) VALUES ('Complaint'), ('Request');`,
  `INSERT INTO pqrs_tracking (PQRS_tracking_updatedAt) VALUES (NOW());`,
  `INSERT INTO pqrs_tracking_status (PQRS_tracking_status_name) VALUES ('Open'), ('Closed');`,
  `INSERT INTO profile (Profile_photo) VALUES ('photo1.jpg');`,
  `INSERT INTO questions (Questions_updatedAt) VALUES (NOW());`,
  `INSERT INTO question_type (Question_type_name) VALUES ('Yes/No'), ('Multiple Choice');`,
  `INSERT INTO reservation_status (Reservation_status_name) VALUES ('Confirmed'), ('Cancelled');`,
  `INSERT INTO reservation_type (Reservation_type_name) VALUES ('Room'), ('Parking');`,
  `INSERT INTO role (Role_updatedAt) VALUES (NOW());`,
  `INSERT INTO survey (Survey_updatedAt) VALUES (NOW());`,
  `INSERT INTO tower (Tower_name) VALUES ('North'), ('South');`,
  `INSERT INTO users (Users_updatedAt) VALUES (NOW());`,
  `INSERT INTO user_status (User_status_name) VALUES ('Active'), ('Inactive');`,
  `INSERT INTO vehicle_type (vehicle_engineCC) VALUES ('2000cc'), ('150cc');`,
  `INSERT INTO reservation (Owner_FK_ID) VALUES (1);`,
  `INSERT INTO visitor (host) VALUES (1);`
);

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
  `CREATE PROCEDURE sp_list_modules() BEGIN SELECT * FROM module; END;`
);
// ...existing code...


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
