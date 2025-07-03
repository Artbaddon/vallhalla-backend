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
  `DROP DATABASE IF EXISTS ${dbConfig.database}`,
  
  `CREATE DATABASE ${dbConfig.database}`,
  
  `USE ${dbConfig.database}`,

  `CREATE TABLE user_status (
    User_status_id int(11) NOT NULL AUTO_INCREMENT,
    User_status_name varchar(30) NOT NULL,
    PRIMARY KEY (User_status_id),
    UNIQUE KEY User_status_name (User_status_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `INSERT INTO user_status (User_status_name) VALUES 
   ('Active'),
   ('Inactive'),
   ('Pending'),
   ('Blocked')`,

  `CREATE TABLE role (
    Role_id int(11) NOT NULL AUTO_INCREMENT,
    Role_name varchar(30) NOT NULL,
    Role_description text,
    PRIMARY KEY (Role_id),
    UNIQUE KEY Role_name (Role_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `INSERT INTO role (Role_name, Role_description) VALUES 
   ('Admin', 'Full system access'),
   ('Owner', 'Apartment owner with limited access'),
   ('Security', 'Security guard with specific access')`,

  `CREATE TABLE users (
    Users_id int(11) NOT NULL AUTO_INCREMENT,
    Users_name varchar(30) NOT NULL,
    Users_password varchar(255) NOT NULL,
    User_status_FK_ID int(11) NOT NULL,
    Role_FK_ID int(11) NOT NULL,
    Users_createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    Users_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Users_id),
    UNIQUE KEY Users_name (Users_name),
    KEY User_status_FK_ID (User_status_FK_ID),
    KEY Role_FK_ID (Role_FK_ID),
    CONSTRAINT fk_users_role FOREIGN KEY (Role_FK_ID) REFERENCES role (Role_id),
    CONSTRAINT fk_users_status FOREIGN KEY (User_status_FK_ID) REFERENCES user_status (User_status_id)
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

  `CREATE TABLE pet (
    Pet_id int(11) NOT NULL AUTO_INCREMENT,
    Pet_name varchar(50) NOT NULL,
    Pet_species varchar(30) NOT NULL,
    Pet_Breed varchar(50),
    Pet_vaccination_card varchar(255),
    Pet_Photo varchar(255),
    Owner_FK_ID int(11) NOT NULL,
    createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Pet_id),
    KEY Owner_FK_ID (Owner_FK_ID),
    CONSTRAINT fk_pet_owner FOREIGN KEY (Owner_FK_ID) REFERENCES owner (Owner_id)
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

  `CREATE TABLE vehicle_type (
    Vehicle_type_id int(11) NOT NULL AUTO_INCREMENT,
    Vehicle_type_name varchar(50) NOT NULL UNIQUE,
    vehicle_plate varchar(20),
    vehicle_model varchar(20),
    vehicle_brand varchar(50),
    vehicle_color varchar(30),
    vehicle_engineCC varchar(20),
    createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Vehicle_type_id)
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
    Reservation_start_time datetime NOT NULL,
    Reservation_end_time datetime NOT NULL,
    Reservation_description text,
    Owner_FK_ID int(11) NOT NULL,
    createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
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
    Facility_capacity int(11) NOT NULL,
    createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Facility_id),
    UNIQUE KEY Facility_name (Facility_name)
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
    Parking_number varchar(10) NOT NULL,
    Parking_status_ID_FK int(11) NOT NULL,
    Vehicle_type_ID_FK int(11) DEFAULT NULL,
    Parking_type_ID_FK int(11) NOT NULL,
    User_ID_FK int(11) DEFAULT NULL,
    createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (Parking_id),
    UNIQUE KEY Parking_number (Parking_number),
    KEY Parking_status_ID_FK (Parking_status_ID_FK),
    KEY Vehicle_type_ID_FK (Vehicle_type_ID_FK),
    KEY Parking_type_ID_FK (Parking_type_ID_FK),
    KEY User_ID_FK (User_ID_FK),
    CONSTRAINT fk_parking_status FOREIGN KEY (Parking_status_ID_FK) REFERENCES parking_status (Parking_status_id),
    CONSTRAINT fk_parking_vehicle_type FOREIGN KEY (Vehicle_type_ID_FK) REFERENCES vehicle_type (Vehicle_type_id),
    CONSTRAINT fk_parking_parking_type FOREIGN KEY (Parking_type_ID_FK) REFERENCES parking_type (Parking_type_id),
    CONSTRAINT fk_parking_user FOREIGN KEY (User_ID_FK) REFERENCES users (Users_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `CREATE TABLE notification_type (
    Notification_type_id int(11) NOT NULL AUTO_INCREMENT,
    Notification_type_name varchar(30) NOT NULL,
    PRIMARY KEY (Notification_type_id),
    UNIQUE KEY Notification_type_name (Notification_type_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci`,

  `INSERT INTO notification_type (Notification_type_name) VALUES 
   ('System'),
   ('Payment'),
   ('Event'),
   ('Security'),
   ('Document'),
   ('Maintenance'),
   ('Reservation'),
   ('PQRS')`,

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
    Owner_FK_ID int(11) NOT NULL,
    PQRS_category_FK_ID int(11) NOT NULL,
    PQRS_subject varchar(255) NOT NULL,
    PQRS_description text NOT NULL,
    PQRS_priority enum('LOW', 'MEDIUM', 'HIGH') DEFAULT 'MEDIUM',
    PQRS_file varchar(255) DEFAULT NULL,
    PQRS_answer text DEFAULT NULL,
    PQRS_createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    PQRS_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (PQRS_id),
    KEY Owner_FK_ID (Owner_FK_ID),
    KEY PQRS_category_FK_ID (PQRS_category_FK_ID),
    CONSTRAINT fk_pqrs_owner FOREIGN KEY (Owner_FK_ID) REFERENCES owner (Owner_id),
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
    Question_type_name VARCHAR(50) NOT NULL UNIQUE,
    Question_type_description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
  `INSERT INTO question_type (Question_type_name, Question_type_description) VALUES ('text', 'Free text response question'), ('multiple_choice', 'Multiple choice question with single answer'), ('checkbox', 'Multiple choice question with multiple answers allowed'), ('rating', 'Rating scale question'), ('date', 'Date input question');`,

  // Insert initial data
  `INSERT INTO tower (Tower_name) VALUES ('Tower A'), ('Tower B'), ('North')`,

  `INSERT INTO reservation_type (Reservation_type_name) VALUES 
   ('Room'),
   ('Parking'),
   ('Gym'),
   ('Community Room'),
   ('Sports Facility')`,

  `INSERT INTO reservation_status (Reservation_status_name) VALUES 
   ('Pending'),
   ('Confirmed'),
   ('Completed'),
   ('Cancelled'),
   ('No Show')`,


  `INSERT INTO payment_status (Payment_status_name) VALUES 
   ('Pending'),
   ('Processing'),
   ('Completed'),
   ('Failed')`,

  `INSERT INTO facility (Facility_name, Facility_description, Facility_capacity) VALUES 
   ('Swimming Pool', 'Main swimming pool area', 30),
   ('Gym', 'Fitness center with equipment', 20),
   ('Party Room', 'Event space for celebrations', 50),
   ('BBQ Area', 'Outdoor grilling space', 15),
   ('Tennis Court', 'Professional tennis court', 4)`,

  // Insert modules
  `INSERT INTO module (module_name, module_description) VALUES 
   ('users', 'User management module'),
   ('owners', 'Owner management module'),
   ('apartments', 'Apartment management module'),
   ('parking', 'Parking management module'),
   ('pets', 'Pet management module'),
   ('pqrs', 'PQRS management module'),
   ('reservations', 'Reservation management module'),
   ('payments', 'Payment management module'),
   ('visitors', 'Visitor management module'),
   ('surveys', 'Survey management module'),
   ('profiles', 'Profile management module'),
   ('notifications', 'Notification management module'),
   ('apartment-status', 'Apartment status management module'),
   ('towers', 'Towers management module'),
   ('questions', 'Questions management module'),
   ('answers', 'Answers management module'),
   ('reservation-status', 'Reservation status management module'),
   ('reservation-type', 'Reservation type management module'),
   ('role-permissions', 'Role permissions management module'),
   ('modules', 'Modules management module'),
   ('user-status', 'User status management module'),
   ('pqrs-categories', 'PQRS categories management module'),
   ('guards', 'Guards management module'),
   ('facilities', 'Facilities management module'),
   ('permissions', 'Permissions management module'),
   ('vehicle-type', 'Vehicle type management module'),
   ('roles', 'Roles management module')`,

  // Insert basic permissions
  `INSERT INTO permissions (Permissions_name, Permissions_description) VALUES 
   ('create', 'Create new records'),
   ('read', 'Read records'),
   ('update', 'Update existing records'),
   ('delete', 'Delete records')`,

  // First ensure module-role relationship for profiles
  `INSERT INTO module_role (Role_FK_ID, Module_FK_ID)
   SELECT r.Role_id, m.module_id
   FROM role r
   CROSS JOIN module m
   WHERE r.Role_name = 'Admin'
   AND m.module_name = 'profiles'`,

  // Then explicitly set up permissions for the profiles module
  `INSERT INTO permissions_module_role (Module_role_FK_ID, Permissions_FK_ID)
   SELECT DISTINCT mr.Module_role_id, p.Permissions_id
   FROM module_role mr
   JOIN module m ON mr.Module_FK_ID = m.module_id
   JOIN role r ON mr.Role_FK_ID = r.Role_id
   CROSS JOIN permissions p
   WHERE r.Role_name = 'Admin'
   AND m.module_name = 'profiles'`,
   
  // Ensure admin has access to all modules (explicit list for clarity)
  `INSERT IGNORE INTO module_role (Role_FK_ID, Module_FK_ID)
   SELECT r.Role_id, m.module_id
   FROM role r
   CROSS JOIN module m
   WHERE r.Role_name = 'Admin'
   AND m.module_name IN ('users', 'owners', 'apartments', 'parking', 'pets', 'pqrs', 'reservations', 'payments', 'visitors', 'surveys', 
   'profiles', 'notifications', 'apartment-status', 'towers', 'questions', 'answers', 'reservation-status', 'reservation-type', 
   'role-permissions', 'modules', 'user-status', 'pqrs-categories', 'guards', 'facilities', 'permissions', 'roles', 'vehicle-type')`,

  // Insert permissions for Admin (all permissions on all modules)
  `INSERT INTO permissions_module_role (Module_role_FK_ID, Permissions_FK_ID)
   SELECT mr.Module_role_id, p.Permissions_id
   FROM module_role mr
   CROSS JOIN permissions p
   JOIN role r ON mr.Role_FK_ID = r.Role_id
   WHERE r.Role_name = 'Admin'`,
   
  // Add explicit profile permissions for admin
  `INSERT IGNORE INTO permissions_module_role (Module_role_FK_ID, Permissions_FK_ID)
   SELECT mr.Module_role_id, p.Permissions_id
   FROM module_role mr
   JOIN module m ON mr.Module_FK_ID = m.module_id
   CROSS JOIN permissions p
   JOIN role r ON mr.Role_FK_ID = r.Role_id
   WHERE r.Role_name = 'Admin'
   AND m.module_name = 'profiles'`,

  // Add explicit profile permissions for all roles
  `INSERT IGNORE INTO module_role (Role_FK_ID, Module_FK_ID)
   SELECT r.Role_id, m.module_id
   FROM role r
   CROSS JOIN module m
   WHERE m.module_name = 'profiles'`,

  `INSERT IGNORE INTO permissions_module_role (Module_role_FK_ID, Permissions_FK_ID)
   SELECT mr.Module_role_id, p.Permissions_id
   FROM module_role mr
   JOIN module m ON mr.Module_FK_ID = m.module_id
   JOIN permissions p ON 1=1
   JOIN role r ON mr.Role_FK_ID = r.Role_id
   WHERE m.module_name = 'profiles'
   AND (
     (r.Role_name = 'Admin' AND p.Permissions_name IN ('create', 'read', 'update', 'delete'))
     OR (r.Role_name IN ('Owner', 'Security') AND p.Permissions_name IN ('read', 'update'))
   )`,

  // Insert module-role associations for Owner
  `INSERT INTO module_role (Role_FK_ID, Module_FK_ID)
   SELECT r.Role_id, m.module_id
   FROM role r
   CROSS JOIN module m
   WHERE r.Role_name = 'Owner'
   AND m.module_name IN ('owners', 'apartments', 'parking', 'pets', 'pqrs', 'reservations', 'payments', 'surveys', 'profiles', 
   'notifications', 'apartment-status', 'towers', 'questions', 'answers', 'reservation-status', 'reservation-type', 'vehicle-type', 
   'permissions', 'roles', 'role-permissions', 'modules', 'user-status', 'pqrs-categories', 'guards', 'facilities')`,

  // Insert permissions for Owner role
  `INSERT INTO permissions_module_role (Module_role_FK_ID, Permissions_FK_ID)
   SELECT mr.Module_role_id, p.Permissions_id
   FROM module_role mr
   JOIN module m ON mr.Module_FK_ID = m.module_id
   JOIN permissions p ON 1=1
   JOIN role r ON mr.Role_FK_ID = r.Role_id
   WHERE r.Role_name = 'Owner'
   AND (
     (m.module_name = 'owners' AND p.Permissions_name IN ('read', 'update'))
     OR (m.module_name = 'apartments' AND p.Permissions_name = 'read')
     OR (m.module_name = 'parking' AND p.Permissions_name IN ('read', 'create'))
     OR (m.module_name = 'pets' AND p.Permissions_name IN ('create', 'read', 'update', 'delete'))
     OR (m.module_name = 'pqrs' AND p.Permissions_name IN ('create', 'read', 'update'))
     OR (m.module_name = 'reservations' AND p.Permissions_name IN ('create', 'read', 'update', 'delete'))
     OR (m.module_name = 'payments' AND p.Permissions_name IN ('create', 'read'))
     OR (m.module_name = 'surveys' AND p.Permissions_name IN ('read', 'create'))
     OR (m.module_name = 'profiles' AND p.Permissions_name IN ('read', 'update'))
     OR (m.module_name = 'notifications' AND p.Permissions_name IN ('read'))
     OR (m.module_name = 'apartment-status' AND p.Permissions_name IN ('read'))
     OR (m.module_name = 'towers' AND p.Permissions_name IN ('read'))
     OR (m.module_name = 'questions' AND p.Permissions_name IN ('read'))
     OR (m.module_name = 'answers' AND p.Permissions_name IN ('read', 'create'))
     OR (m.module_name = 'reservation-status' AND p.Permissions_name IN ('read'))
     OR (m.module_name = 'reservation-type' AND p.Permissions_name IN ('read'))
     OR (m.module_name = 'vehicle-type' AND p.Permissions_name IN ('read'))
     OR (m.module_name = 'permissions' AND p.Permissions_name IN ('read'))
     OR (m.module_name = 'roles' AND p.Permissions_name IN ('read'))
     OR (m.module_name = 'role-permissions' AND p.Permissions_name IN ('read'))
     OR (m.module_name = 'modules' AND p.Permissions_name IN ('read'))
     OR (m.module_name = 'user-status' AND p.Permissions_name IN ('read'))
     OR (m.module_name = 'pqrs-categories' AND p.Permissions_name IN ('read'))
     OR (m.module_name = 'guards' AND p.Permissions_name IN ('create', 'read', 'update', 'delete'))
   )`,

  // Insert module-role associations for Security
  `INSERT INTO module_role (Role_FK_ID, Module_FK_ID)
   SELECT r.Role_id, m.module_id
   FROM role r
   CROSS JOIN module m
   WHERE r.Role_name = 'Security'
   AND m.module_name IN ('visitors', 'parking', 'vehicle-type', 'apartments', 'towers', 'owners', 'guards', 'profiles', 
   'apartment-status', 'permissions', 'roles', 'user-status', 'facilities', 'role-permissions', 'modules')`,

  // Insert permissions for Security role
  `INSERT INTO permissions_module_role (Module_role_FK_ID, Permissions_FK_ID)
   SELECT mr.Module_role_id, p.Permissions_id
   FROM module_role mr
   JOIN module m ON mr.Module_FK_ID = m.module_id
   JOIN permissions p ON 1=1
   JOIN role r ON mr.Role_FK_ID = r.Role_id
   WHERE r.Role_name = 'Security'
   AND (
     (m.module_name = 'visitors' AND p.Permissions_name IN ('create', 'read', 'update'))
     OR (m.module_name = 'parking' AND p.Permissions_name IN ('read', 'update'))
     OR (m.module_name = 'vehicle-type' AND p.Permissions_name IN ('read'))
     OR (m.module_name = 'apartments' AND p.Permissions_name IN ('read'))
     OR (m.module_name = 'towers' AND p.Permissions_name IN ('read'))
     OR (m.module_name = 'owners' AND p.Permissions_name IN ('read'))
     OR (m.module_name = 'guards' AND p.Permissions_name IN ('create', 'read', 'update', 'delete'))
     OR (m.module_name = 'profiles' AND p.Permissions_name IN ('read'))
     OR (m.module_name = 'apartment-status' AND p.Permissions_name IN ('read'))
     OR (m.module_name = 'permissions' AND p.Permissions_name IN ('read'))
     OR (m.module_name = 'roles' AND p.Permissions_name IN ('read'))
     OR (m.module_name = 'user-status' AND p.Permissions_name IN ('read'))
     OR (m.module_name = 'facilities' AND p.Permissions_name IN ('read'))
     OR (m.module_name = 'role-permissions' AND p.Permissions_name IN ('read'))
     OR (m.module_name = 'modules' AND p.Permissions_name IN ('read'))
   )`,

  // Create test users
  `INSERT INTO users (Users_name, Users_password, User_status_FK_ID, Role_FK_ID) 
   VALUES 
   ('admin', '${bcrypt.hashSync("12345678", 10)}', 1, (SELECT Role_id FROM role WHERE Role_name = 'Admin')),
   ('testowner', '${bcrypt.hashSync("12345678", 10)}', 1, (SELECT Role_id FROM role WHERE Role_name = 'Owner')),
   ('testsecurity', '${bcrypt.hashSync("12345678", 10)}', 1, (SELECT Role_id FROM role WHERE Role_name = 'Security'))`,

  // Create profiles for all users immediately after creation
  `INSERT INTO profile (Profile_fullName, User_FK_ID, Profile_document_type, Profile_document_number, Profile_telephone_number)
   SELECT 
     CASE Users_name
       WHEN 'admin' THEN 'System Administrator'
       WHEN 'testowner' THEN 'Test Owner'
       WHEN 'testsecurity' THEN 'Test Security'
     END,
     Users_id,
     'CC',
     CASE Users_name
       WHEN 'admin' THEN '1000000000'
       WHEN 'testowner' THEN '2000000000'
       WHEN 'testsecurity' THEN '3000000000'
     END,
     CASE Users_name
       WHEN 'admin' THEN '3000000000'
       WHEN 'testowner' THEN '3000000001'
       WHEN 'testsecurity' THEN '3000000002'
     END
   FROM users 
   WHERE Users_name IN ('admin', 'testowner', 'testsecurity')`,

  // Create test owner record
  `INSERT INTO owner (User_FK_ID, Owner_is_tenant, Owner_birth_date) 
   SELECT Users_id, 0, NOW() 
   FROM users 
   WHERE Users_name = 'testowner'`,

  `INSERT INTO apartment (Apartment_number, Tower_FK_ID, Apartment_status_FK_ID, Owner_FK_ID)
   VALUES ('101', 1, 1, 1)`,

  // Add dummy data for profiles
  `INSERT INTO profile (Profile_fullName, User_FK_ID, Profile_document_type, Profile_document_number, Profile_telephone_number)
   VALUES 
   ('Admin User', 1, 'CC', '1234567890', '3001234567'),
   ('John Owner', 2, 'CC', '0987654321', '3009876543'),
   ('Security Guard', 3, 'CC', '5678901234', '3005678901')`,

  // Add dummy data for guards with corresponding users and profiles
  `INSERT INTO users (Users_name, Users_password, User_status_FK_ID, Role_FK_ID) 
   VALUES 
   ('guard1', '${bcrypt.hashSync("12345678", 10)}', 1, (SELECT Role_id FROM role WHERE Role_name = 'Security')),
   ('guard2', '${bcrypt.hashSync("12345678", 10)}', 1, (SELECT Role_id FROM role WHERE Role_name = 'Security')),
   ('guard3', '${bcrypt.hashSync("12345678", 10)}', 1, (SELECT Role_id FROM role WHERE Role_name = 'Security'))`,

  `INSERT INTO profile (Profile_fullName, User_FK_ID, Profile_document_type, Profile_document_number, Profile_telephone_number, Profile_photo)
   SELECT 
     CASE 
       WHEN Users_name = 'guard1' THEN 'John Guard'
       WHEN Users_name = 'guard2' THEN 'Jane Guard'
       WHEN Users_name = 'guard3' THEN 'Mike Guard'
     END,
     Users_id,
     'CC',
     CASE 
       WHEN Users_name = 'guard1' THEN '1001001001'
       WHEN Users_name = 'guard2' THEN '1001001002'
       WHEN Users_name = 'guard3' THEN '1001001003'
     END,
     CASE 
       WHEN Users_name = 'guard1' THEN '3001001001'
       WHEN Users_name = 'guard2' THEN '3001001002'
       WHEN Users_name = 'guard3' THEN '3001001003'
     END,
     NULL
   FROM users 
   WHERE Users_name IN ('guard1', 'guard2', 'guard3')`,

  `INSERT INTO guard (User_FK_ID, Guard_arl, Guard_eps, Guard_shift)
   SELECT 
     Users_id,
     CASE 
       WHEN Users_name = 'guard1' THEN 'Sura ARL'
       WHEN Users_name = 'guard2' THEN 'Colmena ARL'
       WHEN Users_name = 'guard3' THEN 'Positiva ARL'
     END,
     CASE 
       WHEN Users_name = 'guard1' THEN 'Nueva EPS'
       WHEN Users_name = 'guard2' THEN 'Sanitas EPS'
       WHEN Users_name = 'guard3' THEN 'Compensar EPS'
     END,
     CASE 
       WHEN Users_name = 'guard1' THEN 'Morning'
       WHEN Users_name = 'guard2' THEN 'Night'
       WHEN Users_name = 'guard3' THEN 'Evening'
     END
   FROM users 
   WHERE Users_name IN ('guard1', 'guard2', 'guard3')`,

  // Add dummy data for vehicle types
  `INSERT INTO vehicle_type (Vehicle_type_name, vehicle_plate, vehicle_model, vehicle_brand, vehicle_color)
   VALUES 
   ('Car', 'ABC123', '2022', 'Toyota', 'Red'),
   ('Motorcycle', 'XYZ789', '2021', 'Honda', 'Black'),
   ('Bicycle', NULL, NULL, 'Trek', 'Blue')`,

  // Add dummy data for parking status and type
  `INSERT INTO parking_status (Parking_status_name) VALUES ('Available'), ('Occupied'), ('Reserved')`,
  `INSERT INTO parking_type (Parking_type_name) VALUES ('Regular'), ('Visitor'), ('Disabled')`,

  // Add dummy data for parking
  `INSERT INTO parking (Parking_number, Parking_status_ID_FK, Vehicle_type_ID_FK, Parking_type_ID_FK, User_ID_FK)
   VALUES 
   ('A-01', 2, 1, 1, 2),
   ('A-02', 1, 2, 1, 2),
   ('V-01', 1, 1, 2, 1)`,

  // Add dummy data for pets
  `INSERT INTO pet (Pet_name, Pet_species, Pet_Breed, Pet_vaccination_card, Pet_Photo, Owner_FK_ID)
   VALUES 
   ('Max', 'Dog', 'Golden Retriever', 'vaccination_card_001.pdf', 'max_photo.jpg', 1),
   ('Luna', 'Cat', 'Persian', 'vaccination_card_002.pdf', 'luna_photo.jpg', 1)`,

  // Add dummy data for PQRS categories and PQRS
  `INSERT INTO pqrs_category (PQRS_category_name) 
   VALUES 
   ('Maintenance'),
   ('Security'),
   ('Noise Complaint'),
   ('General Inquiry'),
   ('Documentation'),
   ('Plumbing'),
   ('Parking'),
   ('Facilities'),
   ('Administrative')`,

  // Additional PQRS
  `INSERT INTO pqrs (Owner_FK_ID, PQRS_category_FK_ID, PQRS_subject, PQRS_description, PQRS_priority, PQRS_answer)
   SELECT 
     o1.Owner_id, 5, 'Document Request', 'Need copy of building regulations', 'LOW', 'Documents sent via email'
   FROM owner o1
   WHERE o1.User_FK_ID = 8
   UNION ALL
   SELECT 
     o2.Owner_id, 6, 'Water Leak Emergency', 'Urgent water leak in bathroom', 'HIGH', 'Maintenance team dispatched'
   FROM owner o2
   WHERE o2.User_FK_ID = 10
   UNION ALL
   SELECT 
     o3.Owner_id, 7, 'Incorrect Parking', 'Vehicle blocking emergency exit', 'HIGH', 'Security notified and vehicle removed'
   FROM owner o3
   WHERE o3.User_FK_ID = 11
   UNION ALL
   SELECT 
     o4.Owner_id, 8, 'Gym Equipment', 'Treadmill not working properly', 'MEDIUM', NULL
   FROM owner o4
   WHERE o4.User_FK_ID = 7
   UNION ALL
   SELECT 
     o5.Owner_id, 9, 'Administrative Request', 'Update contact information', 'LOW', 'Information updated in system'
   FROM owner o5
   WHERE o5.User_FK_ID = 12`,

  // Add dummy data for PQRS tracking status and tracking
  `INSERT INTO pqrs_tracking_status (PQRS_tracking_status_name)
   VALUES ('Open'), ('In Progress'), ('Resolved'), ('Closed')`,

  `INSERT INTO pqrs_tracking (PQRS_tracking_PQRS_FK_ID, PQRS_tracking_user_FK_ID, PQRS_tracking_status_FK_ID)
   SELECT p.PQRS_id, 1, 2
   FROM pqrs p
   JOIN owner o ON p.Owner_FK_ID = o.Owner_id
   WHERE o.User_FK_ID = 8 AND p.PQRS_subject = 'Document Request'
   UNION ALL
   SELECT p.PQRS_id, 1, 1
   FROM pqrs p
   JOIN owner o ON p.Owner_FK_ID = o.Owner_id
   WHERE o.User_FK_ID = 10 AND p.PQRS_subject = 'Water Leak Emergency'`,

  // Additional PQRS tracking
  `INSERT INTO pqrs_tracking (PQRS_tracking_PQRS_FK_ID, PQRS_tracking_user_FK_ID, PQRS_tracking_status_FK_ID)
   SELECT p.PQRS_id, 1, 3
   FROM pqrs p
   JOIN owner o ON p.Owner_FK_ID = o.Owner_id
   WHERE o.User_FK_ID = 11 AND p.PQRS_subject = 'Incorrect Parking'
   UNION ALL
   SELECT p.PQRS_id, 1, 2
   FROM pqrs p
   JOIN owner o ON p.Owner_FK_ID = o.Owner_id
   WHERE o.User_FK_ID = 7 AND p.PQRS_subject = 'Gym Equipment'
   UNION ALL
   SELECT p.PQRS_id, 1, 1
   FROM pqrs p
   JOIN owner o ON p.Owner_FK_ID = o.Owner_id
   WHERE o.User_FK_ID = 12 AND p.PQRS_subject = 'Administrative Request'`,

  // Add dummy data for surveys and questions
  `INSERT INTO survey (title, status)
   VALUES 
   ('Resident Satisfaction Survey', 'active'),
   ('Facility Usage Survey', 'draft')`,

  `INSERT INTO question (survey_id, title, question_type_id, options)
   VALUES 
   (1, 'How satisfied are you with the building maintenance?', 4, '["1", "2", "3", "4", "5"]'),
   (1, 'Which facilities do you use most often?', 3, '["Gym", "Pool", "BBQ Area", "Party Room"]'),
   (2, 'When do you usually use the gym?', 2, '["Morning", "Afternoon", "Evening", "Night"]')`,

  // Add dummy data for notifications
  `INSERT INTO notification (Notification_type_FK_ID, Notification_description, Notification_User_FK_ID)
   VALUES 
   ((SELECT Notification_type_id FROM notification_type WHERE Notification_type_name = 'Document'), 'Welcome to Vallhalla! Please complete your profile.', 2),
   ((SELECT Notification_type_id FROM notification_type WHERE Notification_type_name = 'Payment'), 'Your payment for March 2024 has been received.', 2),
   ((SELECT Notification_type_id FROM notification_type WHERE Notification_type_name = 'Event'), 'Your facility reservation has been confirmed.', 2)`,

  // Additional reservations
  `INSERT INTO reservation (Reservation_type_FK_ID, Reservation_status_FK_ID, Reservation_start_time, Reservation_end_time, Reservation_description, Owner_FK_ID)
   SELECT 
     3, 2, '2024-03-26 10:00:00', '2024-03-26 12:00:00', 'Yoga Class', o1.Owner_id
   FROM owner o1 
   WHERE o1.User_FK_ID = 7
   UNION ALL
   SELECT 
     4, 1, '2024-03-27 15:00:00', '2024-03-27 17:00:00', 'Book Club Meeting', o2.Owner_id
   FROM owner o2
   WHERE o2.User_FK_ID = 8
   UNION ALL
   SELECT 
     5, 2, '2024-03-28 09:00:00', '2024-03-28 11:00:00', 'Tennis Practice', o3.Owner_id
   FROM owner o3
   WHERE o3.User_FK_ID = 10
   UNION ALL
   SELECT 
     3, 3, '2024-03-29 14:00:00', '2024-03-29 16:00:00', 'Kids Birthday Party', o4.Owner_id
   FROM owner o4
   WHERE o4.User_FK_ID = 11
   UNION ALL
   SELECT 
     4, 4, '2024-03-30 18:00:00', '2024-03-30 20:00:00', 'Residents Meeting', o5.Owner_id
   FROM owner o5
   WHERE o5.User_FK_ID = 12`,

  // Add dummy data for visitors
  `INSERT INTO visitor (name, documentNumber, host, enter_date, exit_date)
   VALUES 
   ('Sarah Johnson', '1122334455', 1, '2024-03-15 10:00:00', '2024-03-15 16:00:00'),
   ('Mike Wilson', '5544332211', 1, '2024-03-16 14:00:00', NULL)`,

  // Add more users with different roles
  `INSERT INTO users (Users_name, Users_password, User_status_FK_ID, Role_FK_ID) 
   VALUES 
   ('owner2', '${bcrypt.hashSync("12345678", 10)}', 1, (SELECT Role_id FROM role WHERE Role_name = 'Owner')),
   ('owner3', '${bcrypt.hashSync("12345678", 10)}', 1, (SELECT Role_id FROM role WHERE Role_name = 'Owner')),
   ('security2', '${bcrypt.hashSync("12345678", 10)}', 1, (SELECT Role_id FROM role WHERE Role_name = 'Security')),
   ('inactive_user', '${bcrypt.hashSync("12345678", 10)}', 2, (SELECT Role_id FROM role WHERE Role_name = 'Owner')),
   ('pending_user', '${bcrypt.hashSync("12345678", 10)}', 3, (SELECT Role_id FROM role WHERE Role_name = 'Owner')),
   ('blocked_user', '${bcrypt.hashSync("12345678", 10)}', 4, (SELECT Role_id FROM role WHERE Role_name = 'Owner'))`,

  // Add more profiles
  `INSERT INTO profile (Profile_fullName, User_FK_ID, Profile_document_type, Profile_document_number, Profile_telephone_number)
   VALUES 
   ('Jane Smith', 4, 'CC', '2233445566', '3002233445'),
   ('Robert Brown', 5, 'CE', '3344556677', '3003344556'),
   ('Maria Garcia', 6, 'CC', '4455667788', '3004455667'),
   ('David Lee', 7, 'PP', '5566778899', '3005566778'),
   ('Emma Wilson', 8, 'CC', '6677889900', '3006677889'),
   ('James Taylor', 9, 'CC', '7788990011', '3007788990')`,

  // Add more owners
  `INSERT INTO owner (User_FK_ID, Owner_is_tenant, Owner_birth_date)
   VALUES 
   (7, 0, '1980-05-15'),
   (8, 1, '1975-08-22'),
   (10, 0, '1990-03-10'),
   (11, 1, '1985-11-30'),
   (12, 0, '1982-07-25')`,

  // Add more towers
  `INSERT INTO tower (Tower_name)
   VALUES ('Tower C'), ('Tower D'), ('South')`,

  // Add more apartments
  `INSERT INTO apartment (Apartment_number, Tower_FK_ID, Apartment_status_FK_ID, Owner_FK_ID)
   VALUES 
   ('102', 1, 2, 2),
   ('201', 2, 1, 3),
   ('202', 2, 2, 4),
   ('301', 3, 1, 5),
   ('302', 3, 2, 1),
   ('401', 4, 1, 2),
   ('402', 4, 2, 3),
   ('501', 5, 1, 4),
   ('502', 5, 2, 5)`,

  // Additional vehicle types
  `INSERT INTO vehicle_type (Vehicle_type_name, vehicle_plate, vehicle_model, vehicle_brand, vehicle_color, vehicle_engineCC)
   VALUES 
   ('SUV', 'DEF456', '2023', 'Honda', 'Silver', '2000cc'),
   ('Scooter', 'GHI789', '2022', 'Yamaha', 'Blue', '125cc'),
   ('Van', 'JKL012', '2021', 'Ford', 'White', '2500cc')`,

  // Add more parking spots
  `INSERT INTO parking (Parking_number, Parking_status_ID_FK, Vehicle_type_ID_FK, Parking_type_ID_FK, User_ID_FK)
   VALUES 
   ('A-03', 1, 3, 1, 4),
   ('A-04', 2, 4, 1, 5),
   ('B-01', 2, 5, 1, 7),
   ('B-02', 1, 1, 1, 8),
   ('V-02', 1, 2, 2, 9)`,

  // Add more pets
  `INSERT INTO pet (Pet_name, Pet_species, Pet_Breed, Pet_vaccination_card, Pet_Photo, Owner_FK_ID)
   VALUES 
   ('Rocky', 'Dog', 'German Shepherd', 'vaccination_card_003.pdf', 'rocky_photo.jpg', 2),
   ('Milo', 'Dog', 'Labrador', 'vaccination_card_004.pdf', 'milo_photo.jpg', 3),
   ('Bella', 'Cat', 'Siamese', 'vaccination_card_005.pdf', 'bella_photo.jpg', 4),
   ('Charlie', 'Dog', 'Poodle', 'vaccination_card_006.pdf', 'charlie_photo.jpg', 5)`,

  // Add more payments
  `INSERT INTO payment (Owner_ID_FK, Payment_total_payment, Payment_Status_ID_FK, Payment_method, Payment_reference_number)
   VALUES 
   ((SELECT Owner_id FROM owner WHERE User_FK_ID = 7), 350000, (SELECT Payment_status_id FROM payment_status WHERE Payment_status_name = 'Pending'), 'Wire Transfer', 'PAY-2024-007'),
   ((SELECT Owner_id FROM owner WHERE User_FK_ID = 8), 480000, (SELECT Payment_status_id FROM payment_status WHERE Payment_status_name = 'Completed'), 'Mobile Payment', 'PAY-2024-008'),
   ((SELECT Owner_id FROM owner WHERE User_FK_ID = 10), 520000, (SELECT Payment_status_id FROM payment_status WHERE Payment_status_name = 'Failed'), 'Check', 'PAY-2024-009'),
   ((SELECT Owner_id FROM owner WHERE User_FK_ID = 11), 450000, (SELECT Payment_status_id FROM payment_status WHERE Payment_status_name = 'Pending'), 'Online Banking', 'PAY-2024-010'),
   ((SELECT Owner_id FROM owner WHERE User_FK_ID = 12), 500000, (SELECT Payment_status_id FROM payment_status WHERE Payment_status_name = 'Completed'), 'Credit Card', 'PAY-2024-011')`,

  // Add more surveys
  `INSERT INTO survey (title, status)
   VALUES 
   ('Security Services Feedback', 'active'),
   ('Community Events Planning', 'draft'),
   ('Maintenance Quality Survey', 'active')`,

  // Add more questions
  `INSERT INTO question (survey_id, title, question_type_id, options)
   VALUES 
   (1, 'Rate the overall security service', 4, '["1", "2", "3", "4", "5"]'),
   (1, 'Which security measures need improvement?', 3, '["Cameras", "Guards", "Access Control", "Parking Security"]'),
   (2, 'What type of community events interest you?', 3, '["Sports", "Cultural", "Educational", "Social"]'),
   (3, 'How quickly are maintenance issues resolved?', 4, '["1", "2", "3", "4", "5"]'),
   (3, 'Preferred maintenance schedule', 2, '["Morning", "Afternoon", "Evening", "Weekend"]')`,

  // Add answers to questions
  `INSERT INTO answer (survey_id, question_id, user_id, value)
   VALUES 
   (1, 1, 2, '4'),
   (1, 1, 3, '5'),
   (1, 2, 2, '["Cameras", "Access Control"]'),
   (2, 3, 4, '["Sports", "Social"]'),
   (3, 4, 5, '3')`,

  // Add more notifications
  `INSERT INTO notification (Notification_type_FK_ID, Notification_description, Notification_User_FK_ID)
   VALUES 
   ((SELECT Notification_type_id FROM notification_type WHERE Notification_type_name = 'Document'), 'New document requires your attention', 4),
   ((SELECT Notification_type_id FROM notification_type WHERE Notification_type_name = 'Security'), 'Security incident reported in parking area', NULL),
   ((SELECT Notification_type_id FROM notification_type WHERE Notification_type_name = 'Event'), 'Community event: Summer BBQ this weekend', NULL),
   ((SELECT Notification_type_id FROM notification_type WHERE Notification_type_name = 'Document'), 'Annual meeting minutes available', 5),
   ((SELECT Notification_type_id FROM notification_type WHERE Notification_type_name = 'Payment'), 'Maintenance fee payment successful', 7)`
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
    await connection.query(`DROP DATABASE IF EXISTS ${dbConfig.database}`);
    console.log(`Dropped database ${dbConfig.database}`);

    await connection.query(`CREATE DATABASE ${dbConfig.database}`);
    console.log(`Created database ${dbConfig.database}`);

    await connection.query(`USE ${dbConfig.database}`);
    console.log("Database selected");

    // Execute each statement separately
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