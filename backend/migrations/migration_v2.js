import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { connect } from "../config/db/connectMysql.js";
import { encryptPassword } from "../library/appBcrypt.js";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "vallhalladb",
  port: process.env.DB_PORT,
  multipleStatements: true,
};

const sqlStatements = [
  // ===== USER MANAGEMENT STORED PROCEDURES =====
  
  // Get all users with their status and role information
  `DROP PROCEDURE IF EXISTS sp_get_users_with_details;`,
  `CREATE PROCEDURE sp_get_users_with_details()
  BEGIN
    SELECT 
      u.Users_id,
      u.Users_name,
      us.User_status_name,
      r.Role_name,
      u.Users_createdAt,
      u.Users_updatedAt
    FROM users u
    LEFT JOIN user_status us ON u.User_status_FK_ID = us.User_status_id
    LEFT JOIN role r ON u.Role_FK_ID = r.Role_id
    ORDER BY u.Users_id;
  END;`,

  // Insert new user
  `DROP PROCEDURE IF EXISTS sp_insert_user;`,
  `CREATE PROCEDURE sp_insert_user(
    IN p_username VARCHAR(30),
    IN p_user_status_id INT,
    IN p_role_id INT
  )
  BEGIN
    INSERT INTO users (Users_name, User_status_FK_ID, Role_FK_ID, Users_createdAt, Users_updatedAt)
    VALUES (p_username, p_user_status_id, p_role_id, NOW(), NOW());
    SELECT LAST_INSERT_ID() as new_user_id;
  END;`,

  // Update user status
  `DROP PROCEDURE IF EXISTS sp_update_user_status;`,
  `CREATE PROCEDURE sp_update_user_status(
    IN p_user_id INT,
    IN p_status_id INT
  )
  BEGIN
    UPDATE users 
    SET User_status_FK_ID = p_status_id, Users_updatedAt = NOW()
    WHERE Users_id = p_user_id;
    SELECT ROW_COUNT() as affected_rows;
  END;`,

  // ===== OWNER MANAGEMENT STORED PROCEDURES =====
  
  // Get all owners with user and profile information
  `DROP PROCEDURE IF EXISTS sp_get_owners_with_details;`,
  `CREATE PROCEDURE sp_get_owners_with_details()
  BEGIN
    SELECT 
      o.Owner_id,
      u.Users_name,
      p.Profile_fullName,
      p.Profile_document_number,
      p.Profile_telephone_number,
      o.Owner_is_tenant,
      o.Owner_birth_date,
      o.Owner_createdAt,
      o.Owner_updatedAt
    FROM owner o
    LEFT JOIN users u ON o.User_FK_ID = u.Users_id
    LEFT JOIN profile p ON u.Users_id = p.User_FK_ID
    ORDER BY o.Owner_id;
  END;`,

  // Insert new owner
  `DROP PROCEDURE IF EXISTS sp_insert_owner_complete;`,
  `CREATE PROCEDURE sp_insert_owner_complete(
    IN p_user_id INT,
    IN p_is_tenant BOOLEAN,
    IN p_birth_date DATETIME
  )
  BEGIN
    INSERT INTO owner (User_FK_ID, Owner_is_tenant, Owner_birth_date, Owner_createdAt, Owner_updatedAt)
    VALUES (p_user_id, p_is_tenant, p_birth_date, NOW(), NOW());
    SELECT LAST_INSERT_ID() as new_owner_id;
  END;`,

  // ===== APARTMENT MANAGEMENT STORED PROCEDURES =====
  
  // Get apartments with all related information
  `DROP PROCEDURE IF EXISTS sp_get_apartments_with_details;`,
  `CREATE PROCEDURE sp_get_apartments_with_details()
  BEGIN
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
    ORDER BY a.Apartment_id;
  END;`,

  // Insert new apartment
  `DROP PROCEDURE IF EXISTS sp_insert_apartment;`,
  `CREATE PROCEDURE sp_insert_apartment(
    IN p_apartment_number VARCHAR(4),
    IN p_status_id INT,
    IN p_tower_id INT,
    IN p_owner_id INT
  )
  BEGIN
    INSERT INTO apartment (Apartment_number, Apartment_status_FK_ID, Tower_FK_ID, Owner_FK_ID)
    VALUES (p_apartment_number, p_status_id, p_tower_id, p_owner_id);
    SELECT LAST_INSERT_ID() as new_apartment_id;
  END;`,

  // Update apartment status
  `DROP PROCEDURE IF EXISTS sp_update_apartment_status;`,
  `CREATE PROCEDURE sp_update_apartment_status(
    IN p_apartment_id INT,
    IN p_status_id INT
  )
  BEGIN
    UPDATE apartment 
    SET Apartment_status_FK_ID = p_status_id
    WHERE Apartment_id = p_apartment_id;
    SELECT ROW_COUNT() as affected_rows;
  END;`,

  // ===== PARKING MANAGEMENT STORED PROCEDURES =====
  
  // Get parking spaces with details
  `DROP PROCEDURE IF EXISTS sp_get_parking_with_details;`,
  `CREATE PROCEDURE sp_get_parking_with_details()
  BEGIN
    SELECT 
      p.Parking_id,
      p.Parking_number,
      ps.Parking_status_name,
      vt.Vehicle_type_name,
      pt.Parking_type_name,
      u.Users_name as user_name,
      p.Parking_createdAt,
      p.Parking_updatedAt
    FROM parking p
    LEFT JOIN parking_status ps ON p.Parking_status_ID_FK = ps.Parking_status_id
    LEFT JOIN vehicle_type vt ON p.Vehicle_type_ID_FK = vt.Vehicle_type_id
    LEFT JOIN parking_type pt ON p.Parking_type_ID_FK = pt.Parking_type_id
    LEFT JOIN users u ON p.User_ID_FK = u.Users_id
    ORDER BY p.Parking_id;
  END;`,

  // Insert new parking space
  `DROP PROCEDURE IF EXISTS sp_insert_parking;`,
  `CREATE PROCEDURE sp_insert_parking(
    IN p_parking_number VARCHAR(5),
    IN p_status_id INT,
    IN p_vehicle_type_id INT,
    IN p_parking_type_id INT,
    IN p_user_id INT
  )
  BEGIN
    INSERT INTO parking (Parking_number, Parking_status_ID_FK, Vehicle_type_ID_FK, Parking_type_ID_FK, User_ID_FK, Parking_createdAt, Parking_updatedAt)
    VALUES (p_parking_number, p_status_id, p_vehicle_type_id, p_parking_type_id, p_user_id, NOW(), NOW());
    SELECT LAST_INSERT_ID() as new_parking_id;
  END;`,

  // ===== RESERVATION MANAGEMENT STORED PROCEDURES =====
  
  // Get reservations with details
  `DROP PROCEDURE IF EXISTS sp_get_reservations_with_details;`,
  `CREATE PROCEDURE sp_get_reservations_with_details()
  BEGIN
    SELECT 
      r.Reservation_id,
      rt.Reservation_type_name,
      rs.Reservation_status_name,
      r.Reservation_date,
      r.Reservation_start_time,
      r.Reservation_end_time,
      r.Reservation_description,
      o.Owner_id,
      p.Profile_fullName as owner_name
    FROM reservation r
    LEFT JOIN reservation_type rt ON r.Reservation_type_FK_ID = rt.Reservation_type_id
    LEFT JOIN reservation_status rs ON r.Reservation_status_FK_ID = rs.Reservation_status_id
    LEFT JOIN owner o ON r.Owner_FK_ID = o.Owner_id
    LEFT JOIN users u ON o.User_FK_ID = u.Users_id
    LEFT JOIN profile p ON u.Users_id = p.User_FK_ID
    ORDER BY r.Reservation_date DESC;
  END;`,

  // Insert new reservation
  `DROP PROCEDURE IF EXISTS sp_insert_reservation;`,
  `CREATE PROCEDURE sp_insert_reservation(
    IN p_type_id INT,
    IN p_status_id INT,
    IN p_start_time DATETIME,
    IN p_end_time DATETIME,
    IN p_description TEXT,
    IN p_owner_id INT
  )
  BEGIN
    INSERT INTO reservation (Reservation_type_FK_ID, Reservation_status_FK_ID, Reservation_date, Reservation_start_time, Reservation_end_time, Reservation_description, Owner_FK_ID)
    VALUES (p_type_id, p_status_id, NOW(), p_start_time, p_end_time, p_description, p_owner_id);
    SELECT LAST_INSERT_ID() as new_reservation_id;
  END;`,

  // Update reservation status
  `DROP PROCEDURE IF EXISTS sp_update_reservation_status;`,
  `CREATE PROCEDURE sp_update_reservation_status(
    IN p_reservation_id INT,
    IN p_status_id INT
  )
  BEGIN
    UPDATE reservation 
    SET Reservation_status_FK_ID = p_status_id
    WHERE Reservation_id = p_reservation_id;
    SELECT ROW_COUNT() as affected_rows;
  END;`,

  // ===== PQRS MANAGEMENT STORED PROCEDURES =====
  
  // Get PQRS with details
  `DROP PROCEDURE IF EXISTS sp_get_pqrs_with_details;`,
  `CREATE PROCEDURE sp_get_pqrs_with_details()
  BEGIN
    SELECT 
      pq.PQRS_id,
      pc.PQRS_category_name,
      pq.PQRS_description,
      pq.PQRS_file,
      pq.PQRS_answer,
      pq.PQRS_createdAt,
      pq.PQRS_updatedAt
    FROM pqrs pq
    LEFT JOIN pqrs_category pc ON pq.PQRS_category_FK_ID = pc.PQRS_category_id
    ORDER BY pq.PQRS_createdAt DESC;
  END;`,

  // Insert new PQRS
  `DROP PROCEDURE IF EXISTS sp_insert_pqrs;`,
  `CREATE PROCEDURE sp_insert_pqrs(
    IN p_category_id INT,
    IN p_description TEXT,
    IN p_file VARCHAR(255)
  )
  BEGIN
    INSERT INTO pqrs (PQRS_category_FK_ID, PQRS_description, PQRS_file, PQRS_createdAt, PQRS_updatedAt)
    VALUES (p_category_id, p_description, p_file, NOW(), NOW());
    SELECT LAST_INSERT_ID() as new_pqrs_id;
  END;`,

  // Update PQRS answer
  `DROP PROCEDURE IF EXISTS sp_update_pqrs_answer;`,
  `CREATE PROCEDURE sp_update_pqrs_answer(
    IN p_pqrs_id INT,
    IN p_answer TEXT
  )
  BEGIN
    UPDATE pqrs 
    SET PQRS_answer = p_answer, PQRS_updatedAt = NOW()
    WHERE PQRS_id = p_pqrs_id;
    SELECT ROW_COUNT() as affected_rows;
  END;`,

  // ===== PAYMENT MANAGEMENT STORED PROCEDURES =====
  
  // Get payments with details
  `DROP PROCEDURE IF EXISTS sp_get_payments_with_details;`,
  `CREATE PROCEDURE sp_get_payments_with_details()
  BEGIN
    SELECT 
      pay.payment_id,
      o.Owner_id,
      p.Profile_fullName as owner_name,
      pay.Payment_total_payment,
      ps.Payment_status_name,
      pay.Payment_date,
      pay.Payment_method,
      pay.Payment_reference_number
    FROM payment pay
    LEFT JOIN owner o ON pay.Owner_ID_FK = o.Owner_id
    LEFT JOIN users u ON o.User_FK_ID = u.Users_id
    LEFT JOIN profile p ON u.Users_id = p.User_FK_ID
    LEFT JOIN payment_status ps ON pay.Payment_Status_ID_FK = ps.Payment_status_id
    ORDER BY pay.Payment_date DESC;
  END;`,

  // Insert new payment
  `DROP PROCEDURE IF EXISTS sp_insert_payment;`,
  `CREATE PROCEDURE sp_insert_payment(
    IN p_owner_id INT,
    IN p_total_payment FLOAT,
    IN p_status_id INT,
    IN p_method VARCHAR(30),
    IN p_reference VARCHAR(50)
  )
  BEGIN
    INSERT INTO payment (Owner_ID_FK, Payment_total_payment, Payment_Status_ID_FK, Payment_date, Payment_method, Payment_reference_number)
    VALUES (p_owner_id, p_total_payment, p_status_id, NOW(), p_method, p_reference);
    SELECT LAST_INSERT_ID() as new_payment_id;
  END;`,

  // Update payment status
  `DROP PROCEDURE IF EXISTS sp_update_payment_status;`,
  `CREATE PROCEDURE sp_update_payment_status(
    IN p_payment_id INT,
    IN p_status_id INT
  )
  BEGIN
    UPDATE payment 
    SET Payment_Status_ID_FK = p_status_id
    WHERE payment_id = p_payment_id;
    SELECT ROW_COUNT() as affected_rows;
  END;`,

  // ===== PET MANAGEMENT STORED PROCEDURES =====
  
  // Get pets with owner details
  `DROP PROCEDURE IF EXISTS sp_get_pets_with_details;`,
  `CREATE PROCEDURE sp_get_pets_with_details()
  BEGIN
    SELECT 
      pet.Pet_id,
      pet.Pet_name,
      pet.Pet_species,
      pet.Pet_Breed,
      pet.Pet_vaccination_card,
      pet.Pet_Photo,
      o.Owner_id,
      p.Profile_fullName as owner_name,
      pet.Pet_createdAt,
      pet.Pet_updatedAt
    FROM pet pet
    LEFT JOIN owner o ON pet.Owner_FK_ID = o.Owner_id
    LEFT JOIN users u ON o.User_FK_ID = u.Users_id
    LEFT JOIN profile p ON u.Users_id = p.User_FK_ID
    ORDER BY pet.Pet_id;
  END;`,

  // Insert new pet
  `DROP PROCEDURE IF EXISTS sp_insert_pet_complete;`,
  `CREATE PROCEDURE sp_insert_pet_complete(
    IN p_name VARCHAR(30),
    IN p_species VARCHAR(30),
    IN p_breed VARCHAR(30),
    IN p_vaccination_card VARCHAR(255),
    IN p_photo VARCHAR(255),
    IN p_owner_id INT
  )
  BEGIN
    INSERT INTO pet (Pet_name, Pet_species, Pet_Breed, Pet_vaccination_card, Pet_Photo, Owner_FK_ID, Pet_createdAt, Pet_updatedAt)
    VALUES (p_name, p_species, p_breed, p_vaccination_card, p_photo, p_owner_id, NOW(), NOW());
    SELECT LAST_INSERT_ID() as new_pet_id;
  END;`,

  // ===== VISITOR MANAGEMENT STORED PROCEDURES =====
  
  // Get visitors with host details
  `DROP PROCEDURE IF EXISTS sp_get_visitors_with_details;`,
  `CREATE PROCEDURE sp_get_visitors_with_details()
  BEGIN
    SELECT 
      v.ID,
      v.name,
      v.documentNumber,
      v.host,
      p.Profile_fullName as host_name,
      v.enter_date,
      v.exit_date
    FROM visitor v
    LEFT JOIN owner o ON v.host = o.Owner_id
    LEFT JOIN users u ON o.User_FK_ID = u.Users_id
    LEFT JOIN profile p ON u.Users_id = p.User_FK_ID
    ORDER BY v.enter_date DESC;
  END;`,

  // Insert new visitor
  `DROP PROCEDURE IF EXISTS sp_insert_visitor;`,
  `CREATE PROCEDURE sp_insert_visitor(
    IN p_name VARCHAR(255),
    IN p_document_number VARCHAR(15),
    IN p_host_id INT
  )
  BEGIN
    INSERT INTO visitor (name, documentNumber, host, enter_date)
    VALUES (p_name, p_document_number, p_host_id, NOW());
    SELECT LAST_INSERT_ID() as new_visitor_id;
  END;`,

  // Update visitor exit date
  `DROP PROCEDURE IF EXISTS sp_update_visitor_exit;`,
  `CREATE PROCEDURE sp_update_visitor_exit(
    IN p_visitor_id INT
  )
  BEGIN
    UPDATE visitor 
    SET exit_date = NOW()
    WHERE ID = p_visitor_id;
    SELECT ROW_COUNT() as affected_rows;
  END;`,

  // ===== GUARD MANAGEMENT STORED PROCEDURES =====
  
  // Get guards with user details
  `DROP PROCEDURE IF EXISTS sp_get_guards_with_details;`,
  `CREATE PROCEDURE sp_get_guards_with_details()
  BEGIN
    SELECT 
      g.Guard_id,
      u.Users_name,
      p.Profile_fullName,
      g.Guard_arl,
      g.Guard_eps,
      g.Guard_shift,
      g.Guard_createdAt,
      g.Guard_updatedAt
    FROM guard g
    LEFT JOIN users u ON g.User_FK_ID = u.Users_id
    LEFT JOIN profile p ON u.Users_id = p.User_FK_ID
    ORDER BY g.Guard_id;
  END;`,

  // Insert new guard
  `DROP PROCEDURE IF EXISTS sp_insert_guard;`,
  `CREATE PROCEDURE sp_insert_guard(
    IN p_user_id INT,
    IN p_arl VARCHAR(30),
    IN p_eps VARCHAR(30),
    IN p_shift VARCHAR(30)
  )
  BEGIN
    INSERT INTO guard (User_FK_ID, Guard_arl, Guard_eps, Guard_shift, Guard_createdAt, Guard_updatedAt)
    VALUES (p_user_id, p_arl, p_eps, p_shift, NOW(), NOW());
    SELECT LAST_INSERT_ID() as new_guard_id;
  END;`,

  // ===== NOTIFICATION MANAGEMENT STORED PROCEDURES =====
  
  // Get notifications with details
  `DROP PROCEDURE IF EXISTS sp_get_notifications_with_details;`,
  `CREATE PROCEDURE sp_get_notifications_with_details()
  BEGIN
    SELECT 
      n.Notification_id,
      nt.Notification_type_name,
      n.Notification_description,
      u.Users_name as user_name,
      n.Notification_createdAt,
      n.Notification_updatedAt
    FROM notification n
    LEFT JOIN notification_type nt ON n.Notification_type_FK_ID = nt.Notification_type_id
    LEFT JOIN users u ON n.Notification_User_FK_ID = u.Users_id
    ORDER BY n.Notification_createdAt DESC;
  END;`,

  // Insert new notification
  `DROP PROCEDURE IF EXISTS sp_insert_notification;`,
  `CREATE PROCEDURE sp_insert_notification(
    IN p_type_id INT,
    IN p_description TEXT,
    IN p_user_id INT
  )
  BEGIN
    INSERT INTO notification (Notification_type_FK_ID, Notification_description, Notification_User_FK_ID, Notification_createdAt, Notification_updatedAt)
    VALUES (p_type_id, p_description, p_user_id, NOW(), NOW());
    SELECT LAST_INSERT_ID() as new_notification_id;
  END;`,

  // ===== SURVEY MANAGEMENT STORED PROCEDURES =====
  
  // Get surveys with details
  `DROP PROCEDURE IF EXISTS sp_get_surveys_with_details;`,
  `CREATE PROCEDURE sp_get_surveys_with_details()
  BEGIN
    SELECT 
      s.Survey_id,
      s.Survey_name,
      s.Survey_description,
      q.Questions_description,
      s.Survey_result,
      u.Users_name as user_name,
      s.Survey_createdAt,
      s.Survey_updatedAt
    FROM survey s
    LEFT JOIN questions q ON s.Questions_FK_ID = q.Questions_id
    LEFT JOIN users u ON s.User_FK_ID = u.Users_id
    ORDER BY s.Survey_createdAt DESC;
  END;`,

  // Insert new survey
  `DROP PROCEDURE IF EXISTS sp_insert_survey;`,
  `CREATE PROCEDURE sp_insert_survey(
    IN p_name VARCHAR(30),
    IN p_description TEXT,
    IN p_question_id INT,
    IN p_user_id INT
  )
  BEGIN
    INSERT INTO survey (Survey_name, Survey_description, Questions_FK_ID, User_FK_ID, Survey_createdAt, Survey_updatedAt)
    VALUES (p_name, p_description, p_question_id, p_user_id, NOW(), NOW());
    SELECT LAST_INSERT_ID() as new_survey_id;
  END;`,

  // ===== VEHICLE MANAGEMENT STORED PROCEDURES =====
  
  // Get vehicles with details
  `DROP PROCEDURE IF EXISTS sp_get_vehicles_with_details;`,
  `CREATE PROCEDURE sp_get_vehicles_with_details()
  BEGIN
    SELECT 
      vt.Vehicle_type_id,
      vt.Vehicle_type_name,
      vt.vehicle_plate,
      vt.vehicle_model,
      vt.vehicle_brand,
      vt.vehicle_color,
      vt.vehicle_engineCC
    FROM vehicle_type vt
    ORDER BY vt.Vehicle_type_id;
  END;`,

  // Insert new vehicle
  `DROP PROCEDURE IF EXISTS sp_insert_vehicle;`,
  `CREATE PROCEDURE sp_insert_vehicle(
    IN p_name VARCHAR(30),
    IN p_plate VARCHAR(30),
    IN p_model VARCHAR(30),
    IN p_brand VARCHAR(30),
    IN p_color VARCHAR(30),
    IN p_engine_cc VARCHAR(30)
  )
  BEGIN
    INSERT INTO vehicle_type (Vehicle_type_name, vehicle_plate, vehicle_model, vehicle_brand, vehicle_color, vehicle_engineCC)
    VALUES (p_name, p_plate, p_model, p_brand, p_color, p_engine_cc);
    SELECT LAST_INSERT_ID() as new_vehicle_id;
  END;`,

  // ===== PROFILE MANAGEMENT STORED PROCEDURES =====
  
  // Get profiles with user details
  `DROP PROCEDURE IF EXISTS sp_get_profiles_with_details;`,
  `CREATE PROCEDURE sp_get_profiles_with_details()
  BEGIN
    SELECT 
      p.Profile_id,
      p.Profile_fullName,
      u.Users_name,
      p.Profile_document_type,
      p.Profile_document_number,
      p.Profile_telephone_number,
      p.Profile_photo
    FROM profile p
    LEFT JOIN users u ON p.User_FK_ID = u.Users_id
    ORDER BY p.Profile_id;
  END;`,

  // Insert new profile
  `DROP PROCEDURE IF EXISTS sp_insert_profile;`,
  `CREATE PROCEDURE sp_insert_profile(
    IN p_full_name VARCHAR(100),
    IN p_user_id INT,
    IN p_document_type VARCHAR(20),
    IN p_document_number VARCHAR(30),
    IN p_telephone VARCHAR(12),
    IN p_photo VARCHAR(255)
  )
  BEGIN
    INSERT INTO profile (Profile_fullName, User_FK_ID, Profile_document_type, Profile_document_number, Profile_telephone_number, Profile_photo)
    VALUES (p_full_name, p_user_id, p_document_type, p_document_number, p_telephone, p_photo);
    SELECT LAST_INSERT_ID() as new_profile_id;
  END;`,

  // ===== ROLE AND PERMISSION STORED PROCEDURES =====
  
  // Get roles with permissions
  `DROP PROCEDURE IF EXISTS sp_get_roles_with_permissions;`,
  `CREATE PROCEDURE sp_get_roles_with_permissions()
  BEGIN
    SELECT 
      r.Role_id,
      r.Role_name,
      r.Role_description,
      GROUP_CONCAT(DISTINCT p.Permissions_name) as permissions,
      r.Role_createdAt,
      r.Role_updatedAt
    FROM role r
    LEFT JOIN module_role mr ON r.Role_id = mr.Role_FK_ID
    LEFT JOIN permissions_module_role pmr ON mr.Module_role_id = pmr.Module_role_FK_ID
    LEFT JOIN permissions p ON pmr.Permissions_FK_ID = p.Permissions_id
    GROUP BY r.Role_id
    ORDER BY r.Role_id;
  END;`,

  // Insert new role
  `DROP PROCEDURE IF EXISTS sp_insert_role;`,
  `CREATE PROCEDURE sp_insert_role(
    IN p_name VARCHAR(30),
    IN p_description TEXT
  )
  BEGIN
    INSERT INTO role (Role_name, Role_description, Role_createdAt, Role_updatedAt)
    VALUES (p_name, p_description, NOW(), NOW());
    SELECT LAST_INSERT_ID() as new_role_id;
  END;`,

  // ===== UTILITY STORED PROCEDURES =====
  
  // Get dashboard statistics
  `DROP PROCEDURE IF EXISTS sp_get_dashboard_stats;`,
  `CREATE PROCEDURE sp_get_dashboard_stats()
  BEGIN
    SELECT 
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM owner) as total_owners,
      (SELECT COUNT(*) FROM apartment) as total_apartments,
      (SELECT COUNT(*) FROM parking) as total_parking_spaces,
      (SELECT COUNT(*) FROM reservation WHERE Reservation_status_FK_ID = 1) as active_reservations,
      (SELECT COUNT(*) FROM pqrs WHERE PQRS_answer IS NULL) as pending_pqrs,
      (SELECT COUNT(*) FROM visitor WHERE exit_date IS NULL) as current_visitors,
      (SELECT COUNT(*) FROM payment WHERE Payment_Status_ID_FK = 2) as pending_payments;
  END;`,

  // Search users by name
  `DROP PROCEDURE IF EXISTS sp_search_users;`,
  `CREATE PROCEDURE sp_search_users(IN p_search_term VARCHAR(100))
  BEGIN 
  SELECT
      u.Users_id,
      u.Users_name,
      us.User_status_name,
      r.Role_name,
      p.Profile_fullName,
      p.Profile_document_number
    FROM users u
    LEFT JOIN user_status us ON u.User_status_FK_ID = us.User_status_id
    LEFT JOIN role r ON u.Role_FK_ID = r.Role_id
    LEFT JOIN profile p ON u.Users_id = p.User_FK_ID
    WHERE u.Users_name LIKE CONCAT('%', p_search_term, '%')
       OR p.Profile_fullName LIKE CONCAT('%', p_search_term, '%')
       OR p.Profile_document_number LIKE CONCAT('%', p_search_term, '%')
    ORDER BY u.Users_name;
  END;`,

  // Get apartment occupancy report
  `DROP PROCEDURE IF EXISTS sp_get_apartment_occupancy_report;`,
  `CREATE PROCEDURE sp_get_apartment_occupancy_report()
    BEGIN 
  SELECT
      t.Tower_name,
      ast.Apartment_status_name,
      COUNT(*) as apartment_count
    FROM apartment a
    LEFT JOIN tower t ON a.Tower_FK_ID = t.Tower_id
    LEFT JOIN apartment_status ast ON a.Apartment_status_FK_ID = ast.Apartment_status_id
    GROUP BY t.Tower_id, ast.Apartment_status_id
    ORDER BY t.Tower_name, ast.Apartment_status_name;
  END;`,

  // Get parking availability report
  `DROP PROCEDURE IF EXISTS sp_get_parking_availability_report;`,
  `CREATE PROCEDURE sp_get_parking_availability_report()
  BEGIN
    SELECT 
      pt.Parking_type_name,
      ps.Parking_status_name,
      COUNT(*) as parking_count
    FROM parking p
    LEFT JOIN parking_type pt ON p.Parking_type_ID_FK = pt.Parking_type_id
    LEFT JOIN parking_status ps ON p.Parking_status_ID_FK = ps.Parking_status_id
    GROUP BY pt.Parking_type_id, ps.Parking_status_id
    ORDER BY pt.Parking_type_name, ps.Parking_status_name;
  END;`
];

