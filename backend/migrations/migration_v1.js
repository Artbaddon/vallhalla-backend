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
  
  `DROP TABLE IF EXISTS answer`,
  `DROP TABLE IF EXISTS question`,
  `DROP TABLE IF EXISTS question_type`,
  `DROP TABLE IF EXISTS survey`,

  // Create tables (structure and names as in vallhalladb.sql)
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
