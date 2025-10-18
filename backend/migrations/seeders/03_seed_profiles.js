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

export async function seedProfiles() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('📝 Sembrando perfiles...');

    // Obtener IDs de usuarios
    const [users] = await connection.query('SELECT Users_id, Users_name FROM users');
    
    const profiles = [
      { name: 'admin', fullName: 'Administrador del Sistema', docType: 'CC', docNum: '1000000000', phone: '3000000000' },
      { name: 'testowner', fullName: 'Propietario de Prueba', docType: 'CC', docNum: '2000000000', phone: '3000000001' },
      { name: 'testsecurity', fullName: 'Seguridad de Prueba', docType: 'CC', docNum: '3000000000', phone: '3000000002' },
      { name: 'guard1', fullName: 'Juan García', docType: 'CC', docNum: '1001001001', phone: '3001001001' },
      { name: 'guard2', fullName: 'María Rodríguez', docType: 'CC', docNum: '1001001002', phone: '3001001002' },
      { name: 'owner2', fullName: 'David López', docType: 'PP', docNum: '5566778899', phone: '3005566778' },
      { name: 'owner3', fullName: 'Emma Martínez', docType: 'CC', docNum: '6677889900', phone: '3006677889' },
      { name: 'security2', fullName: 'Carlos Sánchez', docType: 'CC', docNum: '7788990011', phone: '3007788990' },
      { name: 'inactive_user', fullName: 'Usuario Inactivo', docType: 'CC', docNum: '8899001122', phone: '3008899001' },
      { name: 'pending_user', fullName: 'Usuario Pendiente', docType: 'CC', docNum: '9900112233', phone: '3009900112' },
      { name: 'blocked_user', fullName: 'Usuario Bloqueado', docType: 'CC', docNum: '0011223344', phone: '3000112233' },
      { name: 'demo_admin', fullName: 'Demo Administrador', docType: 'CC', docNum: '1234567890', phone: '3001234567' },
      { name: 'demo_owner', fullName: 'Demo Propietario', docType: 'CC', docNum: '0987654321', phone: '3009876543' },
      { name: 'demo_security', fullName: 'Demo Seguridad', docType: 'CC', docNum: '5678901234', phone: '3005678901' },
      { name: 'john_doe', fullName: 'Pedro Pérez', docType: 'CC', docNum: '2233445566', phone: '3002233445' },
      { name: 'jane_smith', fullName: 'Ana Silva', docType: 'CC', docNum: '3344556677', phone: '3003344556' }
    ];

    for (const profile of profiles) {
      const user = users.find(u => u.Users_name === profile.name);
      if (user) {
        await connection.query(`
          INSERT INTO profile (Profile_fullName, User_FK_ID, Profile_document_type, Profile_document_number, Profile_telephone_number)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE Profile_fullName = VALUES(Profile_fullName)
        `, [profile.fullName, user.Users_id, profile.docType, profile.docNum, profile.phone]);
      }
    }

    console.log(`   ✓ ${profiles.length} perfiles creados`);
    return { success: true };
  } catch (error) {
    console.error('   ❌ Error sembrando perfiles:', error);
    return { success: false, error };
  } finally {
    if (connection) await connection.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedProfiles().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}
