import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "vallhalladb",
  multipleStatements: true,
};

console.log("Starting migration...");

const sqlStatements = [
  // Drop and recreate database
  `DROP DATABASE IF EXISTS ${dbConfig.database};`,
  `CREATE DATABASE IF NOT EXISTS ${dbConfig.database} DEFAULT CHARACTER SET utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
  `USE ${dbConfig.database};`,

  // Create base tables first (no foreign keys)
  `CREATE TABLE user_status (
    User_status_id int(11) NOT NULL AUTO_INCREMENT,
    User_status_name varchar(30) NOT NULL,
    PRIMARY KEY (User_status_id),
    UNIQUE KEY User_status_name (User_status_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE role (
    Role_id int(11) NOT NULL AUTO_INCREMENT,
    Role_name varchar(50) NOT NULL,
    Role_description text NOT NULL,
    Role_createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    Role_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Role_id),
    UNIQUE KEY Role_name (Role_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE users (
    Users_id int(11) NOT NULL AUTO_INCREMENT,
    Users_name varchar(50) NOT NULL,
    Users_password varchar(255) NOT NULL,
    User_status_FK_ID int(11) NOT NULL,
    Role_FK_ID int(11) NOT NULL,
    Users_createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    Users_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Users_id),
    UNIQUE KEY Users_name (Users_name),
    KEY User_status_FK_ID (User_status_FK_ID),
    KEY Role_FK_ID (Role_FK_ID),
    CONSTRAINT fk_users_status FOREIGN KEY (User_status_FK_ID) REFERENCES user_status (User_status_id),
    CONSTRAINT fk_users_role FOREIGN KEY (Role_FK_ID) REFERENCES role (Role_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE profile (
    Profile_id int(11) NOT NULL AUTO_INCREMENT,
    Profile_fullName varchar(100) NOT NULL,
    User_FK_ID int(11) NOT NULL,
    Profile_document_type varchar(20) NOT NULL,
    Profile_document_number varchar(30) NOT NULL,
    Profile_telephone_number varchar(12) NOT NULL,
    Profile_photo varchar(255) DEFAULT NULL,
    PRIMARY KEY (Profile_id),
    KEY User_FK_ID (User_FK_ID),
    CONSTRAINT fk_profile_user FOREIGN KEY (User_FK_ID) REFERENCES users (Users_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE owner (
    Owner_id int(11) NOT NULL AUTO_INCREMENT,
    User_FK_ID int(11) NOT NULL,
    Owner_is_tenant tinyint(1) NOT NULL,
    Owner_birth_date datetime NOT NULL,
    Owner_createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    Owner_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Owner_id),
    KEY User_FK_ID (User_FK_ID),
    CONSTRAINT fk_owner_user FOREIGN KEY (User_FK_ID) REFERENCES users (Users_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE tower (
    Tower_id int(11) NOT NULL AUTO_INCREMENT,
    Tower_name varchar(30) NOT NULL,
    PRIMARY KEY (Tower_id),
    UNIQUE KEY Tower_name (Tower_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE apartment_status (
    Apartment_status_id int(11) NOT NULL AUTO_INCREMENT,
    Apartment_status_name varchar(30) NOT NULL,
    PRIMARY KEY (Apartment_status_id),
    UNIQUE KEY Apartment_status_name (Apartment_status_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE apartment (
    Apartment_id int(11) NOT NULL AUTO_INCREMENT,
    Apartment_number varchar(4) NOT NULL,
    Apartment_status_FK_ID int(11) NOT NULL,
    Tower_FK_ID int(11) NOT NULL,
    Owner_FK_ID int(11) NOT NULL,
    PRIMARY KEY (Apartment_id),
    KEY Apartment_status_FK_ID (Apartment_status_FK_ID),
    KEY Tower_FK_ID (Tower_FK_ID),
    KEY Owner_FK_ID (Owner_FK_ID),
    CONSTRAINT fk_apartment_status FOREIGN KEY (Apartment_status_FK_ID) REFERENCES apartment_status (Apartment_status_id),
    CONSTRAINT fk_apartment_tower FOREIGN KEY (Tower_FK_ID) REFERENCES tower (Tower_id),
    CONSTRAINT fk_apartment_owner FOREIGN KEY (Owner_FK_ID) REFERENCES owner (Owner_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

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

  `CREATE TABLE visitor (
    ID int(11) NOT NULL AUTO_INCREMENT,
    name varchar(255) NOT NULL,
    documentNumber varchar(15) NOT NULL,
    host int(11) NOT NULL,
    enter_date datetime NOT NULL,
    exit_date datetime DEFAULT NULL,
    PRIMARY KEY (ID),
    KEY host (host),
    CONSTRAINT fk_visitor_host FOREIGN KEY (host) REFERENCES owner (Owner_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE module (
    module_id int(11) NOT NULL AUTO_INCREMENT,
    module_name varchar(30) NOT NULL,
    module_description text NOT NULL,
    module_createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    module_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (module_id),
    UNIQUE KEY module_name (module_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE module_role (
    Module_role_id int(11) NOT NULL AUTO_INCREMENT,
    Role_FK_ID int(11) NOT NULL,
    Module_FK_ID int(11) NOT NULL,
    PRIMARY KEY (Module_role_id),
    KEY Role_FK_ID (Role_FK_ID),
    KEY Module_FK_ID (Module_FK_ID),
    CONSTRAINT fk_module_role_role FOREIGN KEY (Role_FK_ID) REFERENCES role (Role_id),
    CONSTRAINT fk_module_role_module FOREIGN KEY (Module_FK_ID) REFERENCES module (module_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE permissions (
    Permissions_id int(11) NOT NULL AUTO_INCREMENT,
    Permissions_name varchar(30) NOT NULL,
    Permissions_description text NOT NULL,
    Permissions_createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    Permissions_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Permissions_id),
    UNIQUE KEY Permissions_name (Permissions_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE permissions_module_role (
    Permissions_module_role_id int(11) NOT NULL AUTO_INCREMENT,
    Module_role_FK_ID int(11) NOT NULL,
    Permissions_FK_ID int(11) NOT NULL,
    PRIMARY KEY (Permissions_module_role_id),
    KEY Module_role_FK_ID (Module_role_FK_ID),
    KEY Permissions_FK_ID (Permissions_FK_ID),
    CONSTRAINT fk_permissions_module_role FOREIGN KEY (Module_role_FK_ID) REFERENCES module_role (Module_role_id),
    CONSTRAINT fk_permissions_permissions FOREIGN KEY (Permissions_FK_ID) REFERENCES permissions (Permissions_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE notification_type (
    Notification_type_id int(11) NOT NULL AUTO_INCREMENT,
    Notification_type_name varchar(30) NOT NULL,
    PRIMARY KEY (Notification_type_id),
    UNIQUE KEY Notification_type_name (Notification_type_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE notification (
    Notification_id int(11) NOT NULL AUTO_INCREMENT,
    Notification_type_FK_ID int(11) NOT NULL,
    Notification_description text NOT NULL,
    Notification_User_FK_ID int(11) DEFAULT NULL,
    Notification_createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    Notification_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Notification_id),
    KEY Notification_type_FK_ID (Notification_type_FK_ID),
    KEY Notification_User_FK_ID (Notification_User_FK_ID),
    CONSTRAINT fk_notification_type FOREIGN KEY (Notification_type_FK_ID) REFERENCES notification_type (Notification_type_id),
    CONSTRAINT fk_notification_user FOREIGN KEY (Notification_User_FK_ID) REFERENCES users (Users_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE payment_status (
    Payment_status_id int(11) NOT NULL AUTO_INCREMENT,
    Payment_status_name varchar(30) NOT NULL,
    PRIMARY KEY (Payment_status_id),
    UNIQUE KEY Payment_status_name (Payment_status_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE payment (
    payment_id int(11) NOT NULL AUTO_INCREMENT,
    Owner_ID_FK int(11) NOT NULL,
    Payment_total_payment float NOT NULL,
    Payment_Status_ID_FK int(11) NOT NULL,
    Payment_date timestamp NOT NULL DEFAULT current_timestamp(),
    Payment_method varchar(30) NOT NULL,
    Payment_reference_number varchar(50) DEFAULT NULL,
    PRIMARY KEY (payment_id),
    KEY Owner_ID_FK (Owner_ID_FK),
    KEY Payment_Status_ID_FK (Payment_Status_ID_FK),
    CONSTRAINT fk_payment_owner FOREIGN KEY (Owner_ID_FK) REFERENCES owner (Owner_id),
    CONSTRAINT fk_payment_status FOREIGN KEY (Payment_Status_ID_FK) REFERENCES payment_status (Payment_status_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE pqrs_category (
    PQRS_category_id int(11) NOT NULL AUTO_INCREMENT,
    PQRS_category_name varchar(30) NOT NULL,
    PRIMARY KEY (PQRS_category_id),
    UNIQUE KEY PQRS_category_name (PQRS_category_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE pqrs (
    PQRS_id int(11) NOT NULL AUTO_INCREMENT,
    PQRS_category_FK_ID int(11) NOT NULL,
    PQRS_description text NOT NULL,
    PQRS_file varchar(255) DEFAULT NULL,
    PQRS_answer text DEFAULT NULL,
    PQRS_createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    PQRS_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (PQRS_id),
    KEY PQRS_category_FK_ID (PQRS_category_FK_ID),
    CONSTRAINT fk_pqrs_category FOREIGN KEY (PQRS_category_FK_ID) REFERENCES pqrs_category (PQRS_category_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE pqrs_tracking_status (
    PQRS_tracking_status_id int(11) NOT NULL AUTO_INCREMENT,
    PQRS_tracking_status_name varchar(30) NOT NULL,
    PRIMARY KEY (PQRS_tracking_status_id),
    UNIQUE KEY PQRS_tracking_status_name (PQRS_tracking_status_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE pqrs_tracking (
    PQRS_tracking_id int(11) NOT NULL AUTO_INCREMENT,
    PQRS_tracking_PQRS_FK_ID int(11) NOT NULL,
    PQRS_tracking_user_FK_ID int(11) NOT NULL,
    PQRS_tracking_status_FK_ID int(11) NOT NULL,
    PQRS_tracking_date_update timestamp NOT NULL DEFAULT current_timestamp(),
    PQRS_tracking_createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    PQRS_tracking_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (PQRS_tracking_id),
    KEY PQRS_tracking_status_FK_ID (PQRS_tracking_status_FK_ID),
    KEY PQRS_tracking_PQRS_FK_ID (PQRS_tracking_PQRS_FK_ID),
    KEY PQRS_tracking_user_FK_ID (PQRS_tracking_user_FK_ID),
    CONSTRAINT fk_pqrs_tracking_status FOREIGN KEY (PQRS_tracking_status_FK_ID) REFERENCES pqrs_tracking_status (PQRS_tracking_status_id),
    CONSTRAINT fk_pqrs_tracking_pqrs FOREIGN KEY (PQRS_tracking_PQRS_FK_ID) REFERENCES pqrs (PQRS_id),
    CONSTRAINT fk_pqrs_tracking_user FOREIGN KEY (PQRS_tracking_user_FK_ID) REFERENCES users (Users_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE question_type (
    Question_type_id int(11) NOT NULL AUTO_INCREMENT,
    Question_type_name varchar(30) NOT NULL,
    PRIMARY KEY (Question_type_id),
    UNIQUE KEY Question_type_name (Question_type_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE reservation_type (
    Reservation_type_id int(11) NOT NULL AUTO_INCREMENT,
    Reservation_type_name varchar(30) NOT NULL,
    PRIMARY KEY (Reservation_type_id),
    UNIQUE KEY Reservation_type_name (Reservation_type_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE reservation_status (
    Reservation_status_id int(11) NOT NULL AUTO_INCREMENT,
    Reservation_status_name varchar(30) NOT NULL,
    PRIMARY KEY (Reservation_status_id),
    UNIQUE KEY Reservation_status_name (Reservation_status_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE reservation (
    Reservation_id int(11) NOT NULL AUTO_INCREMENT,
    Reservation_type_FK_ID int(11) NOT NULL,
    Reservation_status_FK_ID int(11) NOT NULL,
    Reservation_date timestamp NOT NULL DEFAULT current_timestamp(),
    Reservation_start_time datetime NOT NULL,
    Reservation_end_time datetime NOT NULL,
    Reservation_description text NOT NULL,
    Owner_FK_ID int(11) NOT NULL,
    PRIMARY KEY (Reservation_id),
    KEY Reservation_type_FK_ID (Reservation_type_FK_ID),
    KEY Reservation_status_FK_ID (Reservation_status_FK_ID),
    KEY Owner_FK_ID (Owner_FK_ID),
    CONSTRAINT fk_reservation_type FOREIGN KEY (Reservation_type_FK_ID) REFERENCES reservation_type (Reservation_type_id),
    CONSTRAINT fk_reservation_status FOREIGN KEY (Reservation_status_FK_ID) REFERENCES reservation_status (Reservation_status_id),
    CONSTRAINT fk_reservation_owner FOREIGN KEY (Owner_FK_ID) REFERENCES owner (Owner_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE facility (
    Facility_id int(11) NOT NULL AUTO_INCREMENT,
    Facility_name varchar(100) NOT NULL,
    Facility_description text,
    Facility_capacity int(11) NOT NULL DEFAULT 1,
    Facility_status enum('available', 'maintenance', 'reserved') NOT NULL DEFAULT 'available',
    Facility_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Facility_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE vehicle_type (
    Vehicle_type_id int(11) NOT NULL AUTO_INCREMENT,
    Vehicle_type_name varchar(30) NOT NULL,
    vehicle_plate varchar(30) DEFAULT NULL,
    vehicle_model varchar(30) DEFAULT NULL,
    vehicle_brand varchar(30) DEFAULT NULL,
    vehicle_color varchar(30) DEFAULT NULL,
    vehicle_engineCC varchar(30) DEFAULT NULL,
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
    Parking_number varchar(5) DEFAULT NULL,
    Parking_status_ID_FK int(11) NOT NULL,
    Vehicle_type_ID_FK int(11) NOT NULL,
    Parking_type_ID_FK int(11) NOT NULL,
    User_ID_FK int(11) NOT NULL,
    Parking_createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    Parking_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Parking_id),
    KEY Parking_status_ID_FK (Parking_status_ID_FK),
    KEY Vehicle_type_ID_FK (Vehicle_type_ID_FK),
    KEY Parking_type_ID_FK (Parking_type_ID_FK),
    KEY User_ID_FK (User_ID_FK),
    CONSTRAINT fk_parking_status FOREIGN KEY (Parking_status_ID_FK) REFERENCES parking_status (Parking_status_id),
    CONSTRAINT fk_parking_vehicle_type FOREIGN KEY (Vehicle_type_ID_FK) REFERENCES vehicle_type (Vehicle_type_id),
    CONSTRAINT fk_parking_parking_type FOREIGN KEY (Parking_type_ID_FK) REFERENCES parking_type (Parking_type_id),
    CONSTRAINT fk_parking_user FOREIGN KEY (User_ID_FK) REFERENCES users (Users_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE pet (
    Pet_id int(11) NOT NULL AUTO_INCREMENT,
    Pet_name varchar(30) NOT NULL,
    Pet_species varchar(30) NOT NULL,
    Pet_Breed varchar(30) NOT NULL,
    Pet_vaccination_card varchar(255) NOT NULL,
    Pet_Photo varchar(255) NOT NULL,
    Owner_FK_ID int(11) NOT NULL,
    Pet_createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    Pet_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Pet_id),
    KEY Owner_FK_ID (Owner_FK_ID),
    CONSTRAINT fk_pet_owner FOREIGN KEY (Owner_FK_ID) REFERENCES owner (Owner_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,
   
  `CREATE TABLE survey (
    survey_id INT(11) NOT NULL AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    status VARCHAR(20),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (survey_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  `CREATE TABLE question_type (
  question_type_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  `CREATE TABLE question (
  question_id INT AUTO_INCREMENT PRIMARY KEY,
  survey_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  question_type_id INT NOT NULL,
  options JSON,                          
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (survey_id) REFERENCES survey(survey_id) ON DELETE CASCADE,
  FOREIGN KEY (question_type_id) REFERENCES question_type(question_type_id) ON DELETE RESTRICT
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  `CREATE TABLE answer (
  answer_id INT AUTO_INCREMENT PRIMARY KEY,
  survey_id INT NOT NULL,
  question_id INT NOT NULL,
  user_id INT NULL,
  value TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (survey_id) REFERENCES survey(survey_id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES question(question_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  `INSERT INTO apartment_status (Apartment_status_name) VALUES ('Available'), ('Occupied');`,
  `INSERT INTO question_type (name, description) VALUES ('text', 'Respuesta de texto libre'), ('multiple_choice', 'Seleccionar una opción de varias');`,

  // Insert initial data
  `INSERT INTO tower (Tower_name) VALUES ('Tower A'), ('Tower B'), ('North')`,

  `INSERT INTO reservation_type (Reservation_type_name) VALUES 
   ('Room'),
   ('Parking')`,

  `INSERT INTO reservation_status (Reservation_status_name) VALUES 
   ('Confirmed'),
   ('Cancelled')`,

  `INSERT INTO apartment_status (Apartment_status_name) VALUES 
   ('Available'),
   ('Occupied'),
   ('Under Maintenance')`,

  `INSERT INTO payment_status (Payment_status_name) VALUES 
   ('Pending'),
   ('Completed'),
   ('Failed')`,

  `INSERT INTO notification_type (Notification_type_name) VALUES 
   ('System'),
   ('Payment'),
   ('Reservation'),
   ('PQRS')`,

  `INSERT INTO facility (Facility_name, Facility_description, Facility_capacity) VALUES 
   ('Swimming Pool', 'Main swimming pool area', 30),
   ('Gym', 'Fitness center with equipment', 20),
   ('Party Room', 'Event space for celebrations', 50),
   ('BBQ Area', 'Outdoor grilling space', 15),
   ('Tennis Court', 'Professional tennis court', 4)`,

  // Insert initial user, role, and owner for testing
  `INSERT INTO user_status (User_status_name) VALUES ('Active')`,

  `INSERT INTO role (Role_name, Role_description) VALUES ('Admin', 'Administrator role')`,

  `INSERT INTO users (Users_name, Users_password, User_status_FK_ID, Role_FK_ID) 
   VALUES ('admin', '${bcrypt.hashSync("12345678", 10)}', 1, 1)`,

  `INSERT INTO owner (User_FK_ID, Owner_is_tenant, Owner_birth_date) VALUES (1, 0, NOW())`,

  `INSERT INTO apartment (Apartment_number, Tower_FK_ID, Apartment_status_FK_ID, Owner_FK_ID)
   VALUES ('101', 1, 1, 1)`,
];

export async function runMigration() {
  let connection;
  try {
    // Create initial connection without database selected
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      multipleStatements: true,
    });
    console.log("Connected to database server");

    // Drop and recreate database
    await connection.query(`DROP DATABASE IF EXISTS ${dbConfig.database};`);
    console.log(`Dropped database ${dbConfig.database}`);

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${dbConfig.database};`
    );
    console.log(`Created database ${dbConfig.database}`);

    // Close initial connection
    await connection.end();
    console.log("Reconnecting to the new database...");

    // Connect to the new database
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      multipleStatements: true,
    });

    // Execute USE statement
    await connection.query(sqlStatements[2]);
    console.log("Database selected");

    // Execute each CREATE TABLE statement separately
    for (let i = 3; i < sqlStatements.length; i++) {
      try {
        await connection.query(sqlStatements[i]);
        console.log(
          `Executed statement #${i}: ${sqlStatements[i].substring(0, 30)}...`
        );
      } catch (error) {
        console.error(`Error executing statement #${i}: ${error.message}`);
        throw error;
      }
    }

    console.log("Migration completed successfully");
    return true;
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed");
    }
  }
}

// Run migration if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  runMigration()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
