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

export async function seedReservations() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('📅 Sembrando reservas...');

    // Obtener IDs para reservas
    const [types] = await connection.query('SELECT Reservation_type_id, Reservation_type_name FROM reservation_type');
    const [statuses] = await connection.query('SELECT Reservation_status_id, Reservation_status_name FROM reservation_status');
    const [owners] = await connection.query('SELECT Owner_id FROM owner LIMIT 5');

    if (owners.length < 4) {
      throw new Error('At least 4 owners are required to seed reservations');
    }

    const roomType = types.find(t => t.Reservation_type_name === 'Habitación')?.Reservation_type_id;
    const gymType = types.find(t => t.Reservation_type_name === 'Gimnasio')?.Reservation_type_id;
    const salonType = types.find(t => t.Reservation_type_name === 'Salón Comunal')?.Reservation_type_id;
    const pending = statuses.find(s => s.Reservation_status_name === 'Pendiente')?.Reservation_status_id;
    const confirmed = statuses.find(s => s.Reservation_status_name === 'Confirmada')?.Reservation_status_id;
    const completed = statuses.find(s => s.Reservation_status_name === 'Completada')?.Reservation_status_id;

    if (!pending || !confirmed || !completed) {
      throw new Error('Reservation statuses required for seeding are missing');
    }

    if (!roomType || !gymType || !salonType) {
      throw new Error('Reservation types required for seeding are missing');
    }

    // Crear algunas reservas
    const reservations = [
      { 
        type: roomType,
        status: confirmed, 
        start: '2025-10-20 15:00:00', 
        end: '2025-10-20 18:00:00', 
        desc: 'Fiesta de cumpleaños en la piscina',
        owner: owners[0].Owner_id
      },
      { 
        type: gymType,
        status: pending,
        start: '2025-10-25 10:00:00', 
        end: '2025-10-25 12:00:00', 
        desc: 'Sesión de entrenamiento personal',
        owner: owners[1].Owner_id
      },
      { 
        type: salonType,
        status: confirmed, 
        start: '2025-11-01 19:00:00', 
        end: '2025-11-01 23:00:00', 
        desc: 'Reunión comunitaria',
        owner: owners[2].Owner_id
      },
      { 
        type: roomType, 
        status: completed, 
        start: '2025-10-01 14:00:00', 
        end: '2025-10-01 16:00:00', 
        desc: 'Clases de natación',
        owner: owners[3].Owner_id
      }
    ];

    for (const reservation of reservations) {
      await connection.query(`
        INSERT INTO reservation (
          Reservation_type_FK_ID, 
          Reservation_status_FK_ID, 
          Reservation_start_time, 
          Reservation_end_time, 
          Reservation_description,
          Owner_FK_ID
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        reservation.type,
        reservation.status,
        reservation.start,
        reservation.end,
        reservation.desc,
        reservation.owner
      ]);
    }
    console.log(`   ✓ ${reservations.length} reservas creadas`);

    return { success: true };
  } catch (error) {
    console.error('   ❌ Error sembrando instalaciones y reservas:', error);
    return { success: false, error };
  } finally {
    if (connection) await connection.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedReservations().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}
