import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "vallhalladb",
};

async function insertDummyData() {
  let connection;
  try {
    // Create connection to database
    connection = await mysql.createConnection(dbConfig);
    console.log("Connected to database");

    // Insert dummy data for each table
    
    // 1. Additional user statuses (some already exist from migration)
    console.log("Inserting user statuses...");
    await connection.query(`
      INSERT IGNORE INTO user_status (User_status_name) VALUES 
      ('Suspended'),
      ('On Vacation')
    `);

    // 2. Additional roles (some already exist from migration)
    console.log("Inserting roles...");
    await connection.query(`
      INSERT IGNORE INTO role (Role_name, Role_description) VALUES 
      ('Tenant', 'Apartment tenant with limited access'),
      ('Maintenance', 'Maintenance staff with specific access'),
      ('Manager', 'Property manager with extended access')
    `);

    // 3. Additional users
    console.log("Inserting users...");
    await connection.query(`
      INSERT INTO users (Users_name, Users_password, User_status_FK_ID, Role_FK_ID) VALUES 
      ('john_admin', '${bcrypt.hashSync("password123", 10)}', 1, (SELECT Role_id FROM role WHERE Role_name = 'Admin')),
      ('maria_owner', '${bcrypt.hashSync("password123", 10)}', 1, (SELECT Role_id FROM role WHERE Role_name = 'Owner')),
      ('pedro_security', '${bcrypt.hashSync("password123", 10)}', 1, (SELECT Role_id FROM role WHERE Role_name = 'Security')),
      ('ana_tenant', '${bcrypt.hashSync("password123", 10)}', 1, (SELECT Role_id FROM role WHERE Role_name = 'Tenant')),
      ('carlos_maintenance', '${bcrypt.hashSync("password123", 10)}', 1, (SELECT Role_id FROM role WHERE Role_name = 'Maintenance')),
      ('laura_manager', '${bcrypt.hashSync("password123", 10)}', 1, (SELECT Role_id FROM role WHERE Role_name = 'Manager')),
      ('david_owner', '${bcrypt.hashSync("password123", 10)}', 1, (SELECT Role_id FROM role WHERE Role_name = 'Owner')),
      ('sofia_owner', '${bcrypt.hashSync("password123", 10)}', 1, (SELECT Role_id FROM role WHERE Role_name = 'Owner')),
      ('miguel_security', '${bcrypt.hashSync("password123", 10)}', 2, (SELECT Role_id FROM role WHERE Role_name = 'Security')),
      ('lucia_owner', '${bcrypt.hashSync("password123", 10)}', 1, (SELECT Role_id FROM role WHERE Role_name = 'Owner'))
    `);

    // 4. Profiles for users
    console.log("Inserting profiles...");
    await connection.query(`
      INSERT INTO profile (Profile_fullName, User_FK_ID, Profile_document_type, Profile_document_number, Profile_telephone_number, Profile_photo) VALUES 
      ('John Administrator', (SELECT Users_id FROM users WHERE Users_name = 'john_admin'), 'ID', '1001234567', '3001234567', 'profile1.jpg'),
      ('Maria Rodriguez', (SELECT Users_id FROM users WHERE Users_name = 'maria_owner'), 'Passport', '1002345678', '3002345678', 'profile2.jpg'),
      ('Pedro Gomez', (SELECT Users_id FROM users WHERE Users_name = 'pedro_security'), 'ID', '1003456789', '3003456789', 'profile3.jpg'),
      ('Ana Martinez', (SELECT Users_id FROM users WHERE Users_name = 'ana_tenant'), 'ID', '1004567890', '3004567890', 'profile4.jpg'),
      ('Carlos Jimenez', (SELECT Users_id FROM users WHERE Users_name = 'carlos_maintenance'), 'ID', '1005678901', '3005678901', 'profile5.jpg'),
      ('Laura Sanchez', (SELECT Users_id FROM users WHERE Users_name = 'laura_manager'), 'Passport', '1006789012', '3006789012', 'profile6.jpg'),
      ('David Hernandez', (SELECT Users_id FROM users WHERE Users_name = 'david_owner'), 'ID', '1007890123', '3007890123', 'profile7.jpg'),
      ('Sofia Diaz', (SELECT Users_id FROM users WHERE Users_name = 'sofia_owner'), 'ID', '1008901234', '3008901234', 'profile8.jpg'),
      ('Miguel Torres', (SELECT Users_id FROM users WHERE Users_name = 'miguel_security'), 'ID', '1009012345', '3009012345', 'profile9.jpg'),
      ('Lucia Vargas', (SELECT Users_id FROM users WHERE Users_name = 'lucia_owner'), 'Passport', '1000123456', '3000123456', 'profile10.jpg')
    `);

    // 5. Owners
    console.log("Inserting owners...");
    await connection.query(`
      INSERT INTO owner (User_FK_ID, Owner_is_tenant, Owner_birth_date) VALUES 
      ((SELECT Users_id FROM users WHERE Users_name = 'maria_owner'), 0, '1980-05-15'),
      ((SELECT Users_id FROM users WHERE Users_name = 'david_owner'), 0, '1975-08-22'),
      ((SELECT Users_id FROM users WHERE Users_name = 'sofia_owner'), 1, '1990-03-10'),
      ((SELECT Users_id FROM users WHERE Users_name = 'lucia_owner'), 0, '1985-11-28')
    `);

    // 6. Additional towers
    console.log("Inserting towers...");
    await connection.query(`
      INSERT IGNORE INTO tower (Tower_name) VALUES 
      ('Tower C'),
      ('Tower D'),
      ('South'),
      ('East')
    `);

    // 7. Apartment statuses
    console.log("Inserting apartment statuses...");
    await connection.query(`
      INSERT IGNORE INTO apartment_status (Apartment_status_name) VALUES 
      ('Under Maintenance'),
      ('For Sale'),
      ('Reserved')
    `);

    // 8. Apartments
    console.log("Inserting apartments...");
    await connection.query(`
      INSERT INTO apartment (Apartment_number, Apartment_status_FK_ID, Tower_FK_ID, Owner_FK_ID) VALUES 
      ('201', 1, 1, (SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'maria_owner'))),
      ('302', 2, 2, (SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'david_owner'))),
      ('403', 1, 3, (SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'sofia_owner'))),
      ('504', 1, 4, (SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'lucia_owner'))),
      ('605', 3, 1, (SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'maria_owner'))),
      ('706', 2, 2, (SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'david_owner')))
    `);

    // 9. Guards
    console.log("Inserting guards...");
    await connection.query(`
      INSERT INTO guard (User_FK_ID, Guard_arl, Guard_eps, Guard_shift) VALUES 
      ((SELECT Users_id FROM users WHERE Users_name = 'pedro_security'), 'Sura ARL', 'Sanitas EPS', 'Morning'),
      ((SELECT Users_id FROM users WHERE Users_name = 'miguel_security'), 'Positiva ARL', 'Compensar EPS', 'Night')
    `);

    // 10. Visitors
    console.log("Inserting visitors...");
    await connection.query(`
      INSERT INTO visitor (name, documentNumber, host, enter_date, exit_date) VALUES 
      ('Juan Perez', '1234567890', (SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'maria_owner')), '2023-05-10 14:30:00', '2023-05-10 16:45:00'),
      ('Andrea Lopez', '2345678901', (SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'david_owner')), '2023-05-11 10:15:00', '2023-05-11 12:30:00'),
      ('Roberto Sanchez', '3456789012', (SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'sofia_owner')), '2023-05-12 18:00:00', NULL),
      ('Carmen Ruiz', '4567890123', (SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'lucia_owner')), '2023-05-13 09:45:00', '2023-05-13 11:20:00'),
      ('Fernando Gil', '5678901234', (SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'maria_owner')), '2023-05-14 16:30:00', NULL)
    `);

    // 11. Notification types already exist from migration

    // 12. Notifications
    console.log("Inserting notifications...");
    await connection.query(`
      INSERT INTO notification (Notification_type_FK_ID, Notification_description, Notification_User_FK_ID) VALUES 
      (1, 'System maintenance scheduled for tomorrow', NULL),
      (2, 'Payment reminder: Monthly fee due in 5 days', (SELECT Users_id FROM users WHERE Users_name = 'maria_owner')),
      (3, 'Your reservation for the party room has been confirmed', (SELECT Users_id FROM users WHERE Users_name = 'david_owner')),
      (4, 'Your PQRS has been resolved', (SELECT Users_id FROM users WHERE Users_name = 'sofia_owner')),
      (1, 'New building regulations have been published', NULL)
    `);

    // 13. Payment statuses already exist from migration

    // 14. Payments
    console.log("Inserting payments...");
    await connection.query(`
      INSERT INTO payment (Owner_ID_FK, Payment_total_payment, Payment_Status_ID_FK, Payment_date, Payment_method, Payment_reference_number) VALUES 
      ((SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'maria_owner')), 250000, 2, '2023-05-01 10:30:00', 'Credit Card', 'REF123456'),
      ((SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'david_owner')), 250000, 1, '2023-05-02 14:45:00', 'Bank Transfer', 'REF234567'),
      ((SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'sofia_owner')), 250000, 2, '2023-05-03 09:15:00', 'Cash', 'REF345678'),
      ((SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'lucia_owner')), 250000, 3, '2023-05-04 16:20:00', 'Credit Card', 'REF456789'),
      ((SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'maria_owner')), 50000, 2, '2023-05-05 11:10:00', 'Bank Transfer', 'REF567890')
    `);

    // 15. PQRS categories
    console.log("Inserting PQRS categories...");
    await connection.query(`
      INSERT INTO pqrs_category (PQRS_category_name) VALUES 
      ('Maintenance'),
      ('Security'),
      ('Noise Complaint'),
      ('Common Areas'),
      ('Administrative')
    `);

    // 16. PQRS
    console.log("Inserting PQRS...");
    await connection.query(`
      INSERT INTO pqrs (Owner_FK_ID, PQRS_category_FK_ID, PQRS_subject, PQRS_description, PQRS_priority, PQRS_file, PQRS_answer) VALUES 
      ((SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'maria_owner')), 1, 'Water leak in bathroom', 'There is a water leak in the main bathroom that needs urgent repair', 'HIGH', NULL, 'A plumber has been scheduled for tomorrow'),
      ((SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'david_owner')), 3, 'Noise complaint', 'Excessive noise from apartment 302 during night hours', 'MEDIUM', NULL, NULL),
      ((SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'sofia_owner')), 4, 'Pool maintenance', 'The pool needs cleaning and maintenance', 'LOW', 'pool_image.jpg', 'Pool maintenance scheduled for next week'),
      ((SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'lucia_owner')), 5, 'Monthly fee inquiry', 'Request for detailed breakdown of monthly fees', 'MEDIUM', NULL, 'Fee breakdown sent via email'),
      ((SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'maria_owner')), 2, 'Security concern', 'Main entrance gate not closing properly', 'HIGH', 'gate_image.jpg', NULL)
    `);

    // 17. PQRS tracking statuses
    console.log("Inserting PQRS tracking statuses...");
    await connection.query(`
      INSERT INTO pqrs_tracking_status (PQRS_tracking_status_name) VALUES 
      ('Open'),
      ('In Progress'),
      ('Resolved'),
      ('Closed'),
      ('Reopened')
    `);

    // 18. PQRS tracking
    console.log("Inserting PQRS tracking...");
    await connection.query(`
      INSERT INTO pqrs_tracking (PQRS_tracking_PQRS_FK_ID, PQRS_tracking_user_FK_ID, PQRS_tracking_status_FK_ID, PQRS_tracking_date_update) VALUES 
      (1, (SELECT Users_id FROM users WHERE Users_name = 'john_admin'), 2, '2023-05-10 09:30:00'),
      (2, (SELECT Users_id FROM users WHERE Users_name = 'laura_manager'), 1, '2023-05-11 14:15:00'),
      (3, (SELECT Users_id FROM users WHERE Users_name = 'john_admin'), 3, '2023-05-12 11:45:00'),
      (4, (SELECT Users_id FROM users WHERE Users_name = 'laura_manager'), 4, '2023-05-13 16:20:00'),
      (5, (SELECT Users_id FROM users WHERE Users_name = 'john_admin'), 2, '2023-05-14 10:10:00')
    `);

    // 19. Question types already exist from migration

    // 20. Reservation types already exist from migration

    // 21. Reservation statuses already exist from migration

    // 22. Reservations
    console.log("Inserting reservations...");
    await connection.query(`
      INSERT INTO reservation (Reservation_type_FK_ID, Reservation_status_FK_ID, Reservation_date, Reservation_start_time, Reservation_end_time, Reservation_description, Owner_FK_ID) VALUES 
      (1, 1, '2023-05-15 10:00:00', '2023-05-20 14:00:00', '2023-05-20 18:00:00', 'Birthday party', (SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'maria_owner'))),
      (2, 1, '2023-05-16 11:30:00', '2023-05-21 09:00:00', '2023-05-21 17:00:00', 'Guest parking', (SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'david_owner'))),
      (1, 2, '2023-05-17 09:15:00', '2023-05-22 16:00:00', '2023-05-22 20:00:00', 'Family gathering', (SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'sofia_owner'))),
      (1, 1, '2023-05-18 14:45:00', '2023-05-23 10:00:00', '2023-05-23 14:00:00', 'Business meeting', (SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'lucia_owner'))),
      (2, 2, '2023-05-19 16:20:00', '2023-05-24 08:00:00', '2023-05-24 18:00:00', 'Moving day parking', (SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'maria_owner')))
    `);

    // 23. Facilities already exist from migration

    // 24. Vehicle types
    console.log("Inserting vehicle types...");
    await connection.query(`
      INSERT INTO vehicle_type (Vehicle_type_name, vehicle_plate, vehicle_model, vehicle_brand, vehicle_color, vehicle_engineCC) VALUES 
      ('Car', 'ABC123', '2022', 'Toyota', 'Red', '2000'),
      ('Motorcycle', 'XYZ789', '2021', 'Honda', 'Black', '650'),
      ('SUV', 'DEF456', '2023', 'Ford', 'Blue', '3500'),
      ('Truck', 'GHI789', '2020', 'Chevrolet', 'White', '4000'),
      ('Van', 'JKL012', '2021', 'Mercedes', 'Silver', '2500')
    `);

    // 25. Parking statuses
    console.log("Inserting parking statuses...");
    await connection.query(`
      INSERT INTO parking_status (Parking_status_name) VALUES 
      ('Available'),
      ('Occupied'),
      ('Reserved'),
      ('Maintenance'),
      ('Visitor')
    `);

    // 26. Parking types
    console.log("Inserting parking types...");
    await connection.query(`
      INSERT INTO parking_type (Parking_type_name) VALUES 
      ('Resident'),
      ('Visitor'),
      ('Handicapped'),
      ('Motorcycle'),
      ('Loading')
    `);

    // 27. Parking
    console.log("Inserting parking...");
    await connection.query(`
      INSERT INTO parking (Parking_number, Parking_status_ID_FK, Vehicle_type_ID_FK, Parking_type_ID_FK, User_ID_FK) VALUES 
      ('A001', 2, 1, 1, (SELECT Users_id FROM users WHERE Users_name = 'maria_owner')),
      ('A002', 1, 2, 4, (SELECT Users_id FROM users WHERE Users_name = 'david_owner')),
      ('B001', 2, 3, 1, (SELECT Users_id FROM users WHERE Users_name = 'sofia_owner')),
      ('B002', 3, 4, 1, (SELECT Users_id FROM users WHERE Users_name = 'lucia_owner')),
      ('C001', 5, 5, 2, (SELECT Users_id FROM users WHERE Users_name = 'john_admin'))
    `);

    // 28. Pets
    console.log("Inserting pets...");
    await connection.query(`
      INSERT INTO pet (Pet_name, Pet_species, Pet_Breed, Pet_vaccination_card, Pet_Photo, Owner_FK_ID) VALUES 
      ('Max', 'Dog', 'Labrador', 'vaccination_card1.pdf', 'pet_photo1.jpg', (SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'maria_owner'))),
      ('Luna', 'Cat', 'Siamese', 'vaccination_card2.pdf', 'pet_photo2.jpg', (SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'david_owner'))),
      ('Rocky', 'Dog', 'German Shepherd', 'vaccination_card3.pdf', 'pet_photo3.jpg', (SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'sofia_owner'))),
      ('Milo', 'Cat', 'Persian', 'vaccination_card4.pdf', 'pet_photo4.jpg', (SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'lucia_owner'))),
      ('Bella', 'Dog', 'Poodle', 'vaccination_card5.pdf', 'pet_photo5.jpg', (SELECT Owner_id FROM owner WHERE User_FK_ID = (SELECT Users_id FROM users WHERE Users_name = 'maria_owner')))
    `);

    // 29. Surveys
    console.log("Inserting surveys...");
    await connection.query(`
      INSERT INTO survey (title, status) VALUES 
      ('Resident Satisfaction Survey', 'active'),
      ('Building Maintenance Feedback', 'active'),
      ('Community Event Planning', 'draft'),
      ('Security Services Evaluation', 'closed'),
      ('Amenities Usage Survey', 'active')
    `);

    // 30. Questions
    console.log("Inserting questions...");
    await connection.query(`
      INSERT INTO question (survey_id, title, question_type_id, options) VALUES 
      (1, 'How satisfied are you with the building maintenance?', (SELECT Question_type_id FROM question_type WHERE Question_type_name = 'rating'), '["1", "2", "3", "4", "5"]'),
      (1, 'What aspects of the building need improvement?', (SELECT Question_type_id FROM question_type WHERE Question_type_name = 'checkbox'), '["Security", "Cleanliness", "Common Areas", "Parking", "Noise Control"]'),
      (2, 'Rate the response time for maintenance requests', (SELECT Question_type_id FROM question_type WHERE Question_type_name = 'rating'), '["1", "2", "3", "4", "5"]'),
      (2, 'Do you have any suggestions for improving maintenance services?', (SELECT Question_type_id FROM question_type WHERE Question_type_name = 'text'), null),
      (3, 'Which community events would you like to participate in?', (SELECT Question_type_id FROM question_type WHERE Question_type_name = 'checkbox'), '["BBQ", "Movie Night", "Fitness Classes", "Book Club", "Children Activities"]')
    `);

    // 31. Answers
    console.log("Inserting answers...");
    await connection.query(`
      INSERT INTO answer (survey_id, question_id, user_id, value) VALUES 
      (1, 1, (SELECT Users_id FROM users WHERE Users_name = 'maria_owner'), '4'),
      (1, 2, (SELECT Users_id FROM users WHERE Users_name = 'maria_owner'), '["Security", "Parking"]'),
      (1, 1, (SELECT Users_id FROM users WHERE Users_name = 'david_owner'), '3'),
      (1, 2, (SELECT Users_id FROM users WHERE Users_name = 'david_owner'), '["Cleanliness", "Noise Control"]'),
      (2, 3, (SELECT Users_id FROM users WHERE Users_name = 'sofia_owner'), '5'),
      (2, 4, (SELECT Users_id FROM users WHERE Users_name = 'sofia_owner'), 'Faster response for emergency repairs would be appreciated')
    `);

    console.log("Dummy data insertion completed successfully");
    return true;
  } catch (error) {
    console.error("Error inserting dummy data:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed");
    }
  }
}

// Run the function if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  insertDummyData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default insertDummyData; 