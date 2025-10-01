import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { createConnection } from 'mysql2/promise';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vallhalladb',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  multipleStatements: true,
};

const sqlStatements = [
  // Add missing guard table after users table is created
  // (will insert this later in the array)
  `DROP DATABASE IF EXISTS ${dbConfig.database};`,

  `CREATE DATABASE IF NOT EXISTS ${dbConfig.database} DEFAULT CHARACTER SET utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // Use database
  `USE ${dbConfig.database};`,

  // Add missing answer table after DB is created
  `CREATE TABLE answer (
      answer_id int(11) NOT NULL,
      survey_id int(11) NOT NULL,
      question_id int(11) NOT NULL,
      user_id int(11) DEFAULT NULL,
      value text NOT NULL,
      createdAt timestamp NOT NULL DEFAULT current_timestamp()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to answer table
  `INSERT INTO answer (answer_id, survey_id, question_id, user_id, value, createdAt) VALUES 
    (1, 1, 1, 2, '4', '2025-07-12 02:31:58'),
    (2, 1, 1, 3, '5', '2025-07-12 02:31:58'),
    (3, 1, 2, 2, '[\"Cameras\", \"Access Control\"]', '2025-07-12 02:31:58'),
    (4, 2, 3, 4, '[\"Sports\", \"Social\"]', '2025-07-12 02:31:58'),
    (5, 3, 4, 5, '3', '2025-07-12 02:31:58');`,

  // Add missing apartment table after DB is created
  `CREATE TABLE apartment (
    Apartment_id int(11) NOT NULL,
    Apartment_number varchar(4) NOT NULL,
    Apartment_status_FK_ID int(11) NOT NULL,
    Tower_FK_ID int(11) NOT NULL,
    Owner_FK_ID int(11) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to apartment table
  `INSERT INTO apartment (Apartment_id, Apartment_number, Apartment_status_FK_ID, Tower_FK_ID, Owner_FK_ID) VALUES
    (1, '101', 1, 1, 1),
    (2, '102', 2, 1, 2),
    (3, '201', 1, 2, 3),
    (4, '202', 2, 2, 4),
    (5, '301', 1, 3, 5),
    (6, '302', 2, 3, 1),
    (7, '401', 1, 4, 2),
    (8, '402', 2, 4, 3),
    (9, '501', 1, 5, 4),
    (10, '502', 2, 5, 5);`,

  // Add missing apartment_status table after DB is created
  `CREATE TABLE apartment_status (
    Apartment_status_id int(11) NOT NULL,
    Apartment_status_name varchar(30) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to apartment_status table
  `INSERT INTO apartment_status (Apartment_status_id, Apartment_status_name) VALUES
    (1, 'Available'),
    (2, 'Occupied');`,

  // Add missing facility table after DB is created
  `CREATE TABLE facility (
    Facility_id int(11) NOT NULL,
    Facility_name varchar(100) NOT NULL,
    Facility_description text DEFAULT NULL,
    Facility_capacity int(11) NOT NULL,
    createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to facility table
  `INSERT INTO facility (Facility_id, Facility_name, Facility_description, Facility_capacity, createdAt, updatedAt) VALUES
    (1, 'Swimming Pool', 'Main swimming pool area', 30, '2025-07-12 02:31:57', '2025-07-12 02:31:57'),
    (2, 'Gym', 'Fitness center with equipment', 20, '2025-07-12 02:31:57', '2025-07-12 02:31:57'),
    (3, 'Party Room', 'Event space for celebrations', 50, '2025-07-12 02:31:57', '2025-07-12 02:31:57'),
    (4, 'BBQ Area', 'Outdoor grilling space', 15, '2025-07-12 02:31:57', '2025-07-12 02:31:57'),
    (5, 'Tennis Court', 'Professional tennis court', 4, '2025-07-12 02:31:57', '2025-07-12 02:31:57');`,

  // Add missing guard table after DB is created
  `CREATE TABLE guard (
    Guard_id int(11) NOT NULL,
    User_FK_ID int(11) NOT NULL,
    Guard_arl varchar(30) NOT NULL,
    Guard_eps varchar(30) NOT NULL,
    Guard_shift varchar(30) NOT NULL,
    Guard_createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    Guard_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to guard table
  `INSERT INTO guard (Guard_id, User_FK_ID, Guard_arl, Guard_eps, Guard_shift, Guard_createdAt, Guard_updatedAt) VALUES
    (1, 4, 'Sura ARL', 'Nueva EPS', 'Morning', '2025-07-12 02:31:57', '2025-07-12 02:31:57'),
    (2, 5, 'Colmena ARL', 'Sanitas EPS', 'Night', '2025-07-12 02:31:57', '2025-09-24 23:45:11');`,

  // Add missing module table after DB is created
  `CREATE TABLE module (
    module_id int(11) NOT NULL,
    module_name varchar(30) NOT NULL,
    module_description text NOT NULL,
    module_createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    module_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to guard table
  `INSERT INTO module (module_id, module_name, module_description, module_createdAt, module_updatedAt) VALUES
    (1, 'users', 'users management', '2025-07-12 02:31:57', '2025-09-07 03:36:24'),
    (2, 'owners', 'owners management', '2025-07-12 02:31:57', '2025-09-07 03:36:24'),
    (3, 'apartments', 'apartments management', '2025-07-12 02:31:57', '2025-09-07 03:36:24'),
    (4, 'parking', 'parking management', '2025-07-12 02:31:57', '2025-09-07 03:36:24'),
    (5, 'pets', 'pets management', '2025-07-12 02:31:57', '2025-09-07 03:36:24'),
    (6, 'pqrs', 'pqrs management', '2025-07-12 02:31:57', '2025-09-07 03:36:24'),
    (7, 'reservations', 'reservations management', '2025-07-12 02:31:57', '2025-09-07 03:36:24'),
    (8, 'payments', 'payments management', '2025-07-12 02:31:57', '2025-09-07 03:36:24'),
    (9, 'visitors', 'visitors management', '2025-07-12 02:31:57', '2025-09-07 03:36:24'),
    (10, 'surveys', 'surveys management', '2025-07-12 02:31:57', '2025-09-07 03:36:24'),
    (11, 'profiles', 'Profile management module', '2025-07-12 02:31:57', '2025-07-12 02:31:57'),
    (12, 'notifications', 'notifications management', '2025-07-12 02:31:57', '2025-09-07 03:36:24'),
    (13, 'apartment-status', 'apartment-status management', '2025-07-12 02:31:57', '2025-09-07 03:36:24'),
    (14, 'towers', 'Towers management module', '2025-07-12 02:31:57', '2025-07-12 02:31:57'),
    (15, 'questions', 'questions management', '2025-07-12 02:31:57', '2025-09-07 03:36:24'),
    (16, 'answers', 'answers management', '2025-07-12 02:31:57', '2025-09-07 03:36:24'),
    (17, 'reservation-status', 'reservation-status management', '2025-07-12 02:31:57', '2025-09-07 03:36:24'),
    (18, 'reservation-type', 'reservation-type management', '2025-07-12 02:31:57', '2025-09-07 03:36:24'),
    (19, 'role-permissions', 'role-permissions management', '2025-07-12 02:31:57', '2025-09-07 03:36:24'),
    (20, 'modules', 'modules management', '2025-07-12 02:31:57', '2025-09-07 03:36:24'),
    (21, 'user-status', 'User status management module', '2025-07-12 02:31:57', '2025-07-12 02:31:57'),
    (22, 'pqrs-categories', 'pqrs-categories management', '2025-07-12 02:31:57', '2025-09-07 03:36:24'),
    (23, 'guards', 'Guards management module', '2025-07-12 02:31:57', '2025-07-12 02:31:57'),
    (24, 'facilities', 'Facilities management module', '2025-07-12 02:31:57', '2025-07-12 02:31:57'),
    (25, 'permissions', 'permissions management', '2025-07-12 02:31:57', '2025-09-07 03:36:24'),
    (26, 'vehicle-type', 'vehicle-type management', '2025-07-12 02:31:57', '2025-09-07 03:36:24'),
    (27, 'roles', 'roles management', '2025-07-12 02:31:57', '2025-09-07 03:36:24'),
    (50, 'profile', 'profile management', '2025-09-07 03:36:24', '2025-09-07 03:36:24'),
    (74, 'packages', 'module for packages receive and control', '2025-09-07 22:26:22', '2025-09-07 22:26:22');`,

  // Add missing module_role table after DB is created
  `CREATE TABLE module_role (
    Module_role_id int(11) NOT NULL,
    Role_FK_ID int(11) NOT NULL,
    Module_FK_ID int(11) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to guard table
  `INSERT INTO module_role (Module_role_id, Role_FK_ID, Module_FK_ID) VALUES
    (1, 1, 11), (2, 1, 16), (3, 1, 13), (4, 1, 3), (5, 1, 24), (6, 1, 23), (7, 1, 20),
    (8, 1, 12), (9, 1, 2), (10, 1, 4), (11, 1, 8), (12, 1, 25), (13, 1, 5), (14, 1, 6),
    (15, 1, 22), (16, 1, 11), (17, 1, 15), (18, 1, 17), (19, 1, 18), (20, 1, 7), (21, 1, 19),
    (22, 1, 27), (23, 1, 10), (24, 1, 14), (25, 1, 21), (26, 1, 1), (27, 1, 26), (28, 1, 9),
    (33, 1, 11), (34, 2, 11), (35, 3, 11), (36, 2, 16), (37, 2, 13), (38, 2, 3), (39, 2, 24),
    (40, 2, 23), (41, 2, 20), (42, 2, 12), (43, 2, 2), (44, 2, 4), (45, 2, 8), (46, 2, 25),
    (47, 2, 5), (48, 2, 6), (49, 2, 22), (50, 2, 11), (51, 2, 15), (52, 2, 17), (53, 2, 18),
    (54, 2, 7), (55, 2, 19), (56, 2, 27), (57, 2, 10), (58, 2, 14), (59, 2, 21), (60, 2, 26),
    (67, 3, 13), (68, 3, 3), (69, 3, 24), (70, 3, 23), (71, 3, 20), (72, 3, 2), (73, 3, 4), 
    (74, 3, 25), (75, 3, 11), (76, 3, 19), (77, 3, 27),  (78, 3, 14), (79, 3, 21), (80, 3, 26), (81, 3, 9), (82, 3, 74);`,

  // Add missing notification table after DB is created
  `CREATE TABLE notification (
    Notification_id int(11) NOT NULL,
    Notification_type_FK_ID int(11) NOT NULL,
    Notification_description text NOT NULL,
    Notification_User_FK_ID int(11) DEFAULT NULL,
    Notification_createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    Notification_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to notification table
  `INSERT INTO notification (Notification_id, Notification_type_FK_ID, Notification_description, Notification_User_FK_ID, Notification_createdAt, Notification_updatedAt) VALUES
    (2, 2, 'Your payment for March 2024 has been received.', 2, '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (3, 3, 'Your facility reservation has been confirmed.', 2, '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (4, 5, 'New document requires your attention', 4, '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (5, 4, 'Security incident reported in parking area', NULL, '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (6, 3, 'Community event: Summer BBQ this weekend', NULL, '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (7, 5, 'Annual meeting minutes available', 5, '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (8, 2, 'Maintenance fee payment successful', 7, '2025-07-12 02:31:58', '2025-07-12 02:31:58');`,

  // Add missing notification table after DB is created
  `CREATE TABLE notification_type (
    Notification_type_id int(11) NOT NULL,
    Notification_type_name varchar(30) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to notification_type table
  `INSERT INTO notification_type (Notification_type_id, Notification_type_name) VALUES
    (5, 'Document'),
    (3, 'Event'),
    (6, 'Maintenance'),
    (2, 'Payment'),
    (8, 'PQRS'),
    (7, 'Reservation'),
    (4, 'Security'),
    (1, 'System');`,

  // Add missing owner table after DB is created
  `CREATE TABLE owner (
    Owner_id int(11) NOT NULL,
    User_FK_ID int(11) NOT NULL,
    Owner_is_tenant tinyint(1) NOT NULL,
    Owner_birth_date datetime NOT NULL,
    Owner_createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    Owner_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to owner table
  `INSERT INTO owner (Owner_id, User_FK_ID, Owner_is_tenant, Owner_birth_date, Owner_createdAt, Owner_updatedAt) VALUES
    (1, 2, 0, '2025-07-11 21:31:57', '2025-07-12 02:31:57', '2025-07-12 02:31:57'),
    (2, 7, 0, '1980-05-15 00:00:00', '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (3, 8, 1, '1975-08-22 00:00:00', '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (4, 10, 0, '1990-03-10 00:00:00', '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (5, 11, 1, '1985-11-30 00:00:00', '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (6, 12, 0, '1982-07-25 00:00:00', '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (7, 16, 0, '2025-09-17 00:00:00', '2025-09-18 00:06:40', '2025-09-18 00:06:40');`,

  // Add missing parking table after DB is created
  `CREATE TABLE parking (
    Parking_id int(11) NOT NULL,
    Parking_number varchar(10) NOT NULL,
    Parking_status_ID_FK int(11) NOT NULL,
    Vehicle_type_ID_FK int(11) DEFAULT NULL,
    Parking_type_ID_FK int(11) NOT NULL,
    User_ID_FK int(11) DEFAULT NULL,
    createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to parking table
  `INSERT INTO parking (Parking_id, Parking_number, Parking_status_ID_FK, Vehicle_type_ID_FK, Parking_type_ID_FK, User_ID_FK, createdAt, updatedAt) VALUES
    (1, 'A-01', 2, 1, 1, 2, '2025-07-12 02:31:57', '2025-07-12 02:31:57'),
    (2, 'A-02', 1, 2, 1, 2, '2025-07-12 02:31:57', '2025-07-12 02:31:57'),
    (3, 'V-01', 1, 1, 2, 1, '2025-07-12 02:31:57', '2025-07-12 02:31:57'),
    (4, 'A-03', 1, 3, 1, 4, '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (5, 'A-04', 2, 4, 1, 5, '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (6, 'B-01', 2, 5, 1, 7, '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (7, 'B-02', 1, 1, 1, 8, '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (8, 'V-02', 1, 2, 2, 9, '2025-07-12 02:31:58', '2025-07-12 02:31:58');`,

  // Add missing parking_status table after DB is created
  `CREATE TABLE parking_status (
    Parking_status_id int(11) NOT NULL,
    Parking_status_name varchar(30) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to parking_status table
  `INSERT INTO parking_status (Parking_status_id, Parking_status_name) VALUES
    (1, 'Available'),
    (2, 'Occupied'),
    (3, 'Reserved');`,

  // Add missing notification table after DB is created
  `CREATE TABLE parking_type (
    Parking_type_id int(11) NOT NULL,
    Parking_type_name varchar(30) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to parking_type table
  `INSERT INTO parking_type (Parking_type_id, Parking_type_name) VALUES
    (3, 'Disabled'),
    (1, 'Regular'),
    (2, 'Visitor');`,

  // Add missing payment table after DB is created
  `CREATE TABLE payment (
    payment_id int(11) NOT NULL,
    Owner_ID_FK int(11) NOT NULL,
    Payment_total_payment float NOT NULL,
    Payment_Status_ID_FK int(11) NOT NULL,
    Payment_date timestamp NOT NULL DEFAULT current_timestamp(),
    Payment_method varchar(30) NOT NULL,
    Payment_reference_number varchar(50) DEFAULT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to payment table
  `INSERT INTO payment (payment_id, Owner_ID_FK, Payment_total_payment, Payment_Status_ID_FK, Payment_date, Payment_method, Payment_reference_number) VALUES
    (1, 2, 350000, 2, '2024-01-15 05:00:00', 'CASH', 'PAY-2024-007'),
    (2, 3, 480000, 3, '2025-07-12 02:31:58', 'Mobile Payment', 'PAY-2024-008'),
    (3, 4, 520000, 4, '2025-07-12 02:31:58', 'Check', 'PAY-2024-009'),
    (4, 5, 450000, 1, '2025-07-12 02:31:58', 'Online Banking', 'PAY-2024-010'),
    (5, 6, 500000, 3, '2025-07-12 02:31:58', 'Credit Card', 'PAY-2024-011'),
    (6, 1, 1000, 1, '2025-09-07 19:58:58', 'PENDING', 'PAY-1757275138941-956');`,

  // Add missing payment_status table after DB is created
  `CREATE TABLE payment_status (
    Payment_status_id int(11) NOT NULL,
    Payment_status_name varchar(30) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to payment_status table
  `INSERT INTO payment_status (Payment_status_id, Payment_status_name) VALUES
    (3, 'Completed'),
    (4, 'Failed'),
    (1, 'Pending'),
    (2, 'Processing');`,

  // Add missing permissions table after DB is created
  `CREATE TABLE permissions (
    Permissions_id int(11) NOT NULL,
    Permissions_name varchar(30) NOT NULL,
    Permissions_description text NOT NULL,
    Permissions_createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    Permissions_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to permissions table
  `INSERT INTO permissions (Permissions_id, Permissions_name, Permissions_description, Permissions_createdAt, Permissions_updatedAt) VALUES
    (1, 'create', 'Create records', '2025-07-12 02:31:57', '2025-09-07 03:36:24'),
    (2, 'read', 'Read records', '2025-07-12 02:31:57', '2025-07-12 02:31:57'),
    (3, 'update', 'Update records', '2025-07-12 02:31:57', '2025-09-07 03:36:24'),
    (4, 'delete', 'Delete records', '2025-07-12 02:31:57', '2025-07-12 02:31:57');`,

  // Add missing permissions_module_role table after DB is created
  `CREATE TABLE permissions_module_role (
    Permissions_module_role_id int(11) NOT NULL,
    Module_role_FK_ID int(11) NOT NULL,
    Permissions_FK_ID int(11) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to permissions_module_role table
  `INSERT INTO permissions_module_role (Permissions_module_role_id, Module_role_FK_ID, Permissions_FK_ID) VALUES
    (1, 1, 1), (2, 1, 4), (3, 1, 2), (4, 1, 3), (8, 1, 1), (9, 2, 1), (10, 3, 1), (11, 4, 1), (12, 5, 1), (13, 6, 1),
    (14, 7, 1), (15, 8, 1), (16, 9, 1), (17, 10, 1), (18, 11, 1), (19, 12, 1), (20, 13, 1), (21, 14, 1), (22, 15, 1), 
    (23, 16, 1), (24, 17, 1), (25, 18, 1), (26, 19, 1), (27, 20, 1), (28, 21, 1), (29, 22, 1), (30, 23, 1),
    (31, 24, 1), (32, 25, 1), (33, 26, 1), (34, 27, 1), (35, 28, 1), (36, 1, 4), (37, 2, 4), (38, 3, 4), (39, 4, 4),
    (40, 5, 4), (41, 6, 4), (42, 7, 4), (43, 8, 4), (44, 9, 4), (45, 10, 4), (46, 11, 4), (47, 12, 4), (48, 13, 4),
    (49, 14, 4), (50, 15, 4), (51, 16, 4), (52, 17, 4), (53, 18, 4), (54, 19, 4), (55, 20, 4), (56, 21, 4),
    (57, 22, 4), (58, 23, 4), (59, 24, 4), (60, 25, 4), (61, 26, 4), (62, 27, 4), (63, 28, 4), (64, 1, 2), (65, 2, 2),
    (66, 3, 2), (67, 4, 2), (68, 5, 2), (69, 6, 2), (70, 7, 2), (71, 8, 2), (72, 9, 2), (73, 10, 2), (74, 11, 2),
    (75, 12, 2), (76, 13, 2), (77, 14, 2), (78, 15, 2), (79, 16, 2), (80, 17, 2), (81, 18, 2), (82, 19, 2), (83, 20, 2),
    (84, 21, 2), (85, 22, 2), (86, 23, 2), (87, 24, 2), (88, 25, 2), (89, 26, 2), (90, 27, 2), (91, 28, 2), (92, 1, 3),
    (93, 2, 3), (94, 3, 3), (95, 4, 3), (96, 5, 3), (97, 6, 3), (98, 7, 3), (99, 8, 3), (100, 9, 3), (101, 10, 3),
    (102, 11, 3), (103, 12, 3), (104, 13, 3), (105, 14, 3), (106, 15, 3), (107, 16, 3), (108, 17, 3), (109, 18, 3),
    (110, 19, 3), (111, 20, 3), (112, 21, 3), (113, 22, 3), (114, 23, 3), (115, 24, 3), (116, 25, 3), (117, 26, 3),
    (118, 27, 3), (119, 28, 3), (135, 1, 1), (136, 16, 1), (137, 1, 4), (138, 16, 4), (139, 1, 2), (140, 16, 2),
    (141, 1, 3), (142, 16, 3), (150, 1, 1), (151, 16, 1), (152, 33, 1), (153, 1, 4), (154, 16, 4), (155, 33, 4),
    (156, 1, 2), (157, 16, 2), (158, 33, 2), (159, 34, 2), (160, 35, 2), (161, 1, 3), (162, 16, 3), (163, 33, 3),
    (164, 34, 3), (165, 35, 3), (181, 34, 2), (182, 34, 3), (183, 36, 1), (184, 36, 2), (185, 37, 2), (186, 38, 2),
    (187, 40, 1), (188, 40, 4), (189, 40, 2), (190, 40, 3), (191, 41, 2), (192, 42, 2), (193, 43, 2), (194, 43, 3),
    (195, 44, 1), (196, 44, 2), (197, 45, 1), (198, 45, 2), (199, 46, 2), (200, 47, 1), (201, 47, 4), (202, 47, 2),
    (203, 47, 3), (204, 48, 1), (205, 48, 2), (206, 48, 3), (207, 49, 2), (208, 50, 2), (209, 50, 3), (210, 51, 2),
    (211, 52, 2), (212, 53, 2), (213, 54, 1), (214, 54, 4), (215, 54, 2), (216, 54, 3), (217, 55, 2), (218, 56, 2),
    (219, 57, 1), (220, 57, 2), (221, 58, 2), (222, 59, 2), (223, 60, 2), (244, 35, 2), (245, 67, 2), (246, 68, 2),
    (247, 69, 2), (248, 70, 1), (249, 70, 4), (250, 70, 2), (251, 70, 3), (252, 71, 2), (253, 72, 2), (254, 73, 2),
    (255, 73, 3), (256, 74, 2), (257, 75, 2), (258, 76, 2), (259, 77, 2), (260, 78, 2), (261, 79, 2), (262, 80, 2),
    (263, 81, 1), (264, 81, 2), (265, 81, 3), (266, 73, 1), (267, 74, 1), (268, 74, 3), (269, 74, 4), (270, 82, 4),
    (271, 82, 1), (272, 82, 2), (273, 82, 3);`,

  // Add missing pet table after DB is created
  `CREATE TABLE pet (
    Pet_id int(11) NOT NULL,
    Pet_name varchar(50) NOT NULL,
    Pet_species varchar(30) NOT NULL,
    Pet_Breed varchar(50) DEFAULT NULL,
    Pet_vaccination_card varchar(255) DEFAULT NULL,
    Pet_Photo varchar(255) DEFAULT NULL,
    Owner_FK_ID int(11) NOT NULL,
    createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to pet table
  `INSERT INTO pet (Pet_id, Pet_name, Pet_species, Pet_Breed, Pet_vaccination_card, Pet_Photo, Owner_FK_ID, createdAt, updatedAt) VALUES
    (1, 'Max', 'Dog', 'Golden Retriever', 'carnet_de_vacunacion.pdf', 'dog.jpg', 1, '2025-07-12 02:31:57', '2025-07-12 02:31:57'),
    (2, 'Luna', 'Cat', 'Persian', 'carnet_de_vacunacion.pdf', 'cat.jpg', 1, '2025-07-12 02:31:57', '2025-07-12 02:31:57'),
    (3, 'Rocky', 'Dog', 'German Shepherd', 'carnet_de_vacunacion.pdf', 'dog.jpg', 2, '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (4, 'Milo', 'Dog', 'Labrador', 'carnet_de_vacunacion.pdf', 'dog.jpg', 3, '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (5, 'Bella', 'Cat', 'Siamese', 'carnet_de_vacunacion.pdf', 'cat.jpg', 4, '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (6, 'Charlie', 'Dog', 'Poodle', 'carnet_de_vacunacion.pdf', 'cat.jpg', 5, '2025-07-12 02:31:58', '2025-07-12 02:31:58');`,

  // Add missing pqrs table after DB is created
  `CREATE TABLE pqrs (
    PQRS_id int(11) NOT NULL,
    Owner_FK_ID int(11) NOT NULL,
    PQRS_category_FK_ID int(11) NOT NULL,
    PQRS_subject varchar(255) NOT NULL,
    PQRS_description text NOT NULL,
    PQRS_priority enum('LOW','MEDIUM','HIGH') DEFAULT 'MEDIUM',
    PQRS_file varchar(255) DEFAULT NULL,
    PQRS_answer text DEFAULT NULL,
    PQRS_createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    PQRS_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to pqrs table
  `INSERT INTO pqrs (PQRS_id, Owner_FK_ID, PQRS_category_FK_ID, PQRS_subject, PQRS_description, PQRS_priority, PQRS_file, PQRS_answer) VALUES
    (1, 1, 1, 'Problema con facturación', 'El valor de la factura no corresponde al servicio contratado.', 'HIGH', NULL, NULL),
    (2, 2, 2, 'Sugerencia de mejora', 'Propongo que la aplicación tenga un modo oscuro.', 'LOW', NULL, NULL),
    (3, 3, 1, 'Duda sobre contrato', 'Tengo inquietudes respecto a la cláusula de permanencia.', 'MEDIUM', 'contrato.pdf', NULL),
    (4, 4, 3, 'Reporte de error en la web', 'Al intentar iniciar sesión aparece un error 500.', 'HIGH', 'screenshot_error.png', NULL),
    (5, 5, 2, 'Solicitud de información', 'Quisiera conocer más sobre los planes disponibles.', 'MEDIUM', NULL, 'Su solicitud ha sido enviada al área correspondiente.');`,

  // Add missing pqrs_category table after DB is created
  `CREATE TABLE pqrs_category (
    PQRS_category_id int(11) NOT NULL,
    PQRS_category_name varchar(30) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to pqrs_category table
  `INSERT INTO pqrs_category (PQRS_category_id, PQRS_category_name) VALUES
    (9, 'Administrative'),
    (5, 'Documentation'),
    (8, 'Facilities'),
    (4, 'General Inquiry'),
    (1, 'Maintenance'),
    (3, 'Noise Complaint'),
    (7, 'Parking'),
    (6, 'Plumbing'),
    (2, 'Security');`,

  // Add missing pqrs_tracking table after DB is created
  `CREATE TABLE pqrs_tracking (
    PQRS_tracking_id int(11) NOT NULL,
    PQRS_tracking_PQRS_FK_ID int(11) NOT NULL,
    PQRS_tracking_user_FK_ID int(11) NOT NULL,
    PQRS_tracking_status_FK_ID int(11) NOT NULL,
    PQRS_tracking_date_update timestamp NOT NULL DEFAULT current_timestamp(),
    PQRS_tracking_createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    PQRS_tracking_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;;`,

  // Add missing pqrs_tracking_status table after DB is created
  `CREATE TABLE pqrs_tracking_status (
    PQRS_tracking_status_id int(11) NOT NULL,
    PQRS_tracking_status_name varchar(30) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to pqrs_tracking_status table
  `INSERT INTO pqrs_tracking_status (PQRS_tracking_status_id, PQRS_tracking_status_name) VALUES
    (4, 'Closed'),
    (2, 'In Progress'),
    (1, 'Open'),
    (3, 'Resolved');`,

  // Add missing profile table after DB is created
  `CREATE TABLE profile (
    Profile_id int(11) NOT NULL,
    Profile_fullName varchar(100) NOT NULL,
    User_FK_ID int(11) NOT NULL,
    Profile_document_type varchar(20) NOT NULL,
    Profile_document_number varchar(30) NOT NULL,
    Profile_telephone_number varchar(12) NOT NULL,
    Profile_photo varchar(255) DEFAULT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to profile table
  `INSERT INTO profile (Profile_id, Profile_fullName, User_FK_ID, Profile_document_type, Profile_document_number, Profile_telephone_number, Profile_photo) VALUES
    (1, 'System Administrator', 1, 'CC', '1000000000', '3000000000', NULL),
    (2, 'Test Owner', 2, 'CC', '2000000000', '3000000001', NULL),
    (3, 'Test Security', 3, 'CC', '3000000000', '3000000002', NULL),
    (4, 'Admin User', 1, 'CC', '1234567890', '3001234567', NULL),
    (5, 'John Owner', 2, 'CC', '0987654321', '3009876543', NULL),
    (6, 'Security Guard', 3, 'CC', '5678901234', '3005678901', NULL),
    (7, 'John Guard', 4, 'CC', '1001001001', '3001001001', NULL),
    (8, 'Jane Guarddd', 5, 'CC', '1001001002', '3001001002', NULL),
    (10, 'Jane Smith', 4, 'CC', '2233445566', '3002233445', NULL),
    (11, 'Jane Guarddd', 5, 'CC', '1001001002', '3001001002', NULL),
    (13, 'David Lee', 7, 'PP', '5566778899', '3005566778', NULL),
    (14, 'Emma Wilson', 8, 'CC', '6677889900', '3006677889', NULL),
    (15, 'James Taylor', 9, 'CC', '7788990011', '3007788990', NULL),
    (16, 'Sebastian SOtelo', 16, 'CC', '1023365596', '123123', NULL);`,

  // Add missing question table after DB is created
  `CREATE TABLE question (
    question_id int(11) NOT NULL,
    survey_id int(11) NOT NULL,
    title varchar(255) NOT NULL,
    question_type_id int(11) NOT NULL,
    options longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(options)),
    createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to question table
  `INSERT INTO question (question_id, survey_id, title, question_type_id, options, createdAt, updatedAt) VALUES
    (1, 1, 'How satisfied are you with the building maintenance?', 4, '[\"1\", \"2\", \"3\", \"4\", \"5\"]', '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (2, 1, 'Which facilities do you use most often?', 3, '[\"Gym\", \"Pool\", \"BBQ Area\", \"Party Room\"]', '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (3, 2, 'When do you usually use the gym?', 2, '[\"Morning\", \"Afternoon\", \"Evening\", \"Night\"]', '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (4, 1, 'Rate the overall security service', 4, '[\"1\", \"2\", \"3\", \"4\", \"5\"]', '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (5, 1, 'Which security measures need improvement?', 3, '[\"Cameras\", \"Guards\", \"Access Control\", \"Parking Security\"]', '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (6, 2, 'What type of community events interest you?', 3, '[\"Sports\", \"Cultural\", \"Educational\", \"Social\"]', '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (7, 3, 'How quickly are maintenance issues resolved?', 4, '[\"1\", \"2\", \"3\", \"4\", \"5\"]', '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (8, 3, 'Preferred maintenance schedule', 2, '[\"Morning\", \"Afternoon\", \"Evening\", \"Weekend\"]', '2025-07-12 02:31:58', '2025-07-12 02:31:58');`,

  // Add missing question_type table after DB is created
  `CREATE TABLE question_type (
    question_type_id int(11) NOT NULL,
    Question_type_name varchar(50) NOT NULL,
    Question_type_description text DEFAULT NULL,
    createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to question_type table
  `INSERT INTO question_type (question_type_id, Question_type_name, Question_type_description, createdAt, updatedAt) VALUES
    (1, 'text', 'Free text response question', '2025-07-12 02:31:57', '2025-07-12 02:31:57'),
    (2, 'multiple_choice', 'Multiple choice question with single answer', '2025-07-12 02:31:57', '2025-07-12 02:31:57'),
    (3, 'checkbox', 'Multiple choice question with multiple answers allowed', '2025-07-12 02:31:57', '2025-07-12 02:31:57'),
    (4, 'rating', 'Rating scale question', '2025-07-12 02:31:57', '2025-07-12 02:31:57'),
    (5, 'date', 'Date input question', '2025-07-12 02:31:57', '2025-07-12 02:31:57');`,

  // Add missing reservation table after DB is created
  `CREATE TABLE reservation (
    Reservation_id int(11) NOT NULL,
    Reservation_type_FK_ID int(11) NOT NULL,
    Reservation_status_FK_ID int(11) NOT NULL,
    Reservation_start_time datetime NOT NULL,
    Reservation_end_time datetime NOT NULL,
    Facility_FK_ID int(11) NOT NULL,
    Reservation_description text DEFAULT NULL,
    Owner_FK_ID int(11) NOT NULL,
    createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to question_type table
  `INSERT INTO reservation (Reservation_id, Reservation_type_FK_ID, Reservation_status_FK_ID, Reservation_start_time, Reservation_end_time, Facility_FK_ID, Reservation_description, Owner_FK_ID, createdAt, updatedAt) VALUES
    (3, 1, 1, '2025-10-04 15:00:00', '2025-10-05 17:00:00', 1, 'lala', 1, '2025-09-17 04:23:30', '2025-09-17 04:23:30'),
    (4, 1, 1, '2025-11-04 21:00:00', '2025-11-05 21:00:00', 1, 'lala', 1, '2025-09-17 04:44:53', '2025-09-17 04:44:53');`,

  // Add missing reservation_status table after DB is created
  `CREATE TABLE reservation_status (
    Reservation_status_id int(11) NOT NULL,
    Reservation_status_name varchar(30) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to reservation_status table
  `INSERT INTO reservation_status (Reservation_status_id, Reservation_status_name) VALUES
    (4, 'Cancelled'),
    (3, 'Completed'),
    (2, 'Confirmed'),
    (5, 'No Show'),
    (1, 'Pending');`,

  // Add missing reservation_type table after DB is created
  `CREATE TABLE reservation_type (
    Reservation_type_id int(11) NOT NULL,
    Reservation_type_name varchar(30) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to reservation_type table
  `INSERT INTO reservation_type (Reservation_type_id, Reservation_type_name) VALUES
    (4, 'Community Room'),
    (3, 'Gym'),
    (2, 'Parking'),
    (1, 'Room'),
    (5, 'Sports Facility');`,

  // Add missing role table after DB is created
  `CREATE TABLE role (
    Role_id int(11) NOT NULL,
    Role_name varchar(30) NOT NULL,
    Role_description text DEFAULT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to role table
  `INSERT INTO role (Role_id, Role_name, Role_description) VALUES
    (1, 'Admin', 'System administrator'),
    (2, 'Owner', 'Property owner'),
    (3, 'Security', 'Security staff');`,

  // Add missing survey table after DB is created
  `CREATE TABLE survey (
    survey_id int(11) NOT NULL,
    title varchar(100) NOT NULL,
    status varchar(20) DEFAULT NULL,
    createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to survey table
  `INSERT INTO survey (survey_id, title, status, createdAt, updatedAt) VALUES
    (1, 'Resident Satisfaction Survey', 'active', '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (2, 'Facility Usage Survey', 'draft', '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (3, 'Security Services Feedback', 'active', '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (4, 'Community Events Planning', 'draft', '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (5, 'Maintenance Quality Survey', 'active', '2025-07-12 02:31:58', '2025-07-12 02:31:58');`,

  // Add missing tower table after DB is created
  `CREATE TABLE tower (
    Tower_id int(11) NOT NULL,
    Tower_name varchar(30) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to tower table
  `INSERT INTO tower (Tower_id, Tower_name) VALUES
    (3, 'North'),
    (6, 'South'),
    (1, 'Tower A'),
    (2, 'Tower B'),
    (4, 'Tower C'),
    (5, 'Tower D');`,

  // Add missing users table after DB is created
  `CREATE TABLE users (
    Users_id int(11) NOT NULL,
    Users_name varchar(30) NOT NULL,
    Users_email varchar(150) DEFAULT NULL,
    Users_password varchar(255) NOT NULL,
    Password_reset_token varchar(64) DEFAULT NULL,
    Password_reset_expires datetime DEFAULT NULL,
    User_status_FK_ID int(11) NOT NULL,
    Role_FK_ID int(11) NOT NULL,
    Users_createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    Users_updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to users table
  `INSERT INTO users (Users_id, Users_name, Users_email, Users_password, Password_reset_token, Password_reset_expires, User_status_FK_ID, Role_FK_ID, Users_createdAt, Users_updatedAt) VALUES
    (1, 'admin', 'admin@gmail.com', '$2b$10$6fHi5aqS8AiKT4NFReUW0eieNQ5/fW9m11Dk9Lip0fLFwu6wqKs.m', NULL, NULL, 1, 1, '2025-07-12 02:31:57', '2025-09-07 21:30:20'),
    (2, 'testowner', 'testowner@gmail.com', '$2b$10$I/vMa.JOdOOqKcgTemrohe8Rnm2j12Kl3wEHXnlekCNMe2hvo1ecW', NULL, NULL, 1, 2, '2025-07-12 02:31:57', '2025-09-07 21:31:38'),
    (3, 'testsecurity', 'testsecurity', '$2b$10$NFXjWnXqLMhhtJ5F68/Uu.N7En/Ig4BhMchbCCtycNIhkbIfQgxlK', NULL, NULL, 1, 3, '2025-07-12 02:31:57', '2025-09-07 21:26:31'),
    (4, 'guard1', 'guard1', '$2b$10$YxzSYtecnboPHMgq1/5Q6eYI4vwUBGAKecEqKU64FU8vKMz1deXlK', NULL, NULL, 1, 3, '2025-07-12 02:31:57', '2025-09-07 21:26:31'),
    (5, 'guard2', 'guard2', '$2b$10$y7zRHpAe1luG2KDvoPDgued8OFfF2pxFs2YNGVhBZoAlw0NobE1Ge', NULL, NULL, 1, 3, '2025-07-12 02:31:57', '2025-09-07 21:26:31'),
    (7, 'owner2', 'owner2', '$2b$10$K.Dy0xVDsHf54bmw270NF.tcI2D.46PQKuH/3OO7j5MEDFk52dWn2', NULL, NULL, 1, 2, '2025-07-12 02:31:58', '2025-09-07 21:26:31'),
    (8, 'owner3', 'owner3', '$2b$10$NkMu.4l9WP3Rq2h0aOHW/.POCkmiB3XCD6wkxnJ/WQZU6LquiNIei', NULL, NULL, 2, 2, '2025-07-12 02:31:58', '2025-09-17 23:25:48'),
    (9, 'security2', 'security2', '$2b$10$NUQxhjGzZSaGPuiOuhuxneEEOtA8/yx.314Ekf2mz.QLJQ.CjqwgS', NULL, NULL, 1, 3, '2025-07-12 02:31:58', '2025-09-07 21:26:31'),
    (10, 'inactive_user', 'inactive_user', '$2b$10$sV5u6.g6LsJpWbFY4nBdROw3coG9HPFRIpxMXf3/sC0DxJfGwU6Uu', NULL, NULL, 2, 2, '2025-07-12 02:31:58', '2025-09-07 21:26:31'),
    (11, 'pending_user', 'pending_user', '$2b$10$X6BWsUq3vzKVHfRNveOT5u0oKgGqxcbdJ.n5Mki.bSTgZqtJsPEwK', NULL, NULL, 3, 2, '2025-07-12 02:31:58', '2025-09-07 21:26:31'),
    (12, 'blocked_user', 'blocked_user', '$2b$10$wNJEnvRRe.1omiFUfu6gWeEKkmSnRn8TAXFqrzlPYhmyWxpyXSzdu', NULL, NULL, 4, 2, '2025-07-12 02:31:58', '2025-09-07 21:26:31'),
    (13, 'demo_admin', 'demo_admin@example.com', '$2b$10$mjnTVaPfu0iw9ctMwR.1fOwgAgPESIgUHDYGFTiHY27.I4K5jvu/u', NULL, NULL, 1, 1, '2025-09-07 21:27:05', '2025-09-07 21:27:05'),
    (14, 'demo_owner', 'demo_owner@example.com', '$2b$10$7xoFBkT2m33XRgD9Mlvpw.ejXZpvweLngaThilS.RfbhFlMSSA41a', NULL, NULL, 1, 2, '2025-09-07 21:27:05', '2025-09-07 21:27:05'),
    (15, 'demo_security', 'demo_security@example.com', '$2b$10$oOuLuFVtKS8e.hUPXxLaqO6pDKT094S7KhduMZXZCdUa8nkEA265e', NULL, NULL, 1, 3, '2025-09-07 21:27:05', '2025-09-07 21:27:05'),
    (16, 'aaaa', NULL, '$2b$10$Sb3AcuYyhUF0qyP5UJjCjOxJf1Hi1PSX/M85TrzK58gecaBxBsGM2', NULL, NULL, 1, 3, '2025-09-18 00:06:40', '2025-09-18 00:06:40');`,

  // Add missing user_status table after DB is created
  `CREATE TABLE user_status (
    User_status_id int(11) NOT NULL,
    User_status_name varchar(30) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to user_status table
  `INSERT INTO user_status (User_status_id, User_status_name) VALUES
    (1, 'Active'),
    (4, 'Blocked'),
    (2, 'Inactive'),
    (3, 'Pending');`,

  // Add missing vehicle_type table after DB is created
  `CREATE TABLE vehicle_type (
    Vehicle_type_id int(11) NOT NULL,
    Vehicle_type_name varchar(50) NOT NULL,
    vehicle_plate varchar(20) DEFAULT NULL,
    vehicle_model varchar(20) DEFAULT NULL,
    vehicle_brand varchar(50) DEFAULT NULL,
    vehicle_color varchar(30) DEFAULT NULL,
    vehicle_engineCC varchar(20) DEFAULT NULL,
    createdAt timestamp NOT NULL DEFAULT current_timestamp(),
    updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to vehicle_type table
  `INSERT INTO vehicle_type (Vehicle_type_id, Vehicle_type_name, vehicle_plate, vehicle_model, vehicle_brand, vehicle_color, vehicle_engineCC, createdAt, updatedAt) VALUES
    (1, 'Car', 'ABC123', '2022', 'Toyota', 'Red', NULL, '2025-07-12 02:31:57', '2025-07-12 02:31:57'),
    (2, 'Motorcycle', 'XYZ789', '2021', 'Honda', 'Black', NULL, '2025-07-12 02:31:57', '2025-07-12 02:31:57'),
    (3, 'Bicycle', NULL, NULL, 'Trek', 'Blue', NULL, '2025-07-12 02:31:57', '2025-07-12 02:31:57'),
    (4, 'SUV', 'DEF456', '2023', 'Honda', 'Silver', '2000cc', '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (5, 'Scooter', 'GHI789', '2022', 'Yamaha', 'Blue', '125cc', '2025-07-12 02:31:58', '2025-07-12 02:31:58'),
    (6, 'Van', 'JKL012', '2021', 'Ford', 'White', '2500cc', '2025-07-12 02:31:58', '2025-07-12 02:31:58');`,

  // Add missing visitor table after DB is created
  `CREATE TABLE visitor (
    ID int(11) NOT NULL,
    name varchar(255) NOT NULL,
    documentNumber varchar(15) NOT NULL,
    host int(11) NOT NULL,
    enter_date datetime NOT NULL,
    exit_date datetime DEFAULT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;`,

  // Insert to visitor table
  `INSERT INTO visitor (ID, name, documentNumber, host, enter_date, exit_date) VALUES
    (1, 'Sarah Johnson', '1122334455', 1, '2024-03-15 10:00:00', '2024-03-15 16:00:00'),
    (2, 'Mike Wilson', '5544332211', 1, '2024-03-16 14:00:00', NULL),
    (3, 'Artbaddon', '123123123', 1, '2025-07-11 21:51:40', NULL);`,


  // ALTERS TABLES FOR THE DATABASE

  // ALTER TABLE answer
  `ALTER TABLE answer
    ADD PRIMARY KEY (answer_id),
    ADD KEY survey_id (survey_id),
    ADD KEY question_id (question_id);`,

  // ALTER TABLE apartment
  `ALTER TABLE apartment
    ADD PRIMARY KEY (Apartment_id),
    ADD KEY Apartment_status_FK_ID (Apartment_status_FK_ID),
    ADD KEY Tower_FK_ID (Tower_FK_ID),
    ADD KEY Owner_FK_ID (Owner_FK_ID);`,

  // ALTER TABLE apartment_status
  `ALTER TABLE apartment_status
    ADD PRIMARY KEY (Apartment_status_id),
    ADD UNIQUE KEY Apartment_status_name (Apartment_status_name);`,

  // ALTER TABLE facility
  `ALTER TABLE facility
    ADD PRIMARY KEY (Facility_id),
    ADD UNIQUE KEY Facility_name (Facility_name);`,

  // ALTER TABLE guard
  `ALTER TABLE guard
    ADD PRIMARY KEY (Guard_id),
    ADD KEY User_FK_ID (User_FK_ID);`,

  // ALTER TABLE module
  `ALTER TABLE module
    ADD PRIMARY KEY (module_id),
    ADD UNIQUE KEY module_name (module_name),
    ADD UNIQUE KEY uq_module_name (module_name);`,

  // ALTER TABLE module_role
  `ALTER TABLE module_role
    ADD PRIMARY KEY (Module_role_id),
    ADD KEY Role_FK_ID (Role_FK_ID),
    ADD KEY Module_FK_ID (Module_FK_ID);`,

  // ALTER TABLE notification
  `ALTER TABLE notification
    ADD PRIMARY KEY (Notification_id),
    ADD KEY Notification_type_FK_ID (Notification_type_FK_ID),
    ADD KEY Notification_User_FK_ID (Notification_User_FK_ID);`,

  // ALTER TABLE notification_type
  `ALTER TABLE notification_type
    ADD PRIMARY KEY (Notification_type_id),
    ADD UNIQUE KEY Notification_type_name (Notification_type_name);`,

  // ALTER TABLE owner
  `ALTER TABLE owner
    ADD PRIMARY KEY (Owner_id),
    ADD KEY User_FK_ID (User_FK_ID);`,

  // ALTER TABLE parking
  `ALTER TABLE parking
    ADD PRIMARY KEY (Parking_id),
    ADD UNIQUE KEY Parking_number (Parking_number),
    ADD KEY Parking_status_ID_FK (Parking_status_ID_FK),
    ADD KEY Vehicle_type_ID_FK (Vehicle_type_ID_FK),
    ADD KEY Parking_type_ID_FK (Parking_type_ID_FK),
    ADD KEY User_ID_FK (User_ID_FK);`,

  // ALTER TABLE parking_status
  `ALTER TABLE parking_status
    ADD PRIMARY KEY (Parking_status_id),
    ADD UNIQUE KEY Parking_status_name (Parking_status_name);`,

  // ALTER TABLE parking_type
  `ALTER TABLE parking_type
    ADD PRIMARY KEY (Parking_type_id),
    ADD UNIQUE KEY Parking_type_name (Parking_type_name);`,

  // ALTER TABLE payment
  `ALTER TABLE payment
    ADD PRIMARY KEY (payment_id),
    ADD KEY Owner_ID_FK (Owner_ID_FK),
    ADD KEY Payment_Status_ID_FK (Payment_Status_ID_FK);`,

  // ALTER TABLE payment_status
  `ALTER TABLE payment_status
    ADD PRIMARY KEY (Payment_status_id),
    ADD UNIQUE KEY Payment_status_name (Payment_status_name);`,

  // ALTER TABLE permissions
  `ALTER TABLE permissions
    ADD PRIMARY KEY (Permissions_id),
    ADD UNIQUE KEY Permissions_name (Permissions_name),
    ADD UNIQUE KEY uq_permissions_name (Permissions_name);`,

  // ALTER TABLE permissions_module_role
  `ALTER TABLE permissions_module_role
    ADD PRIMARY KEY (Permissions_module_role_id),
    ADD KEY Module_role_FK_ID (Module_role_FK_ID),
    ADD KEY Permissions_FK_ID (Permissions_FK_ID);`,

  // ALTER TABLE pet
  `ALTER TABLE pet
    ADD PRIMARY KEY (Pet_id),
    ADD KEY Owner_FK_ID (Owner_FK_ID);`,

  // ALTER TABLE pqrs
  `ALTER TABLE pqrs
    ADD PRIMARY KEY (PQRS_id),
    ADD KEY Owner_FK_ID (Owner_FK_ID),
    ADD KEY PQRS_category_FK_ID (PQRS_category_FK_ID);`,

  // ALTER TABLE pqrs_category
  `ALTER TABLE pqrs_category
    ADD PRIMARY KEY (PQRS_category_id),
    ADD UNIQUE KEY PQRS_category_name (PQRS_category_name);`,

  // ALTER TABLE pqrs_tracking
  `ALTER TABLE pqrs_tracking
    ADD PRIMARY KEY (PQRS_tracking_id),
    ADD KEY PQRS_tracking_status_FK_ID (PQRS_tracking_status_FK_ID),
    ADD KEY PQRS_tracking_PQRS_FK_ID (PQRS_tracking_PQRS_FK_ID),
    ADD KEY PQRS_tracking_user_FK_ID (PQRS_tracking_user_FK_ID);`,

  // ALTER TABLE pqrs_tracking_status
  `ALTER TABLE pqrs_tracking_status
    ADD PRIMARY KEY (PQRS_tracking_status_id),
    ADD UNIQUE KEY PQRS_tracking_status_name (PQRS_tracking_status_name);`,

  // ALTER TABLE profile
  `ALTER TABLE profile
    ADD PRIMARY KEY (Profile_id),
    ADD KEY User_FK_ID (User_FK_ID);`,

  // ALTER TABLE question
  `ALTER TABLE question
    ADD PRIMARY KEY (question_id),
    ADD KEY survey_id (survey_id),
    ADD KEY question_type_id (question_type_id);`,

  // ALTER TABLE question_type
  `ALTER TABLE question_type
    ADD PRIMARY KEY (question_type_id),
    ADD UNIQUE KEY Question_type_name (Question_type_name);`,

  // ALTER TABLE reservation
  `ALTER TABLE reservation
    ADD PRIMARY KEY (Reservation_id),
    ADD KEY Reservation_type_FK_ID (Reservation_type_FK_ID),
    ADD KEY Reservation_status_FK_ID (Reservation_status_FK_ID),
    ADD KEY Owner_FK_ID (Owner_FK_ID),
    ADD KEY Facility_FK_ID (Facility_FK_ID);`,

  // ALTER TABLE reservation_status
  `ALTER TABLE reservation_status
    ADD PRIMARY KEY (Reservation_status_id),
    ADD UNIQUE KEY Reservation_status_name (Reservation_status_name);`,

  // ALTER TABLE reservation_type
  `ALTER TABLE reservation_type
    ADD PRIMARY KEY (Reservation_type_id),
    ADD UNIQUE KEY Reservation_type_name (Reservation_type_name);`,

  // ALTER TABLE role
  `ALTER TABLE role
    ADD PRIMARY KEY (Role_id),
    ADD UNIQUE KEY Role_name (Role_name),
    ADD UNIQUE KEY uq_role_name (Role_name);`,

  // ALTER TABLE survey
  `ALTER TABLE survey
    ADD PRIMARY KEY (survey_id);`,

  // ALTER TABLE tower
  `ALTER TABLE tower
    ADD PRIMARY KEY (Tower_id),
    ADD UNIQUE KEY Tower_name (Tower_name);`,

  // ALTER TABLE users
  `ALTER TABLE users
    ADD PRIMARY KEY (Users_id),
    ADD UNIQUE KEY Users_name (Users_name),
    ADD UNIQUE KEY uq_users_email (Users_email),
    ADD KEY User_status_FK_ID (User_status_FK_ID),
    ADD KEY Role_FK_ID (Role_FK_ID);`,

  // ALTER TABLE user_status
  `ALTER TABLE user_status
    ADD PRIMARY KEY (User_status_id),
    ADD UNIQUE KEY User_status_name (User_status_name);`,

  // ALTER TABLE vehicle_type
  `ALTER TABLE vehicle_type
    ADD PRIMARY KEY (Vehicle_type_id),
    ADD UNIQUE KEY Vehicle_type_name (Vehicle_type_name);`,

  // ALTER TABLE visitor
  `ALTER TABLE visitor
    ADD PRIMARY KEY (ID),
    ADD KEY host (host);`,

  // AUTO_INCREMENT for table answer

  `ALTER TABLE answer
    MODIFY answer_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;`,

  `ALTER TABLE apartment
    MODIFY Apartment_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;`,

  `ALTER TABLE apartment_status
    MODIFY Apartment_status_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;`,

  `ALTER TABLE facility
    MODIFY Facility_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;`,

  `ALTER TABLE guard
    MODIFY Guard_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;`,

  `ALTER TABLE module
    MODIFY module_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;`,

  `ALTER TABLE module_role
    MODIFY Module_role_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=83;`,

  `ALTER TABLE notification
    MODIFY Notification_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;`,

  `ALTER TABLE notification_type
    MODIFY Notification_type_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;`,

  `ALTER TABLE owner
    MODIFY Owner_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;`,

  `ALTER TABLE parking
    MODIFY Parking_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;`,

  `ALTER TABLE parking_status
    MODIFY Parking_status_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;`,

  `ALTER TABLE parking_type
    MODIFY Parking_type_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;`,

  `ALTER TABLE payment
    MODIFY payment_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;`,

  `ALTER TABLE payment_status
    MODIFY Payment_status_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;`,

  `ALTER TABLE permissions
    MODIFY Permissions_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;`,

  `ALTER TABLE permissions_module_role
    MODIFY Permissions_module_role_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=274;`,

  `ALTER TABLE pet
    MODIFY Pet_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;`,

  `ALTER TABLE pqrs
    MODIFY PQRS_id int(11) NOT NULL AUTO_INCREMENT;`,

  `ALTER TABLE pqrs_category
    MODIFY PQRS_category_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;`,

  `ALTER TABLE pqrs_tracking
    MODIFY PQRS_tracking_id int(11) NOT NULL AUTO_INCREMENT;`,

  `ALTER TABLE pqrs_tracking_status
    MODIFY PQRS_tracking_status_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;`,

  `ALTER TABLE profile
    MODIFY Profile_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;`,

  `ALTER TABLE question
    MODIFY question_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;`,

  `ALTER TABLE question_type
    MODIFY question_type_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;`,

  `ALTER TABLE reservation
    MODIFY Reservation_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;`,

  `ALTER TABLE reservation_status
    MODIFY Reservation_status_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;`,

  `ALTER TABLE reservation_type
    MODIFY Reservation_type_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;`,

  `ALTER TABLE role
    MODIFY Role_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;`,

  `ALTER TABLE survey
    MODIFY survey_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;`,

  `ALTER TABLE tower
    MODIFY Tower_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;`,

  `ALTER TABLE users
    MODIFY Users_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;`,

  `ALTER TABLE user_status
    MODIFY User_status_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;`,

  `ALTER TABLE vehicle_type
    MODIFY Vehicle_type_id int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;`,

  `ALTER TABLE visitor
    MODIFY ID int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;`,

  `ALTER TABLE answer
    ADD CONSTRAINT answer_ibfk_1 FOREIGN KEY (survey_id) REFERENCES survey (survey_id) ON DELETE CASCADE,
    ADD CONSTRAINT answer_ibfk_2 FOREIGN KEY (question_id) REFERENCES question (question_id) ON DELETE CASCADE;`,

  `ALTER TABLE apartment
    ADD CONSTRAINT fk_apartment_owner FOREIGN KEY (Owner_FK_ID) REFERENCES owner (Owner_id),
    ADD CONSTRAINT fk_apartment_status FOREIGN KEY (Apartment_status_FK_ID) REFERENCES apartment_status (Apartment_status_id),
    ADD CONSTRAINT fk_apartment_tower FOREIGN KEY (Tower_FK_ID) REFERENCES tower (Tower_id);`,

  `ALTER TABLE guard
    ADD CONSTRAINT fk_guard_user FOREIGN KEY (User_FK_ID) REFERENCES users (Users_id);`,

  `ALTER TABLE module_role
    ADD CONSTRAINT fk_module_role_module FOREIGN KEY (Module_FK_ID) REFERENCES module (module_id),
    ADD CONSTRAINT fk_module_role_role FOREIGN KEY (Role_FK_ID) REFERENCES role (Role_id);`,

  `ALTER TABLE notification
    ADD CONSTRAINT fk_notification_type FOREIGN KEY (Notification_type_FK_ID) REFERENCES notification_type (Notification_type_id),
    ADD CONSTRAINT fk_notification_user FOREIGN KEY (Notification_User_FK_ID) REFERENCES users (Users_id);`,

  `ALTER TABLE owner
    ADD CONSTRAINT fk_owner_user FOREIGN KEY (User_FK_ID) REFERENCES users (Users_id);`,

  `ALTER TABLE parking
    ADD CONSTRAINT fk_parking_parking_type FOREIGN KEY (Parking_type_ID_FK) REFERENCES parking_type (Parking_type_id),
    ADD CONSTRAINT fk_parking_status FOREIGN KEY (Parking_status_ID_FK) REFERENCES parking_status (Parking_status_id),
    ADD CONSTRAINT fk_parking_user FOREIGN KEY (User_ID_FK) REFERENCES users (Users_id),
    ADD CONSTRAINT fk_parking_vehicle_type FOREIGN KEY (Vehicle_type_ID_FK) REFERENCES vehicle_type (Vehicle_type_id);`,

  `ALTER TABLE payment
    ADD CONSTRAINT fk_payment_owner FOREIGN KEY (Owner_ID_FK) REFERENCES owner (Owner_id),
    ADD CONSTRAINT fk_payment_status FOREIGN KEY (Payment_Status_ID_FK) REFERENCES payment_status (Payment_status_id);`,

  `ALTER TABLE permissions_module_role
    ADD CONSTRAINT fk_permissions_module_role FOREIGN KEY (Module_role_FK_ID) REFERENCES module_role (Module_role_id),
    ADD CONSTRAINT fk_permissions_permissions FOREIGN KEY (Permissions_FK_ID) REFERENCES permissions (Permissions_id);`,

  `ALTER TABLE pet
    ADD CONSTRAINT fk_pet_owner FOREIGN KEY (Owner_FK_ID) REFERENCES owner (Owner_id);`,

  `ALTER TABLE pqrs
    ADD CONSTRAINT fk_pqrs_category FOREIGN KEY (PQRS_category_FK_ID) REFERENCES pqrs_category (PQRS_category_id),
    ADD CONSTRAINT fk_pqrs_owner FOREIGN KEY (Owner_FK_ID) REFERENCES owner (Owner_id);`,

  `ALTER TABLE pqrs_tracking
    ADD CONSTRAINT fk_pqrs_tracking_pqrs FOREIGN KEY (PQRS_tracking_PQRS_FK_ID) REFERENCES pqrs (PQRS_id),
    ADD CONSTRAINT fk_pqrs_tracking_status FOREIGN KEY (PQRS_tracking_status_FK_ID) REFERENCES pqrs_tracking_status (PQRS_tracking_status_id),
    ADD CONSTRAINT fk_pqrs_tracking_user FOREIGN KEY (PQRS_tracking_user_FK_ID) REFERENCES users (Users_id);`,

  `ALTER TABLE profile
    ADD CONSTRAINT fk_profile_user FOREIGN KEY (User_FK_ID) REFERENCES users (Users_id);`,

  `ALTER TABLE question
    ADD CONSTRAINT question_ibfk_1 FOREIGN KEY (survey_id) REFERENCES survey (survey_id) ON DELETE CASCADE,
    ADD CONSTRAINT question_ibfk_2 FOREIGN KEY (question_type_id) REFERENCES question_type (question_type_id);`,

  `ALTER TABLE reservation
    ADD CONSTRAINT fk_reservation_facility FOREIGN KEY (Facility_FK_ID) REFERENCES facility (Facility_id),
    ADD CONSTRAINT fk_reservation_owner FOREIGN KEY (Owner_FK_ID) REFERENCES owner (Owner_id),
    ADD CONSTRAINT fk_reservation_status FOREIGN KEY (Reservation_status_FK_ID) REFERENCES reservation_status (Reservation_status_id),
    ADD CONSTRAINT fk_reservation_type FOREIGN KEY (Reservation_type_FK_ID) REFERENCES reservation_type (Reservation_type_id);`,

  `ALTER TABLE users
    ADD CONSTRAINT fk_users_role FOREIGN KEY (Role_FK_ID) REFERENCES role (Role_id),
    ADD CONSTRAINT fk_users_status FOREIGN KEY (User_status_FK_ID) REFERENCES user_status (User_status_id);`,

  `ALTER TABLE visitor
    ADD CONSTRAINT fk_visitor_host FOREIGN KEY (host) REFERENCES owner (Owner_id);`,

];

export async function runMigration() {
  let conecction;

  // Logs para ver si si está cargando las variables de conexión ;:D
  console.log('DB config used for connection:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database
  });

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
