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

export async function seedFacilitiesAndReservations() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🏊 Sembrando instalaciones y reservas...');

    // Sembrar Instalaciones
    const facilities = [
      { name: 'Piscina', description: 'Área principal de piscina', capacity: 30 },
      { name: 'Gimnasio', description: 'Centro de fitness con equipamiento', capacity: 20 },
      { name: 'Salón de Fiestas', description: 'Espacio para eventos y celebraciones', capacity: 50 },
      { name: 'Zona BBQ', description: 'Espacio exterior para asados', capacity: 15 },
      { name: 'Cancha de Tenis', description: 'Cancha de tenis profesional', capacity: 4 },
      { name: 'Parque Infantil', description: 'Área de juegos para niños', capacity: 25 },
      { name: 'Espacio de Coworking', description: 'Espacio de trabajo compartido', capacity: 12 }
    ];

    for (const facility of facilities) {
      await connection.query(`
        INSERT INTO facility (Facility_name, Facility_description, Facility_capacity)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE Facility_description = VALUES(Facility_description)
      `, [facility.name, facility.description, facility.capacity]);
    }
    console.log(`   ✓ ${facilities.length} instalaciones creadas`);

    // Obtener IDs para reservas
    const [facilitiesResult] = await connection.query('SELECT Facility_id, Facility_name FROM facility');
    const [types] = await connection.query('SELECT Reservation_type_id, Reservation_type_name FROM reservation_type');
    const [statuses] = await connection.query('SELECT Reservation_status_id, Reservation_status_name FROM reservation_status');
    const [owners] = await connection.query('SELECT Owner_id FROM owner LIMIT 5');

    const pool = facilitiesResult.find(f => f.Facility_name === 'Piscina').Facility_id;
    const gym = facilitiesResult.find(f => f.Facility_name === 'Gimnasio').Facility_id;
    const party = facilitiesResult.find(f => f.Facility_name === 'Salón de Fiestas').Facility_id;

    const roomType = types.find(t => t.Reservation_type_name === 'Habitación').Reservation_type_id;
    const pending = statuses.find(s => s.Reservation_status_name === 'Pendiente').Reservation_status_id;
    const confirmed = statuses.find(s => s.Reservation_status_name === 'Confirmada').Reservation_status_id;
    const completed = statuses.find(s => s.Reservation_status_name === 'Completada').Reservation_status_id;

    // Crear algunas reservas
    const reservations = [
      { 
        type: roomType, 
        status: confirmed, 
        start: '2025-10-20 15:00:00', 
        end: '2025-10-20 18:00:00', 
        facility: pool,
        desc: 'Fiesta de cumpleaños en la piscina',
        owner: owners[0].Owner_id
      },
      { 
        type: roomType, 
        status: pending, 
        start: '2025-10-25 10:00:00', 
        end: '2025-10-25 12:00:00', 
        facility: gym,
        desc: 'Sesión de entrenamiento personal',
        owner: owners[1].Owner_id
      },
      { 
        type: roomType, 
        status: confirmed, 
        start: '2025-11-01 19:00:00', 
        end: '2025-11-01 23:00:00', 
        facility: party,
        desc: 'Reunión comunitaria',
        owner: owners[2].Owner_id
      },
      { 
        type: roomType, 
        status: completed, 
        start: '2025-10-01 14:00:00', 
        end: '2025-10-01 16:00:00', 
        facility: pool,
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
          Facility_FK_ID,
          Reservation_description,
          Owner_FK_ID
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        reservation.type,
        reservation.status,
        reservation.start,
        reservation.end,
        reservation.facility,
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
  seedFacilitiesAndReservations().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}
