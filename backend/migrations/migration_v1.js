import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "vallhalladb",
  multipleStatements: true,
};

const sqlStatements = [
  // Add missing guard table after users table is created
  // (will insert this later in the array)
  `DROP DATABASE IF EXISTS ${dbConfig.database};`,
  `CREATE DATABASE IF NOT EXISTS ${dbConfig.database} DEFAULT CHARACTER SET utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
  `USE ${dbConfig.database};`,
  // Add missing apartment_status table after DB is created
  `CREATE TABLE apartment_status (
    Apartment_status_id int(11) NOT NULL AUTO_INCREMENT,
    Apartment_status_name varchar(30) NOT NULL,
    PRIMARY KEY (Apartment_status_id),
    UNIQUE KEY Apartment_status_name (Apartment_status_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,
  // Add missing module table
  `CREATE TABLE module (
    Module_id int(11) NOT NULL AUTO_INCREMENT,
    module_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Module_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  // Add missing module_role table
  `CREATE TABLE module_role (
    Module_role_id int(11) NOT NULL AUTO_INCREMENT,
    Module_FK_ID int(11) NOT NULL,
    PRIMARY KEY (Module_role_id),
    KEY Module_FK_ID (Module_FK_ID),
    CONSTRAINT fk_module_role_module FOREIGN KEY (Module_FK_ID) REFERENCES module (Module_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  // Add missing notification table
  `CREATE TABLE notification (
    Notification_id int(11) NOT NULL AUTO_INCREMENT,
    Notification_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Notification_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  // Add missing notification_type table
  `CREATE TABLE notification_type (
    Notification_type_id int(11) NOT NULL AUTO_INCREMENT,
    Notification_type_name varchar(30) NOT NULL,
    PRIMARY KEY (Notification_type_id),
    UNIQUE KEY Notification_type_name (Notification_type_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  // Add missing parking table
  `CREATE TABLE parking (
    Parking_id int(11) NOT NULL AUTO_INCREMENT,
    Parking_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Parking_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  // Add missing parkingstatus table
  `CREATE TABLE parkingstatus (
    status_id int(11) NOT NULL AUTO_INCREMENT,
    status_name varchar(30) NOT NULL,
    PRIMARY KEY (status_id),
    UNIQUE KEY status_name (status_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  // Add missing parking_status table
  `CREATE TABLE parking_status (
    Parking_status_id int(11) NOT NULL AUTO_INCREMENT,
    Parking_status_name varchar(30) NOT NULL,
    PRIMARY KEY (Parking_status_id),
    UNIQUE KEY Parking_status_name (Parking_status_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,
  // Now create all tables in the new DB, in dependency order
  `CREATE TABLE owner (
    Owner_id int(11) NOT NULL AUTO_INCREMENT,
    Owner_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Owner_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE apartment (
    Apartment_id int(11) NOT NULL AUTO_INCREMENT,
    Owner_FK_ID int(11) NOT NULL,
    Apartment_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Apartment_id),
    KEY Owner_FK_ID (Owner_FK_ID),
    CONSTRAINT fk_apartment_owner FOREIGN KEY (Owner_FK_ID) REFERENCES owner (Owner_id)
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
    KEY Permissions_FK_ID (Permissions_FK_ID),
    CONSTRAINT fk_permissions FOREIGN KEY (Permissions_FK_ID) REFERENCES permissions (Permissions_id)
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
    KEY Owner_FK_ID (Owner_FK_ID),
    CONSTRAINT fk_reservation_owner FOREIGN KEY (Owner_FK_ID) REFERENCES owner (Owner_id)
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
    Role_name varchar(50) NOT NULL,
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

  // Add missing guard table after users table is created
  `CREATE TABLE guard (
    Guard_id int(11) NOT NULL AUTO_INCREMENT,
    User_FK_ID int(11) NOT NULL,
    Guard_arl varchar(30) NOT NULL,
    Guard_eps varchar(30) NOT NULL,
    Guard_shift varchar(30) NOT NULL,
    Guard_createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    Guard_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Guard_id),
    KEY User_FK_ID (User_FK_ID),
    CONSTRAINT fk_guard_user FOREIGN KEY (User_FK_ID) REFERENCES users (Users_id)
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
    CONSTRAINT fk_visitor_host FOREIGN KEY (host) REFERENCES owner (Owner_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `INSERT INTO apartment_status (Apartment_status_name) VALUES ('Available'), ('Occupied');`,
  // Insert a user first, then insert guard referencing that user
  `INSERT INTO users (Users_updatedAt) VALUES (NOW());`,
  `INSERT INTO guard (User_FK_ID, Guard_arl, Guard_eps, Guard_shift, Guard_createdAt, Guard_updatedAt) VALUES (LAST_INSERT_ID(), 'ARL Example', 'EPS Example', 'Day', NOW(), NOW());`,
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
  `INSERT INTO visitor (host) VALUES (1);`,

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
];

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
