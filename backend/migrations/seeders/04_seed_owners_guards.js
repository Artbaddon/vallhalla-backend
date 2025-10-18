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

export async function seedOwnersAndGuards() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🏠 Sembrando propietarios y guardias...');

    // Obtener IDs de usuarios
    const [users] = await connection.query('SELECT Users_id, Users_name FROM users');
    
    // Sembrar Propietarios
    const owners = [
      { name: 'testowner', isTenant: 0, birthDate: '1985-03-15' },
      { name: 'owner2', isTenant: 0, birthDate: '1980-05-15' },
      { name: 'owner3', isTenant: 1, birthDate: '1975-08-22' },
      { name: 'inactive_user', isTenant: 0, birthDate: '1990-03-10' },
      { name: 'pending_user', isTenant: 1, birthDate: '1985-11-30' },
      { name: 'blocked_user', isTenant: 0, birthDate: '1982-07-25' },
      { name: 'demo_owner', isTenant: 0, birthDate: '1988-09-12' },
      { name: 'john_doe', isTenant: 0, birthDate: '1992-01-20' },
      { name: 'jane_smith', isTenant: 1, birthDate: '1987-06-08' }
    ];

    for (const owner of owners) {
      const user = users.find(u => u.Users_name === owner.name);
      if (user) {
        await connection.query(`
          INSERT INTO owner (User_FK_ID, Owner_is_tenant, Owner_birth_date)
          VALUES (?, ?, ?)
        `, [user.Users_id, owner.isTenant, owner.birthDate]);
      }
    }
    console.log(`   ✓ ${owners.length} propietarios creados`);

    // Sembrar Guardias
    const guards = [
      { name: 'testsecurity', arl: 'Sura ARL', eps: 'Nueva EPS', shift: 'Morning' },
      { name: 'guard1', arl: 'Sura ARL', eps: 'Nueva EPS', shift: 'Morning' },
      { name: 'guard2', arl: 'Colmena ARL', eps: 'Sanitas EPS', shift: 'Night' },
      { name: 'security2', arl: 'Positiva ARL', eps: 'Salud Total', shift: 'Afternoon' },
      { name: 'demo_security', arl: 'Sura ARL', eps: 'Nueva EPS', shift: 'Night' }
    ];

    for (const guard of guards) {
      const user = users.find(u => u.Users_name === guard.name);
      if (user) {
        await connection.query(`
          INSERT INTO guard (User_FK_ID, Guard_arl, Guard_eps, Guard_shift)
          VALUES (?, ?, ?, ?)
        `, [user.Users_id, guard.arl, guard.eps, guard.shift]);
      }
    }
    console.log(`   ✓ ${guards.length} guardias creados`);

    return { success: true };
  } catch (error) {
    console.error('   ❌ Error sembrando propietarios y guardias:', error);
    return { success: false, error };
  } finally {
    if (connection) await connection.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedOwnersAndGuards().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}
