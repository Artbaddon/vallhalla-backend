import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "vallhalladb",
};

async function addNotificationIsReadColumn() {
  try {
    console.log("Starting migration to add Notification_is_read column...");
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Check if column exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'notification' AND COLUMN_NAME = 'Notification_is_read'
    `, [dbConfig.database]);

    if (columns.length === 0) {
      // Add the column if it doesn't exist
      await connection.query(`
        ALTER TABLE notification 
        ADD COLUMN Notification_is_read TINYINT(1) NOT NULL DEFAULT 0 
        AFTER Notification_attachments
      `);
      console.log("Successfully added Notification_is_read column");
    } else {
      console.log("Notification_is_read column already exists");
    }

    await connection.end();
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

addNotificationIsReadColumn(); 