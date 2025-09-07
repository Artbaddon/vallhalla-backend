import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/*
  Incremental RBAC Migration
  - Adds missing columns required by rbacConfig.js
  - Creates linking FKs and tables if absent
  - Safe (no DROP DATABASE). Idempotent via conditional checks.
*/

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vallhalladb',
  multipleStatements: true
};

// Build statements array incrementally for clarity
const statements = [
  // Ensure database exists
  `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
  `USE \`${process.env.DB_NAME}\`;`,

  // 1. Ensure role table has required columns
  `ALTER TABLE role ADD COLUMN IF NOT EXISTS Role_description VARCHAR(255) NULL AFTER Role_name;`,

  // 2. Ensure users table required columns (name, password, status FK, role FK, created timestamps)
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS Users_name VARCHAR(50) NULL AFTER Users_id;`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS Users_password VARCHAR(255) NULL AFTER Users_name;`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS User_status_FK_ID INT NULL AFTER Users_password;`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS Role_FK_ID INT NULL AFTER User_status_FK_ID;`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS Users_createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER Role_FK_ID;`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS Users_updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER Users_createdAt;`,
  // Add FKs if not present (MySQL <=8 doesn't support IF NOT EXISTS for add constraint; perform guard)
  `SET @fk1 := (SELECT CONSTRAINT_NAME FROM information_schema.key_column_usage WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='users' AND REFERENCED_TABLE_NAME='role' LIMIT 1);`,
  `SET @stmt := IF(@fk1 IS NULL, 'ALTER TABLE users ADD CONSTRAINT fk_users_role FOREIGN KEY (Role_FK_ID) REFERENCES role(Role_id)', 'DO 0');`,
  `PREPARE fkstmt FROM @stmt; EXECUTE fkstmt; DEALLOCATE PREPARE fkstmt;`,

  `SET @fk2 := (SELECT CONSTRAINT_NAME FROM information_schema.key_column_usage WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='users' AND REFERENCED_TABLE_NAME='user_status' LIMIT 1);`,
  `SET @stmt2 := IF(@fk2 IS NULL, 'ALTER TABLE users ADD CONSTRAINT fk_users_status FOREIGN KEY (User_status_FK_ID) REFERENCES user_status(User_status_id)', 'DO 0');`,
  `PREPARE fkstmt2 FROM @stmt2; EXECUTE fkstmt2; DEALLOCATE PREPARE fkstmt2;`,

  // 3. Ensure owner has link to user for ownership checks
  `ALTER TABLE owner ADD COLUMN IF NOT EXISTS User_FK_ID INT NULL AFTER Owner_id;`,
  `SET @fk3 := (SELECT CONSTRAINT_NAME FROM information_schema.key_column_usage WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='owner' AND REFERENCED_TABLE_NAME='users' LIMIT 1);`,
  `SET @stmt3 := IF(@fk3 IS NULL, 'ALTER TABLE owner ADD CONSTRAINT fk_owner_user FOREIGN KEY (User_FK_ID) REFERENCES users(Users_id)', 'DO 0');`,
  `PREPARE fkstmt3 FROM @stmt3; EXECUTE fkstmt3; DEALLOCATE PREPARE fkstmt3;`,

  // 4. Ensure module table has required columns
  `ALTER TABLE module ADD COLUMN IF NOT EXISTS module_name VARCHAR(50) NULL AFTER Module_id;`,
  `ALTER TABLE module ADD COLUMN IF NOT EXISTS module_description VARCHAR(255) NULL AFTER module_name;`,

  // 5. Ensure permissions table has proper columns
  `ALTER TABLE permissions ADD COLUMN IF NOT EXISTS Permissions_name VARCHAR(50) NULL AFTER Permissions_id;`,
  `ALTER TABLE permissions ADD COLUMN IF NOT EXISTS Permissions_description VARCHAR(255) NULL AFTER Permissions_name;`,

  // 6. Ensure module_role has role FK column
  `ALTER TABLE module_role ADD COLUMN IF NOT EXISTS Role_FK_ID INT NULL AFTER Module_FK_ID;`,
  `SET @fk4 := (SELECT CONSTRAINT_NAME FROM information_schema.key_column_usage WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='module_role' AND COLUMN_NAME='Role_FK_ID' AND REFERENCED_TABLE_NAME='role');`,
  `SET @stmt4 := IF(@fk4 IS NULL, 'ALTER TABLE module_role ADD CONSTRAINT fk_module_role_role FOREIGN KEY (Role_FK_ID) REFERENCES role(Role_id)', 'DO 0');`,
  `PREPARE fkstmt4 FROM @stmt4; EXECUTE fkstmt4; DEALLOCATE PREPARE fkstmt4;`,

  // 7. Ensure permissions_module_role has Module_role_FK_ID and FK
  `ALTER TABLE permissions_module_role ADD COLUMN IF NOT EXISTS Module_role_FK_ID INT NULL AFTER Permissions_FK_ID;`,
  `SET @fk5 := (SELECT CONSTRAINT_NAME FROM information_schema.key_column_usage WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='permissions_module_role' AND COLUMN_NAME='Module_role_FK_ID' AND REFERENCED_TABLE_NAME='module_role');`,
  `SET @stmt5 := IF(@fk5 IS NULL, 'ALTER TABLE permissions_module_role ADD CONSTRAINT fk_pmr_module_role FOREIGN KEY (Module_role_FK_ID) REFERENCES module_role(Module_role_id)', 'DO 0');`,
  `PREPARE fkstmt5 FROM @stmt5; EXECUTE fkstmt5; DEALLOCATE PREPARE fkstmt5;`,

  // 8. Ensure unique constraints for lookups (MySQL lacks IF NOT EXISTS for indexes) using dynamic checks
  // role unique
  `SET @idx_role := (SELECT INDEX_NAME FROM information_schema.statistics WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='role' AND INDEX_NAME='uq_role_name' LIMIT 1);`,
  `SET @stmt_idx_role := IF(@idx_role IS NULL, 'ALTER TABLE role ADD UNIQUE KEY uq_role_name (Role_name)', 'DO 0');`,
  `PREPARE stmt_idx_role FROM @stmt_idx_role; EXECUTE stmt_idx_role; DEALLOCATE PREPARE stmt_idx_role;`,
  // permissions unique
  `SET @idx_perm := (SELECT INDEX_NAME FROM information_schema.statistics WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='permissions' AND INDEX_NAME='uq_permissions_name' LIMIT 1);`,
  `SET @stmt_idx_perm := IF(@idx_perm IS NULL, 'ALTER TABLE permissions ADD UNIQUE KEY uq_permissions_name (Permissions_name)', 'DO 0');`,
  `PREPARE stmt_idx_perm FROM @stmt_idx_perm; EXECUTE stmt_idx_perm; DEALLOCATE PREPARE stmt_idx_perm;`,
  // module unique
  `SET @idx_mod := (SELECT INDEX_NAME FROM information_schema.statistics WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='module' AND INDEX_NAME='uq_module_name' LIMIT 1);`,
  `SET @stmt_idx_mod := IF(@idx_mod IS NULL, 'ALTER TABLE module ADD UNIQUE KEY uq_module_name (module_name)', 'DO 0');`,
  `PREPARE stmt_idx_mod FROM @stmt_idx_mod; EXECUTE stmt_idx_mod; DEALLOCATE PREPARE stmt_idx_mod;`,

  // 9. Seed baseline reference data (idempotent inserts) - do not assume timestamp column names
  `INSERT INTO role (Role_name, Role_description) VALUES ('Admin','System administrator') ON DUPLICATE KEY UPDATE Role_description=VALUES(Role_description);`,
  `INSERT INTO role (Role_name, Role_description) VALUES ('Owner','Property owner') ON DUPLICATE KEY UPDATE Role_description=VALUES(Role_description);`,
  `INSERT INTO role (Role_name, Role_description) VALUES ('Security','Security staff') ON DUPLICATE KEY UPDATE Role_description=VALUES(Role_description);`,

  `INSERT INTO user_status (User_status_name) VALUES ('Active') ON DUPLICATE KEY UPDATE User_status_name=VALUES(User_status_name);`,
  `INSERT INTO user_status (User_status_name) VALUES ('Inactive') ON DUPLICATE KEY UPDATE User_status_name=VALUES(User_status_name);`,

  // Seed permissions (avoid assuming updatedAt column exists; insert only known columns)
  `INSERT INTO permissions (Permissions_name, Permissions_description) VALUES ('create','Create records') ON DUPLICATE KEY UPDATE Permissions_description=VALUES(Permissions_description);`,
  `INSERT INTO permissions (Permissions_name, Permissions_description) VALUES ('read','Read records') ON DUPLICATE KEY UPDATE Permissions_description=VALUES(Permissions_description);`,
  `INSERT INTO permissions (Permissions_name, Permissions_description) VALUES ('update','Update records') ON DUPLICATE KEY UPDATE Permissions_description=VALUES(Permissions_description);`,
  `INSERT INTO permissions (Permissions_name, Permissions_description) VALUES ('delete','Delete records') ON DUPLICATE KEY UPDATE Permissions_description=VALUES(Permissions_description);`,

];

