import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../../.env") });

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "vallhalladb",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  multipleStatements: true,
};

/**
 * CONSOLIDATED MIGRATION
 * This migration creates the entire database schema from scratch
 * Use this for fresh installations - it will DROP and recreate the database
 *
 * For seeding data, use separate seeder files
 */
const sqlStatements = [
  // Drop and recreate database
  `DROP DATABASE IF EXISTS ${dbConfig.database};`,
  `CREATE DATABASE IF NOT EXISTS ${dbConfig.database} DEFAULT CHARACTER SET utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
  `USE ${dbConfig.database};`,

  // ==================== CORE TABLES ====================

  // Role table (no FK dependencies)
  `CREATE TABLE role (
    Role_id INT(11) NOT NULL AUTO_INCREMENT,
    Role_name VARCHAR(30) NOT NULL,
    Role_description TEXT DEFAULT NULL,
    PRIMARY KEY (Role_id),
    UNIQUE KEY Role_name (Role_name),
    UNIQUE KEY uq_role_name (Role_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // User status table (no FK dependencies)
  `CREATE TABLE user_status (
    User_status_id INT(11) NOT NULL AUTO_INCREMENT,
    User_status_name VARCHAR(30) NOT NULL,
    PRIMARY KEY (User_status_id),
    UNIQUE KEY User_status_name (User_status_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // Users table (depends on role, user_status)
  `CREATE TABLE users (
    Users_id INT(11) NOT NULL AUTO_INCREMENT,
    Users_name VARCHAR(30) NOT NULL,
    Users_email VARCHAR(150) DEFAULT NULL,
    Users_password VARCHAR(255) NOT NULL,
    Password_reset_token VARCHAR(64) DEFAULT NULL,
    Password_reset_expires DATETIME DEFAULT NULL,
    User_status_FK_ID INT(11) NOT NULL,
    Role_FK_ID INT(11) NOT NULL,
    Users_createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Users_updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (Users_id),
    UNIQUE KEY Users_name (Users_name),
    UNIQUE KEY uq_users_email (Users_email),
    KEY User_status_FK_ID (User_status_FK_ID),
    KEY Role_FK_ID (Role_FK_ID),
    CONSTRAINT fk_users_role FOREIGN KEY (Role_FK_ID) REFERENCES role (Role_id),
    CONSTRAINT fk_users_status FOREIGN KEY (User_status_FK_ID) REFERENCES user_status (User_status_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // Profile table (depends on users)
  `CREATE TABLE profile (
    Profile_id INT(11) NOT NULL AUTO_INCREMENT,
    Profile_fullName VARCHAR(100) NOT NULL,
    User_FK_ID INT(11) NOT NULL,
    Profile_document_type VARCHAR(20) NOT NULL,
    Profile_document_number VARCHAR(30) NOT NULL,
    Profile_telephone_number VARCHAR(12) NOT NULL,
    Profile_photo VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (Profile_id),
    KEY User_FK_ID (User_FK_ID),
    CONSTRAINT fk_profile_user FOREIGN KEY (User_FK_ID) REFERENCES users (Users_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // Owner table (depends on users)
  `CREATE TABLE owner (
    Owner_id INT(11) NOT NULL AUTO_INCREMENT,
    User_FK_ID INT(11) NOT NULL,
    Owner_is_tenant TINYINT(1) NOT NULL,
    Owner_birth_date DATETIME NOT NULL,
    Owner_createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Owner_updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (Owner_id),
    KEY User_FK_ID (User_FK_ID),
    CONSTRAINT fk_owner_user FOREIGN KEY (User_FK_ID) REFERENCES users (Users_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // Guard table (depends on users)
  `CREATE TABLE guard (
    Guard_id INT(11) NOT NULL AUTO_INCREMENT,
    User_FK_ID INT(11) NOT NULL,
    Guard_arl VARCHAR(30) NOT NULL,
    Guard_eps VARCHAR(30) NOT NULL,
    Guard_shift VARCHAR(30) NOT NULL,
    Guard_createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Guard_updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (Guard_id),
    KEY User_FK_ID (User_FK_ID),
    CONSTRAINT fk_guard_user FOREIGN KEY (User_FK_ID) REFERENCES users (Users_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // ==================== APARTMENT MANAGEMENT ====================

  // Tower table (no FK dependencies)
  `CREATE TABLE tower (
    Tower_id INT(11) NOT NULL AUTO_INCREMENT,
    Tower_name VARCHAR(30) NOT NULL,
    PRIMARY KEY (Tower_id),
    UNIQUE KEY Tower_name (Tower_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // Apartment status table (no FK dependencies)
  `CREATE TABLE apartment_status (
    Apartment_status_id INT(11) NOT NULL AUTO_INCREMENT,
    Apartment_status_name VARCHAR(30) NOT NULL,
    PRIMARY KEY (Apartment_status_id),
    UNIQUE KEY Apartment_status_name (Apartment_status_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // Apartment table (depends on apartment_status, tower, owner)
  `CREATE TABLE apartment (
    Apartment_id INT(11) NOT NULL AUTO_INCREMENT,
    Apartment_number VARCHAR(4) NOT NULL,
    Apartment_status_FK_ID INT(11) NOT NULL,
    Tower_FK_ID INT(11) NOT NULL,
    Owner_FK_ID INT(11) NOT NULL,
    PRIMARY KEY (Apartment_id),
    KEY Apartment_status_FK_ID (Apartment_status_FK_ID),
    KEY Tower_FK_ID (Tower_FK_ID),
    KEY Owner_FK_ID (Owner_FK_ID),
    CONSTRAINT fk_apartment_owner FOREIGN KEY (Owner_FK_ID) REFERENCES owner (Owner_id),
    CONSTRAINT fk_apartment_status FOREIGN KEY (Apartment_status_FK_ID) REFERENCES apartment_status (Apartment_status_id),
    CONSTRAINT fk_apartment_tower FOREIGN KEY (Tower_FK_ID) REFERENCES tower (Tower_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // ==================== PARKING MANAGEMENT ====================

  // Vehicle type table (no FK dependencies)
  `CREATE TABLE vehicle_type (
    Vehicle_type_id INT(11) NOT NULL AUTO_INCREMENT,
    Vehicle_type_name VARCHAR(50) NOT NULL,
    vehicle_plate VARCHAR(20) DEFAULT NULL,
    vehicle_model VARCHAR(20) DEFAULT NULL,
    vehicle_brand VARCHAR(50) DEFAULT NULL,
    vehicle_color VARCHAR(30) DEFAULT NULL,
    vehicle_engineCC VARCHAR(20) DEFAULT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (Vehicle_type_id),
    UNIQUE KEY Vehicle_type_name (Vehicle_type_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // Parking status table (no FK dependencies)
  `CREATE TABLE parking_status (
    Parking_status_id INT(11) NOT NULL AUTO_INCREMENT,
    Parking_status_name VARCHAR(30) NOT NULL,
    PRIMARY KEY (Parking_status_id),
    UNIQUE KEY Parking_status_name (Parking_status_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // Parking type table (no FK dependencies)
  `CREATE TABLE parking_type (
    Parking_type_id INT(11) NOT NULL AUTO_INCREMENT,
    Parking_type_name VARCHAR(30) NOT NULL,
    PRIMARY KEY (Parking_type_id),
    UNIQUE KEY Parking_type_name (Parking_type_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // Parking table (depends on parking_status, vehicle_type, parking_type, users)
  `CREATE TABLE parking (
    Parking_id INT(11) NOT NULL AUTO_INCREMENT,
    Parking_number VARCHAR(10) NOT NULL,
    Parking_status_ID_FK INT(11) NOT NULL,
    Vehicle_type_ID_FK INT(11) DEFAULT NULL,
    Parking_type_ID_FK INT(11) NOT NULL,
    User_ID_FK INT(11) DEFAULT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (Parking_id),
    UNIQUE KEY Parking_number (Parking_number),
    KEY Parking_status_ID_FK (Parking_status_ID_FK),
    KEY Vehicle_type_ID_FK (Vehicle_type_ID_FK),
    KEY Parking_type_ID_FK (Parking_type_ID_FK),
    KEY User_ID_FK (User_ID_FK),
    CONSTRAINT fk_parking_parking_type FOREIGN KEY (Parking_type_ID_FK) REFERENCES parking_type (Parking_type_id),
    CONSTRAINT fk_parking_status FOREIGN KEY (Parking_status_ID_FK) REFERENCES parking_status (Parking_status_id),
    CONSTRAINT fk_parking_user FOREIGN KEY (User_ID_FK) REFERENCES users (Users_id),
    CONSTRAINT fk_parking_vehicle_type FOREIGN KEY (Vehicle_type_ID_FK) REFERENCES vehicle_type (Vehicle_type_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // ==================== PETS ====================

  // Pet table (depends on owner)
  `CREATE TABLE pet (
    Pet_id INT(11) NOT NULL AUTO_INCREMENT,
    Pet_name VARCHAR(50) NOT NULL,
    Pet_species VARCHAR(30) NOT NULL,
    Pet_Breed VARCHAR(50) DEFAULT NULL,
    Pet_vaccination_card VARCHAR(255) DEFAULT NULL,
    Pet_Photo VARCHAR(255) DEFAULT NULL,
    Owner_FK_ID INT(11) NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (Pet_id),
    KEY Owner_FK_ID (Owner_FK_ID),
    CONSTRAINT fk_pet_owner FOREIGN KEY (Owner_FK_ID) REFERENCES owner (Owner_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // ==================== PQRS SYSTEM ====================

  // PQRS category table (no FK dependencies)
  `CREATE TABLE pqrs_category (
    PQRS_category_id INT(11) NOT NULL AUTO_INCREMENT,
    PQRS_category_name VARCHAR(30) NOT NULL,
    PRIMARY KEY (PQRS_category_id),
    UNIQUE KEY PQRS_category_name (PQRS_category_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // PQRS table (depends on owner, pqrs_category)
  `CREATE TABLE pqrs (
    PQRS_id INT(11) NOT NULL AUTO_INCREMENT,
    Owner_FK_ID INT(11) NOT NULL,
    PQRS_category_FK_ID INT(11) NOT NULL,
    PQRS_subject VARCHAR(255) NOT NULL,
    PQRS_description TEXT NOT NULL,
    PQRS_priority ENUM('LOW','MEDIUM','HIGH') DEFAULT 'MEDIUM',
    PQRS_file VARCHAR(255) DEFAULT NULL,
    PQRS_answer TEXT DEFAULT NULL,
    PQRS_createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PQRS_updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (PQRS_id),
    KEY Owner_FK_ID (Owner_FK_ID),
    KEY PQRS_category_FK_ID (PQRS_category_FK_ID),
    CONSTRAINT fk_pqrs_category FOREIGN KEY (PQRS_category_FK_ID) REFERENCES pqrs_category (PQRS_category_id),
    CONSTRAINT fk_pqrs_owner FOREIGN KEY (Owner_FK_ID) REFERENCES owner (Owner_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // PQRS tracking status table (no FK dependencies)
  `CREATE TABLE pqrs_tracking_status (
    PQRS_tracking_status_id INT(11) NOT NULL AUTO_INCREMENT,
    PQRS_tracking_status_name VARCHAR(30) NOT NULL,
    PRIMARY KEY (PQRS_tracking_status_id),
    UNIQUE KEY PQRS_tracking_status_name (PQRS_tracking_status_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // PQRS tracking table (depends on pqrs, users, pqrs_tracking_status)
  `CREATE TABLE pqrs_tracking (
    PQRS_tracking_id INT(11) NOT NULL AUTO_INCREMENT,
    PQRS_tracking_PQRS_FK_ID INT(11) NOT NULL,
    PQRS_tracking_user_FK_ID INT(11) NOT NULL,
    PQRS_tracking_status_FK_ID INT(11) NOT NULL,
    PQRS_tracking_date_update TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PQRS_tracking_createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PQRS_tracking_updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (PQRS_tracking_id),
    KEY PQRS_tracking_status_FK_ID (PQRS_tracking_status_FK_ID),
    KEY PQRS_tracking_PQRS_FK_ID (PQRS_tracking_PQRS_FK_ID),
    KEY PQRS_tracking_user_FK_ID (PQRS_tracking_user_FK_ID),
    CONSTRAINT fk_pqrs_tracking_pqrs FOREIGN KEY (PQRS_tracking_PQRS_FK_ID) REFERENCES pqrs (PQRS_id),
    CONSTRAINT fk_pqrs_tracking_status FOREIGN KEY (PQRS_tracking_status_FK_ID) REFERENCES pqrs_tracking_status (PQRS_tracking_status_id),
    CONSTRAINT fk_pqrs_tracking_user FOREIGN KEY (PQRS_tracking_user_FK_ID) REFERENCES users (Users_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // ==================== FACILITIES & RESERVATIONS ====================

  // Facility table (no FK dependencies)
  `CREATE TABLE facility (
    Facility_id INT(11) NOT NULL AUTO_INCREMENT,
    Facility_name VARCHAR(100) NOT NULL,
    Facility_description TEXT DEFAULT NULL,
    Facility_capacity INT(11) NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (Facility_id),
    UNIQUE KEY Facility_name (Facility_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // Reservation status table (no FK dependencies)
  `CREATE TABLE reservation_status (
    Reservation_status_id INT(11) NOT NULL AUTO_INCREMENT,
    Reservation_status_name VARCHAR(30) NOT NULL,
    PRIMARY KEY (Reservation_status_id),
    UNIQUE KEY Reservation_status_name (Reservation_status_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // Reservation type table (no FK dependencies)
  `CREATE TABLE reservation_type (
    Reservation_type_id INT(11) NOT NULL AUTO_INCREMENT,
    Reservation_type_name VARCHAR(30) NOT NULL,
    PRIMARY KEY (Reservation_type_id),
    UNIQUE KEY Reservation_type_name (Reservation_type_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // Reservation table (depends on reservation_type, reservation_status, facility, owner)
  `CREATE TABLE reservation (
    Reservation_id INT(11) NOT NULL AUTO_INCREMENT,
    Reservation_type_FK_ID INT(11) NOT NULL,
    Reservation_status_FK_ID INT(11) NOT NULL,
    Reservation_start_time DATETIME NOT NULL,
    Reservation_end_time DATETIME NOT NULL,
    Facility_FK_ID INT(11) NOT NULL,
    Reservation_description TEXT DEFAULT NULL,
    Owner_FK_ID INT(11) NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (Reservation_id),
    KEY Reservation_type_FK_ID (Reservation_type_FK_ID),
    KEY Reservation_status_FK_ID (Reservation_status_FK_ID),
    KEY Owner_FK_ID (Owner_FK_ID),
    KEY Facility_FK_ID (Facility_FK_ID),
    CONSTRAINT fk_reservation_facility FOREIGN KEY (Facility_FK_ID) REFERENCES facility (Facility_id),
    CONSTRAINT fk_reservation_owner FOREIGN KEY (Owner_FK_ID) REFERENCES owner (Owner_id),
    CONSTRAINT fk_reservation_status FOREIGN KEY (Reservation_status_FK_ID) REFERENCES reservation_status (Reservation_status_id),
    CONSTRAINT fk_reservation_type FOREIGN KEY (Reservation_type_FK_ID) REFERENCES reservation_type (Reservation_type_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // ==================== PAYMENTS ====================

  // Payment status table (no FK dependencies)
  `CREATE TABLE payment_status (
    Payment_status_id INT(11) NOT NULL AUTO_INCREMENT,
    Payment_status_name VARCHAR(30) NOT NULL,
    PRIMARY KEY (Payment_status_id),
    UNIQUE KEY Payment_status_name (Payment_status_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // Payment table (depends on owner, payment_status)
  `CREATE TABLE payment (
    payment_id int NOT NULL AUTO_INCREMENT,
    Owner_ID_FK int NOT NULL,
    Payment_Status_ID_FK int NOT NULL,
    Payment_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Payment_method varchar(30) COLLATE utf8mb4_general_ci NOT NULL,
    Payment_reference_number varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
    currency varchar(3) COLLATE utf8mb4_general_ci DEFAULT 'COP',
    PRIMARY KEY (payment_id),
    KEY Owner_ID_FK (Owner_ID_FK),
    KEY Payment_Status_ID_FK (Payment_Status_ID_FK),
    CONSTRAINT fk_payment_owner FOREIGN KEY (Owner_ID_FK) REFERENCES owner (Owner_id),
    CONSTRAINT fk_payment_status FOREIGN KEY (Payment_Status_ID_FK) REFERENCES payment_status (Payment_status_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  `CREATE TABLE payment_detail (
    detail_id INT NOT NULL AUTO_INCREMENT,
    payment_id_fk INT NOT NULL,
    item_type ENUM('parking', 'reservation') NOT NULL,
    item_id INT NOT NULL,
    amount FLOAT NOT NULL,
    PRIMARY KEY (detail_id),
    KEY payment_id_fk (payment_id_fk),
    CONSTRAINT fk_detail_payment FOREIGN KEY (payment_id_fk) REFERENCES payment (payment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // ==================== NOTIFICATIONS ====================

  // Notification type table (no FK dependencies)
  `CREATE TABLE notification_type (
    Notification_type_id INT(11) NOT NULL AUTO_INCREMENT,
    Notification_type_name VARCHAR(30) NOT NULL,
    PRIMARY KEY (Notification_type_id),
    UNIQUE KEY Notification_type_name (Notification_type_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // Notification table (depends on notification_type, users)
  `CREATE TABLE notification (
    Notification_id INT(11) NOT NULL AUTO_INCREMENT,
    Notification_type_FK_ID INT(11) NOT NULL,
    Notification_description TEXT NOT NULL,
    Notification_User_FK_ID INT(11) DEFAULT NULL,
    Notification_createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Notification_updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (Notification_id),
    KEY Notification_type_FK_ID (Notification_type_FK_ID),
    KEY Notification_User_FK_ID (Notification_User_FK_ID),
    CONSTRAINT fk_notification_type FOREIGN KEY (Notification_type_FK_ID) REFERENCES notification_type (Notification_type_id),
    CONSTRAINT fk_notification_user FOREIGN KEY (Notification_User_FK_ID) REFERENCES users (Users_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // ==================== SURVEYS ====================

  // Survey table (no FK dependencies)
  `CREATE TABLE survey (
    survey_id INT(11) NOT NULL AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (survey_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // Question type table (no FK dependencies)
  `CREATE TABLE question_type (
    question_type_id INT(11) NOT NULL AUTO_INCREMENT,
    Question_type_name VARCHAR(50) NOT NULL,
    Question_type_description TEXT DEFAULT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (question_type_id),
    UNIQUE KEY Question_type_name (Question_type_name)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // Question table (depends on survey, question_type)
  `CREATE TABLE question (
    question_id INT(11) NOT NULL AUTO_INCREMENT,
    survey_id INT(11) NOT NULL,
    title VARCHAR(255) NOT NULL,
    question_type_id INT(11) NOT NULL,
    options LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(options)),
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (question_id),
    KEY survey_id (survey_id),
    KEY question_type_id (question_type_id),
    CONSTRAINT question_ibfk_1 FOREIGN KEY (survey_id) REFERENCES survey (survey_id) ON DELETE CASCADE,
    CONSTRAINT question_ibfk_2 FOREIGN KEY (question_type_id) REFERENCES question_type (question_type_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // Answer table (depends on survey, question)
  `CREATE TABLE answer (
    answer_id INT(11) NOT NULL AUTO_INCREMENT,
    survey_id INT(11) NOT NULL,
    question_id INT(11) NOT NULL,
    user_id INT(11) DEFAULT NULL,
    value TEXT NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (answer_id),
    KEY survey_id (survey_id),
    KEY question_id (question_id),
    CONSTRAINT answer_ibfk_1 FOREIGN KEY (survey_id) REFERENCES survey (survey_id) ON DELETE CASCADE,
    CONSTRAINT answer_ibfk_2 FOREIGN KEY (question_id) REFERENCES question (question_id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // ==================== VISITORS ====================

  // Visitor table (depends on owner)
  `CREATE TABLE visitor (
    ID INT(11) NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    documentNumber VARCHAR(15) NOT NULL,
    host INT(11) NOT NULL,
    enter_date DATETIME NOT NULL,
    exit_date DATETIME DEFAULT NULL,
    PRIMARY KEY (ID),
    KEY host (host),
    CONSTRAINT fk_visitor_host FOREIGN KEY (host) REFERENCES owner (Owner_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
];

export async function runConsolidatedMigration() {
  let connection;

  console.log("🚀 Starting consolidated migration...");
  console.log("📋 Database config:", {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database,
  });

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("✅ Connected to MySQL database");

    let statementCount = 0;
    for (const sql of sqlStatements) {
      try {
        await connection.query(sql);
        statementCount++;
        if (statementCount % 10 === 0) {
          console.log(
            `⏳ Executed ${statementCount}/${sqlStatements.length} statements...`
          );
        }
      } catch (error) {
        console.error("❌ Error executing SQL statement:", error.message);
        console.error("Failed statement:", sql.substring(0, 100) + "...");
        throw error;
      }
    }

    console.log("\n✅ Database migration completed successfully!");
    console.log(`📊 Total statements executed: ${statementCount}`);
    console.log("\n📝 Next steps:");
    console.log("   1. Run seeders to populate initial data");
    console.log("   2. Create an admin user");
    console.log("   3. Start your application\n");

    return { success: true };
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    return { success: false, error };
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}
