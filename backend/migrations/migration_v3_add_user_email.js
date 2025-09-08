import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/*
  Incremental Migration v3: Add user email + password reset columns (idempotent)
  - Adds Users_email (unique) if missing
  - Adds Password_reset_token, Password_reset_expires if missing
  - Backfills Users_email for existing rows where NULL (sets to Users_name if not already used)
*/

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vallhalladb'
};

export async function runMigrationV3() {
  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
    console.log('[MIGRATION V3] Connected');
    // 1. Add Users_email column if missing
    const [cols] = await conn.query(`SHOW COLUMNS FROM users LIKE 'Users_email';`);
    if (cols.length === 0) {
      await conn.query(`ALTER TABLE users ADD COLUMN Users_email VARCHAR(150) NULL AFTER Users_name`);
      console.log('[MIGRATION V3] Added column Users_email');
    } else {
      console.log('[MIGRATION V3] Column Users_email already exists');
    }

    // 2. Add Password_reset_token if missing
    const [prt] = await conn.query(`SHOW COLUMNS FROM users LIKE 'Password_reset_token';`);
    if (prt.length === 0) {
      await conn.query(`ALTER TABLE users ADD COLUMN Password_reset_token VARCHAR(64) NULL AFTER Users_password`);
      console.log('[MIGRATION V3] Added column Password_reset_token');
    } else {
      console.log('[MIGRATION V3] Column Password_reset_token already exists');
    }

    // 3. Add Password_reset_expires if missing
    const [pre] = await conn.query(`SHOW COLUMNS FROM users LIKE 'Password_reset_expires';`);
    if (pre.length === 0) {
      await conn.query(`ALTER TABLE users ADD COLUMN Password_reset_expires DATETIME NULL AFTER Password_reset_token`);
      console.log('[MIGRATION V3] Added column Password_reset_expires');
    } else {
      console.log('[MIGRATION V3] Column Password_reset_expires already exists');
    }

    // 4. Create unique index for Users_email if not present (ignore if already there)
    const [idx] = await conn.query(`SELECT 1 FROM information_schema.statistics WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='users' AND INDEX_NAME='uq_users_email' LIMIT 1;`);
    if (idx.length === 0) {
      // Use TRY/CATCH pattern: some MariaDB versions lack IF NOT EXISTS for add unique key
      try {
        await conn.query(`ALTER TABLE users ADD UNIQUE KEY uq_users_email (Users_email)`);
        console.log('[MIGRATION V3] Created unique index uq_users_email');
      } catch (e) {
        if (e.code === 'ER_DUP_KEYNAME') {
          console.log('[MIGRATION V3] Unique index uq_users_email already exists (race)');
        } else {
          throw e;
        }
      }
    } else {
      console.log('[MIGRATION V3] Unique index uq_users_email already exists');
    }

    // 5. Backfill emails where null and username is unique
    const [bfResult] = await conn.query(`UPDATE users u
      SET Users_email = u.Users_name
      WHERE u.Users_email IS NULL
        AND u.Users_name IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM users u2 WHERE u2.Users_email = u.Users_name
        );`);
    if (bfResult.affectedRows) {
      console.log(`[MIGRATION V3] Backfilled ${bfResult.affectedRows} user email(s)`);
    } else {
      console.log('[MIGRATION V3] No user emails required backfill');
    }

    console.log('[MIGRATION V3] Completed successfully');
    return { success: true };
  } catch (e) {
    console.error('[MIGRATION V3] Failed:', e);
    return { success: false, error: e };
  } finally {
    if (conn) await conn.end();
  }
}

if (process.argv[1] && process.argv[1].includes('migration_v3_add_user_email.js')) {
  runMigrationV3().then(r => { if (!r.success) process.exit(1); });
}