// Add module seed statements individually (ensures proper semicolon separation)
const moduleNames = [
  'users','owners','apartments','pets','pqrs','reservations','payments','visitors','surveys','questions','answers','parking','roles','permissions','modules','role-permissions','pqrs-categories','apartment-status','reservation-status','reservation-type','vehicle-type','notifications','profile'
];
for (const name of moduleNames) {
  statements.push(`INSERT INTO module (module_name, module_description) VALUES ('${name}', '${name} management') ON DUPLICATE KEY UPDATE module_description=VALUES(module_description);`);
}

statements.push(

  // 10. Create Admin user if not exists (placeholder password to be updated by seed script)
  `INSERT INTO users (Users_name, Users_password, User_status_FK_ID, Role_FK_ID, Users_createdAt, Users_updatedAt) 
   SELECT * FROM (SELECT 'admin' AS Users_name, '$2b$10$placeholderplaceholderplaceholderplH1uOe' AS Users_password, 1 AS User_status_FK_ID, (SELECT Role_id FROM role WHERE Role_name='Admin') AS Role_FK_ID, NOW() AS Users_createdAt, NOW() AS Users_updatedAt) AS tmp
   WHERE NOT EXISTS (SELECT 1 FROM users WHERE Users_name='admin') LIMIT 1;`
);

export async function runMigrationRBAC() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('[RBAC MIGRATION] Connected to MySQL');
    for (const sql of statements) {
      try {
        await connection.query(sql);
      } catch (err) {
        console.error('[RBAC MIGRATION] Error executing statement:', err.message);
        throw err;
      }
    }
    console.log('[RBAC MIGRATION] Completed successfully');
    return { success: true };
  } catch (error) {
    console.error('[RBAC MIGRATION] Failed:', error);
    return { success: false, error };
  } finally {
    if (connection) await connection.end();
  }
}

// Allow running directly via node
if (process.argv[1] && process.argv[1].includes('migration_v2_rbac.js')) {
  runMigrationRBAC().then(r => { if(!r.success) process.exit(1); });
}
