import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../../.env') });

const sslCertPath = '/home/deploy/DigiCertGlobalRootCA.crt.pem';
const sslOptions = fs.existsSync(sslCertPath)
  ? {
      ca: fs.readFileSync(sslCertPath),
      rejectUnauthorized: false,
    }
  : undefined;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vallhalladb',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
};

if (sslOptions) {
  dbConfig.ssl = sslOptions;
}

export async function seedApartments() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🏢 Sembrando apartamentos...');

    // Obtener IDs necesarios
    const [towers] = await connection.query('SELECT Tower_id, Tower_name FROM tower');
    const [statuses] = await connection.query('SELECT Apartment_status_id, Apartment_status_name FROM apartment_status');
    const [owners] = await connection.query('SELECT Owner_id FROM owner LIMIT 9');

    const available = statuses.find(s => s.Apartment_status_name === 'Disponible').Apartment_status_id;
    const occupied = statuses.find(s => s.Apartment_status_name === 'Ocupado').Apartment_status_id;

    const towerA = towers.find(t => t.Tower_name === 'Tower A').Tower_id;
    const towerB = towers.find(t => t.Tower_name === 'Tower B').Tower_id;
    const towerC = towers.find(t => t.Tower_name === 'Tower C').Tower_id;
    const towerD = towers.find(t => t.Tower_name === 'Tower D').Tower_id;
    const north = towers.find(t => t.Tower_name === 'North').Tower_id;

    const apartments = [
      { number: '101', status: available, tower: towerA, owner: owners[0].Owner_id },
      { number: '102', status: occupied, tower: towerA, owner: owners[1].Owner_id },
      { number: '103', status: available, tower: towerA, owner: owners[2].Owner_id },
      { number: '201', status: occupied, tower: towerB, owner: owners[3].Owner_id },
      { number: '202', status: available, tower: towerB, owner: owners[4].Owner_id },
      { number: '203', status: occupied, tower: towerB, owner: owners[5].Owner_id },
      { number: '301', status: available, tower: towerC, owner: owners[6].Owner_id },
      { number: '302', status: occupied, tower: towerC, owner: owners[7].Owner_id },
      { number: '303', status: available, tower: towerC, owner: owners[8].Owner_id },
      { number: '401', status: occupied, tower: towerD, owner: owners[0].Owner_id },
      { number: '402', status: available, tower: towerD, owner: owners[1].Owner_id },
      { number: '501', status: occupied, tower: north, owner: owners[2].Owner_id },
      { number: '502', status: available, tower: north, owner: owners[3].Owner_id }
    ];

    for (const apt of apartments) {
      await connection.query(`
        INSERT INTO apartment (Apartment_number, Apartment_status_FK_ID, Tower_FK_ID, Owner_FK_ID)
        VALUES (?, ?, ?, ?)
      `, [apt.number, apt.status, apt.tower, apt.owner]);
    }

    console.log(`   ✓ ${apartments.length} apartamentos creados`);
    return { success: true };
  } catch (error) {
    console.error('   ❌ Error sembrando apartamentos:', error);
    return { success: false, error };
  } finally {
    if (connection) await connection.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedApartments().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}
