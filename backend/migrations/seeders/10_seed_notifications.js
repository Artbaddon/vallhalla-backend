import { createConnection } from '../dbConnection.js';

export async function seedNotifications() {
  let connection;
  
  try {
    connection = await createConnection();
    console.log('🔔 Sembrando notificaciones...');

    // Obtener IDs necesarios
    const [notificationTypes] = await connection.query('SELECT Notification_type_id, Notification_type_name FROM notification_type');
    const [users] = await connection.query('SELECT Users_id FROM users WHERE Role_FK_ID = (SELECT Role_id FROM role WHERE Role_name = "Propietario") LIMIT 5');

    const system = notificationTypes.find(t => t.Notification_type_name === 'Sistema').Notification_type_id;
    const payment = notificationTypes.find(t => t.Notification_type_name === 'Pago').Notification_type_id;
    const event = notificationTypes.find(t => t.Notification_type_name === 'Evento').Notification_type_id;
    const security = notificationTypes.find(t => t.Notification_type_name === 'Seguridad').Notification_type_id;
    const document = notificationTypes.find(t => t.Notification_type_name === 'Documento').Notification_type_id;
    const maintenance = notificationTypes.find(t => t.Notification_type_name === 'Mantenimiento').Notification_type_id;
    const reservation = notificationTypes.find(t => t.Notification_type_name === 'Reserva').Notification_type_id;

    const notifications = [
      {
        type: system,
        description: 'Mantenimiento del sistema programado para este fin de semana. Los servicios pueden no estar disponibles temporalmente.',
        user: null
      },
      {
        type: payment,
        description: 'Su pago de octubre 2025 ha sido recibido exitosamente.',
        user: users[0].Users_id
      },
      {
        type: reservation,
        description: 'Su reserva de instalaciones ha sido confirmada para el 20 de octubre.',
        user: users[0].Users_id
      },
      {
        type: document,
        description: 'Nuevo documento de normas comunitarias requiere su atención.',
        user: users[1].Users_id
      },
      {
        type: security,
        description: 'Incidente de seguridad reportado en área de parqueadero B. Por favor esté atento.',
        user: null
      },
      {
        type: event,
        description: 'Evento comunitario: ¡Fiesta de Halloween este fin de semana en el Salón de Fiestas!',
        user: null
      },
      {
        type: document,
        description: 'Las actas de la reunión anual están disponibles para revisión.',
        user: users[2].Users_id
      },
      {
        type: payment,
        description: 'Recordatorio de pago de cuota de administración: Fecha límite 15 de octubre.',
        user: users[3].Users_id
      },
      {
        type: maintenance,
        description: 'Interrupción programada del servicio de agua mañana de 9 AM a 12 PM.',
        user: null
      },
      {
        type: reservation,
        description: 'Su reserva del gimnasio para mañana ha sido cancelada por mantenimiento.',
        user: users[1].Users_id
      },
      {
        type: event,
        description: 'Reunión mensual de junta programada para el 25 de octubre a las 7 PM.',
        user: null
      },
      {
        type: payment,
        description: 'Recibo de pago de septiembre 2025 disponible en su cuenta.',
        user: users[4].Users_id
      },
      {
        type: security,
        description: 'Nuevos protocolos de seguridad implementados. Por favor revise las directrices actualizadas.',
        user: null
      },
      {
        type: maintenance,
        description: 'Mantenimiento del ascensor en Torre A completado. Servicio restablecido.',
        user: null
      }
    ];

    for (const notification of notifications) {
      await connection.query(`
        INSERT INTO notification (
          Notification_type_FK_ID, 
          Notification_description, 
          Notification_User_FK_ID
        ) VALUES (?, ?, ?)
      `, [notification.type, notification.description, notification.user]);
    }

    console.log(`   ✓ ${notifications.length} notificaciones creadas`);
    return { success: true };
  } catch (error) {
    console.error('   ❌ Error sembrando notificaciones:', error);
    return { success: false, error };
  } finally {
    if (connection) await connection.end();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedNotifications().then(result => {
    process.exit(result.success ? 0 : 1);
  });
}
