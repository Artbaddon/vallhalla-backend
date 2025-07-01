import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "vallhalladb"
};

async function testMigration() {
  console.log('Starting test migration...');
  let connection;
  
  try {
    // Create initial connection without database
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });
    console.log('Connected to database server');
    
    // Create database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database};`);
    console.log(`Database ${dbConfig.database} created or already exists`);
    
    // Close connection
    await connection.end();
    console.log('Test migration completed successfully');
  } catch (error) {
    console.error('Test migration failed:', error);
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        // Ignore error on closing
      }
    }
  }
}

testMigration(); 