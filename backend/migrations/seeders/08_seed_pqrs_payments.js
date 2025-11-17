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

export async function seedPQRSAndPayments() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('📋 Sembrando PQRS y pagos...');

    // Obtener IDs necesarios
    const [owners] = await connection.query('SELECT Owner_id FROM owner LIMIT 5');
    const [categories] = await connection.query('SELECT PQRS_category_id, PQRS_category_name FROM pqrs_category');

    // Sembrar PQRS
    const maintenance = categories.find(c => c.PQRS_category_name === 'Mantenimiento').PQRS_category_id;
    const security = categories.find(c => c.PQRS_category_name === 'Seguridad').PQRS_category_id;
    const noise = categories.find(c => c.PQRS_category_name === 'Queja por Ruido').PQRS_category_id;
    const general = categories.find(c => c.PQRS_category_name === 'Consulta General').PQRS_category_id;

    const pqrsRecords = [
      {
        owner: owners[0].Owner_id,
        category: maintenance,
        subject: 'Ascensor averiado en Torre A',
        description: 'El ascensor ha estado fuera de servicio durante 3 días. Se necesita reparación urgente.',
        priority: 'HIGH',
        file: null,
        answer: 'Técnico programado para mañana por la mañana.'
      },
      {
        owner: owners[1].Owner_id,
        category: security,
        subject: 'Solicitud de cámaras de seguridad adicionales',
        description: 'Me gustaría sugerir la instalación de cámaras en el parqueadero.',
        priority: 'MEDIUM',
        file: null,
        answer: null
      },
      {
        owner: owners[2].Owner_id,
        category: noise,
        subject: 'Música alta desde apartamento 302',
        description: 'Ruido excesivo durante horas de la noche los fines de semana.',
        priority: 'MEDIUM',
        file: null,
        answer: 'Se emitió advertencia al residente.'
      },
      {
        owner: owners[3].Owner_id,
        category: general,
        subject: 'Pregunta sobre cuotas de administración',
        description: 'Necesito aclaración sobre el reciente aumento de tarifas.',
        priority: 'LOW',
        file: null,
        answer: 'Se ha enviado desglose detallado a su correo.'
      },
      {
        owner: owners[4].Owner_id,
        category: maintenance,
        subject: 'Fuga de agua en apartamento',
        description: 'Hay una fuga de agua en el techo del baño.',
        priority: 'HIGH',
        file: 'foto_fuga.jpg',
        answer: null
      }
    ];

    for (const pqrs of pqrsRecords) {
      await connection.query(`
        INSERT INTO pqrs (
          Owner_FK_ID, PQRS_category_FK_ID, PQRS_subject, 
          PQRS_description, PQRS_priority, PQRS_file, PQRS_answer
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        pqrs.owner, pqrs.category, pqrs.subject,
        pqrs.description, pqrs.priority, pqrs.file, pqrs.answer
      ]);
    }
    console.log(`   ✓ ${pqrsRecords.length} registros PQRS creados`);


    return { success: true };
  } catch (error) {
    console.error('   ❌ Error sembrando PQRS:', error);
    return { success: false, error };
  } finally {
    if (connection) await connection.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedPQRSAndPayments().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}