export async function runMigration() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("Connected to MySQL database");

    for (const sql of sqlStatements) {
      try {
        await connection.query(sql);
        console.log("Executed SQL statement successfully");
      } catch (error) {
        console.error("Error executing SQL:", error.message);
        throw error;
      }
    }

    console.log("Database migration v2 completed successfully!");
    return { success: true };
  } catch (error) {
    console.error("Migration failed:", error);
    return { success: false, error };
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed");
    }
  }
}

// Test data creation function
async function createTestData(connection) {
  try {
    const testData = {
      // User status data
      userStatuses: [
        { name: "active", description: "Active user account" },
        { name: "inactive", description: "Inactive user account" },
        { name: "suspended", description: "Suspended user account" },
      ],

      // Document types
      documentTypes: [
        { name: "CC", description: "Cédula de Ciudadanía" },
        { name: "TI", description: "Tarjeta de Identidad" },
        { name: "P", description: "Pasaporte" },
      ],

      // Modules
      modules: [
        { name: "users", description: "User management module" },
        { name: "profiles", description: "Profile management module" },
        { name: "roles", description: "Role management module" },
        { name: "api", description: "API management module" },
        { name: "system", description: "System administration module" },
      ],

      // Roles
      roles: [
        { name: "Admin", description: "System administrator with full access" },
        { name: "User", description: "Regular user with limited access" },
        { name: "Moderator", description: "Moderator with intermediate access" },
      ],

      // Permissions (will be created based on modules)
      permissionActions: ["create", "read", "update", "delete"]
    };

    // Insert user statuses
    console.log("Creating user statuses...");
    for (const status of testData.userStatuses) {
      await connection.query(
        'INSERT INTO user_status (name, description) VALUES (?, ?)',
        [status.name, status.description]
      );
    }

    // Insert document types
    console.log("Creating document types...");
    for (const docType of testData.documentTypes) {
      await connection.query(
        'INSERT INTO document_type (name, description) VALUES (?, ?)',
        [docType.name, docType.description]
      );
    }

    // Insert modules
    console.log("Creating modules...");
    const moduleIds = {};
    for (const module of testData.modules) {
      const [result] = await connection.query(
        'INSERT INTO modules (name, description) VALUES (?, ?)',
        [module.name, module.description]
      );
      moduleIds[module.name] = result.insertId;
    }

    // Insert roles
    console.log("Creating roles...");
    const roleIds = {};
    for (const role of testData.roles) {
      const [result] = await connection.query(
        'INSERT INTO role (name, description) VALUES (?, ?)',
        [role.name, role.description]
      );
      roleIds[role.name] = result.insertId;
    }

    // Insert permissions for each module-action combination
    console.log("Creating permissions...");
    const permissionIds = {};
    for (const moduleName of Object.keys(moduleIds)) {
      for (const action of testData.permissionActions) {
        const permissionName = `${moduleName}:${action}`;
        const description = `${action.charAt(0).toUpperCase() + action.slice(1)} permission for ${moduleName} module`;
        
        const [result] = await connection.query(
          'INSERT INTO permissions (module_id, action, name, description) VALUES (?, ?, ?, ?)',
          [moduleIds[moduleName], action, permissionName, description]
        );
        permissionIds[permissionName] = result.insertId;
      }
    }

    // Assign all permissions to Admin role
    console.log("Assigning permissions to Admin role...");
    for (const permissionId of Object.values(permissionIds)) {
      await connection.query(
        'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
        [roleIds.Admin, permissionId]
      );
    }

    // Assign basic read permissions to User role
    console.log("Assigning basic permissions to User role...");
    const userPermissions = ['users:read', 'profiles:read', 'profiles:update'];
    for (const permName of userPermissions) {
      if (permissionIds[permName]) {
        await connection.query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
          [roleIds.User, permissionIds[permName]]
        );
      }
    }

    // Create sample users
    console.log("Creating sample users...");
    
    // Create admin web user
    const adminPasswordHash = await encryptPassword('admin123');
    const [adminUserResult] = await connection.query(
      'INSERT INTO web_users (username, email, password_hash, status_id) VALUES (?, ?, ?, ?)',
      ['admin', 'admin@example.com', adminPasswordHash, 1]
    );
    
    // Create admin profile
    await connection.query(
      'INSERT INTO profiles (web_user_id, first_name, last_name, document_type_id, document_number) VALUES (?, ?, ?, ?, ?)',
      [adminUserResult.insertId, 'System', 'Administrator', 1, '00000000']
    );
    
    // Assign admin role to admin user
    await connection.query(
      'INSERT INTO web_user_roles (user_id, role_id, assigned_by) VALUES (?, ?, ?)',
      [adminUserResult.insertId, roleIds.Admin, adminUserResult.insertId]
    );

    // Create sample API user
    const apiPasswordHash = await encryptPassword('apiuser123');
    const [apiUserResult] = await connection.query(
      'INSERT INTO api_users (username, email, password_hash, description, status_id) VALUES (?, ?, ?, ?, ?)',
      ['apiuser', 'apiuser@example.com', apiPasswordHash, 'Sample API user for testing', 1]
    );
    
    // Assign user role to API user
    await connection.query(
      'INSERT INTO api_user_roles (api_user_id, role_id, assigned_by) VALUES (?, ?, ?)',
      [apiUserResult.insertId, roleIds.User, adminUserResult.insertId]
    );

    console.log("📋 Test data creation summary:");
    console.log(`   - User statuses: ${testData.userStatuses.length}`);
    console.log(`   - Document types: ${testData.documentTypes.length}`);
    console.log(`   - Modules: ${testData.modules.length}`);
    console.log(`   - Roles: ${testData.roles.length}`);
    console.log(`   - Permissions: ${Object.keys(permissionIds).length}`);
    console.log(`   - Sample users: 2 (1 web admin, 1 API user)`);
    console.log("");
    console.log("🔑 Default login credentials:");
    console.log("   Web Admin: admin / admin123");
    console.log("   API User: apiuser / apiuser123");

    return { success: true };
  } catch (error) {
    console.error("Error creating test data:", error);
    return { success: false, error: error.message };
  }
}

// Execute migration if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration()
    .then((result) => {
      if (result.success) {
        console.log("🎉 Migration and test data setup completed successfully!");
        process.exit(0);
      } else {
        console.error("❌ Migration failed:", result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("❌ Migration error:", error);
      process.exit(1);
    });
}
