import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
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

export async function seedUsers() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('👥 Sembrando usuarios...');

    // Obtener IDs de roles y estados
    const [roles] = await connection.query('SELECT Role_id, Role_name FROM role');
    const [statuses] = await connection.query('SELECT User_status_id, User_status_name FROM user_status');
    
    const adminRole = roles.find(r => r.Role_name === 'Administrador').Role_id;
    const ownerRole = roles.find(r => r.Role_name === 'Propietario').Role_id;
    const securityRole = roles.find(r => r.Role_name === 'Seguridad').Role_id;
    const activeStatus = statuses.find(s => s.User_status_name === 'Activo').User_status_id;
    const inactiveStatus = statuses.find(s => s.User_status_name === 'Inactivo').User_status_id;
    const pendingStatus = statuses.find(s => s.User_status_name === 'Pendiente').User_status_id;
    const blockedStatus = statuses.find(s => s.User_status_name === 'Bloqueado').User_status_id;

    // Hashear contraseñas
    const password = await bcrypt.hash('password123', 10);

    // Insertar usuarios
    await connection.query(`
      INSERT INTO users (Users_name, Users_email, Users_password, User_status_FK_ID, Role_FK_ID) VALUES
        ('admin', 'admin@vallhalla.com', ?, ?, ?),
        ('testowner', 'testowner@example.com', ?, ?, ?),
        ('testsecurity', 'testsecurity@example.com', ?, ?, ?),
        ('guard1', 'guard1@example.com', ?, ?, ?),
        ('guard2', 'guard2@example.com', ?, ?, ?),
        ('owner2', 'owner2@example.com', ?, ?, ?),
        ('owner3', 'owner3@example.com', ?, ?, ?),
        ('security2', 'security2@example.com', ?, ?, ?),
        ('inactive_user', 'inactive@example.com', ?, ?, ?),
        ('pending_user', 'pending@example.com', ?, ?, ?),
        ('blocked_user', 'blocked@example.com', ?, ?, ?),
        ('demo_admin', 'demo_admin@example.com', ?, ?, ?),
        ('demo_owner', 'demo_owner@example.com', ?, ?, ?),
        ('demo_security', 'demo_security@example.com', ?, ?, ?),
        ('john_doe', 'john.doe@example.com', ?, ?, ?),
        ('jane_smith', 'jane.smith@example.com', ?, ?, ?)
      ON DUPLICATE KEY UPDATE Users_email = VALUES(Users_email)
    `, [
      password, activeStatus, adminRole,
      password, activeStatus, ownerRole,
      password, activeStatus, securityRole,
      password, activeStatus, securityRole,
      password, activeStatus, securityRole,
      password, activeStatus, ownerRole,
      password, activeStatus, ownerRole,
      password, activeStatus, securityRole,
      password, inactiveStatus, ownerRole,
      password, pendingStatus, ownerRole,
      password, blockedStatus, ownerRole,
      password, activeStatus, adminRole,
      password, activeStatus, ownerRole,
      password, activeStatus, securityRole,
      password, activeStatus, ownerRole,
      password, activeStatus, ownerRole
    ]);

    console.log('   ✓ 16 usuarios creados (contraseña para todos: password123)');
    return { success: true };
  } catch (error) {
    console.error('   ❌ Error sembrando usuarios:', error);
    return { success: false, error };
  } finally {
    if (connection) await connection.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedUsers().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}
