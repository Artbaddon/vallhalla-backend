import bcrypt from 'bcrypt';
import { createConnection } from './dbConnection.js';

/**
 * BASIC SEEDER - Populates essential data
 * Run this after migration to set up basic system data
 */
export async function seedBasicData() {
  let connection;

  console.log('🌱 Iniciando sembrado de datos básicos...\n');

  try {
    connection = await createConnection();
    console.log('✅ Conectado a la base de datos');

    // 1. SEED ROLES
    console.log('\n📝 Sembrando roles...');
    await connection.query(`
      INSERT INTO role (Role_name, Role_description) VALUES
        ('Administrador', 'Administrador del sistema con acceso completo'),
        ('Propietario', 'Propietario con privilegios de residente'),
        ('Seguridad', 'Personal de seguridad con privilegios de guardia')
      ON DUPLICATE KEY UPDATE Role_description = VALUES(Role_description)
    `);
    console.log('   ✓ Roles creados');

    // 2. SEED USER STATUSES
    console.log('\n📝 Sembrando estados de usuario...');
    await connection.query(`
      INSERT INTO user_status (User_status_name) VALUES
        ('Activo'),
        ('Inactivo'),
        ('Pendiente'),
        ('Bloqueado')
      ON DUPLICATE KEY UPDATE User_status_name = VALUES(User_status_name)
    `);
    console.log('   ✓ Estados de usuario creados');

    // 3. SEED APARTMENT STATUSES
    console.log('\n📝 Sembrando estados de apartamento...');
    await connection.query(`
      INSERT INTO apartment_status (Apartment_status_name) VALUES
        ('Disponible'),
        ('Ocupado'),
        ('En Mantenimiento')
      ON DUPLICATE KEY UPDATE Apartment_status_name = VALUES(Apartment_status_name)
    `);
    console.log('   ✓ Estados de apartamento creados');

    // 4. SEED PARKING STATUSES
    console.log('\n📝 Sembrando estados de parqueadero...');
    await connection.query(`
      INSERT INTO parking_status (Parking_status_name) VALUES
        ('Disponible'),
        ('Ocupado'),
        ('Reservado')
      ON DUPLICATE KEY UPDATE Parking_status_name = VALUES(Parking_status_name)
    `);
    console.log('   ✓ Estados de parqueadero creados');

    // 5. SEED PARKING TYPES
    console.log('\n📝 Sembrando tipos de parqueadero...');
    await connection.query(`
      INSERT INTO parking_type (Parking_type_name) VALUES
        ('Regular'),
        ('Visitante'),
        ('Discapacitado')
      ON DUPLICATE KEY UPDATE Parking_type_name = VALUES(Parking_type_name)
    `);
    console.log('   ✓ Tipos de parqueadero creados');

    // 6. SEED RESERVATION STATUSES
    console.log('\n📝 Sembrando estados de reserva...');
    await connection.query(`
      INSERT INTO reservation_status (Reservation_status_name) VALUES
        ('Pendiente'),
        ('Confirmada'),
        ('Completada'),
        ('Cancelada'),
        ('No Asistió')
      ON DUPLICATE KEY UPDATE Reservation_status_name = VALUES(Reservation_status_name)
    `);
    console.log('   ✓ Estados de reserva creados');

    // 7. SEED RESERVATION TYPES
    console.log('\n📝 Sembrando tipos de reserva...');
    await connection.query(`
      INSERT INTO reservation_type (Reservation_type_name) VALUES
        ('Habitación'),
        ('Parqueadero'),
        ('Gimnasio'),
        ('Salón Comunal'),
        ('Instalación Deportiva')
      ON DUPLICATE KEY UPDATE Reservation_type_name = VALUES(Reservation_type_name)
    `);
    console.log('   ✓ Tipos de reserva creados');

    // 8. SEED PAYMENT STATUSES
    console.log('\n📝 Sembrando estados de pago...');
    await connection.query(`
      INSERT INTO payment_status (Payment_status_name) VALUES
        ('Pendiente'),
        ('Procesando'),
        ('Completado'),
        ('Fallido')
      ON DUPLICATE KEY UPDATE Payment_status_name = VALUES(Payment_status_name)
    `);
    console.log('   ✓ Estados de pago creados');

    // 9. SEED NOTIFICATION TYPES
    console.log('\n📝 Sembrando tipos de notificación...');
    await connection.query(`
      INSERT INTO notification_type (Notification_type_name) VALUES
        ('Sistema'),
        ('Pago'),
        ('Evento'),
        ('Seguridad'),
        ('Documento'),
        ('Mantenimiento'),
        ('Reserva'),
        ('PQRS')
      ON DUPLICATE KEY UPDATE Notification_type_name = VALUES(Notification_type_name)
    `);
    console.log('   ✓ Tipos de notificación creados');

    // 10. SEED PQRS CATEGORIES
    console.log('\n📝 Sembrando categorías PQRS...');
    await connection.query(`
      INSERT INTO pqrs_category (PQRS_category_name) VALUES
        ('Mantenimiento'),
        ('Seguridad'),
        ('Queja por Ruido'),
        ('Consulta General'),
        ('Documentación'),
        ('Plomería'),
        ('Parqueadero'),
        ('Instalaciones'),
        ('Administrativo')
      ON DUPLICATE KEY UPDATE PQRS_category_name = VALUES(PQRS_category_name)
    `);
    console.log('   ✓ Categorías PQRS creadas');

    // 11. SEED PQRS TRACKING STATUSES
    console.log('\n📝 Sembrando estados de seguimiento PQRS...');
    await connection.query(`
      INSERT INTO pqrs_tracking_status (PQRS_tracking_status_name) VALUES
        ('Abierto'),
        ('En Progreso'),
        ('Resuelto'),
        ('Cerrado')
      ON DUPLICATE KEY UPDATE PQRS_tracking_status_name = VALUES(PQRS_tracking_status_name)
    `);
    console.log('   ✓ Estados de seguimiento PQRS creados');

    // 12. SEED QUESTION TYPES
    console.log('\n📝 Sembrando tipos de pregunta...');
    await connection.query(`
      INSERT INTO question_type (Question_type_name, Question_type_description) VALUES
        ('texto', 'Pregunta de respuesta de texto libre'),
        ('opcion_multiple', 'Pregunta de opción múltiple con una sola respuesta'),
        ('casilla_verificacion', 'Pregunta de opción múltiple con múltiples respuestas permitidas'),
        ('calificacion', 'Pregunta de escala de calificación'),
        ('fecha', 'Pregunta de entrada de fecha')
      ON DUPLICATE KEY UPDATE Question_type_description = VALUES(Question_type_description)
    `);
    console.log('   ✓ Tipos de pregunta creados');

    // 13. CREATE ADMIN USER
    console.log('\n📝 Creando usuario administrador...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Get role and status IDs
    const [roleResult] = await connection.query(
      "SELECT Role_id FROM role WHERE Role_name = 'Administrador'"
    );
    const [statusResult] = await connection.query(
      "SELECT User_status_id FROM user_status WHERE User_status_name = 'Activo'"
    );

    const adminRoleId = roleResult[0].Role_id;
    const activeStatusId = statusResult[0].User_status_id;

    await connection.query(`
      INSERT INTO users (Users_name, Users_email, Users_password, User_status_FK_ID, Role_FK_ID)
      VALUES ('admin', 'admin@vallhalla.com', ?, ?, ?)
      ON DUPLICATE KEY UPDATE Users_email = VALUES(Users_email)
    `, [hashedPassword, activeStatusId, adminRoleId]);
    console.log('   ✓ Usuario administrador creado (usuario: admin, contraseña: admin123)');

    console.log('\n✅ ¡Sembrado de datos básicos completado exitosamente!\n');
    return { success: true };

  } catch (error) {
    console.error('\n❌ El sembrado falló:', error);
    return { success: false, error };
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexión a la base de datos cerrada\n');
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedBasicData().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}
