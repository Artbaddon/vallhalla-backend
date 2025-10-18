import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vallhalladb',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
};

export async function seedTowers() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🏢 Sembrando torres...');

    await connection.query(`
      INSERT INTO tower (Tower_name) VALUES
        ('Tower A'),
        ('Tower B'),
        ('Tower C'),
        ('Tower D'),
        ('North'),
        ('South')
      ON DUPLICATE KEY UPDATE Tower_name = VALUES(Tower_name)
    `);

    console.log('   ✓ 6 torres creadas');
    return { success: true };
  } catch (error) {
    console.error('   ❌ Error sembrando torres:', error);
    return { success: false, error };
  } finally {
    if (connection) await connection.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedTowers().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}
