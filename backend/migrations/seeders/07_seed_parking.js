import { createConnection } from '../dbConnection.js';

export async function seedParking() {
  let connection;

  try {
    connection = await createConnection();
    console.log(
      "🚗 Sembrando datos de parqueaderos..."
    );

    // 1. SEMBRAR TIPOS DE VEHÍCULO (SOLO TIPOS)
    console.log("📝 Sembrando tipos de vehículo...");
    await connection.query(`
      INSERT INTO vehicle_type (Vehicle_type_name) VALUES
        ('Carro'),
        ('Moto')
      ON DUPLICATE KEY UPDATE 
        Vehicle_type_name = VALUES(Vehicle_type_name)
    `);
    console.log("   ✓ 2 tipos de vehículo creados");

    // 2. SEMBRAR ESTADOS DE PARQUEADERO
    console.log("\n📊 Sembrando estados de parqueadero...");
    await connection.query(`
      INSERT INTO parking_status (Parking_status_name) VALUES
        ('Disponible'),
        ('Ocupado'),
        ('Reservado'),
        ('Mantenimiento')
      ON DUPLICATE KEY UPDATE Parking_status_name = VALUES(Parking_status_name)
    `);
    console.log("   ✓ 4 estados de parqueadero creados");

    // 3. SEMBRAR TIPOS DE PARQUEADERO (SOLO VISITANTES Y RESIDENTES)
    console.log("\n🅿️ Sembrando tipos de parqueadero...");
    await connection.query(`
      INSERT INTO parking_type (Parking_type_name) VALUES
        ('Residente'),
        ('Visitante')
      ON DUPLICATE KEY UPDATE Parking_type_name = VALUES(Parking_type_name)
    `);
    console.log("   ✓ 2 tipos de parqueadero creados");

    // 4. (OMITIDO) SEMBRAR VEHÍCULOS - La tabla vehicles no existe en la migración actual.

    // 5. SEMBRAR ESPACIOS DE PARQUEADERO (SOLO VISITANTES Y RESIDENTES)
    console.log("\n🚀 Sembrando espacios de parqueadero...");

    // Obtener IDs necesarios
    const [parkingStatuses] = await connection.query(
      "SELECT Parking_status_id, Parking_status_name FROM parking_status"
    );
    const [parkingTypes] = await connection.query(
      "SELECT Parking_type_id, Parking_type_name FROM parking_type"
    );
    const [vehicleTypes] = await connection.query(
      "SELECT Vehicle_type_id, Vehicle_type_name FROM vehicle_type"
    );
    
    // Necesitamos owners para asignar parqueaderos ocupados
    const [owners] = await connection.query(`
      SELECT u.Users_id 
      FROM users u 
      JOIN role r ON u.Role_FK_ID = r.Role_id 
      WHERE r.Role_name = 'Propietario' 
      AND u.User_status_FK_ID = (SELECT User_status_id FROM user_status WHERE User_status_name = 'Activo')
      LIMIT 6
    `);

    // Mapear IDs
    const disponibleId = parkingStatuses.find(
      (s) => s.Parking_status_name === "Disponible"
    ).Parking_status_id;
    const ocupadoId = parkingStatuses.find(
      (s) => s.Parking_status_name === "Ocupado"
    ).Parking_status_id;

    const residenteId = parkingTypes.find(
      (t) => t.Parking_type_name === "Residente"
    ).Parking_type_id;
    const visitanteId = parkingTypes.find(
      (t) => t.Parking_type_name === "Visitante"
    ).Parking_type_id;

    const carroId = vehicleTypes.find(
      (v) => v.Vehicle_type_name === "Carro"
    ).Vehicle_type_id;
    const motoId = vehicleTypes.find(
      (v) => v.Vehicle_type_name === "Moto"
    ).Vehicle_type_id;

    const parkingSpots = [
      // RESIDENTES - Carros (algunos ocupados por owners)
      {
        num: "R001",
        status: disponibleId,
        vehicleType: carroId,
        type: residenteId,
        user: null,
      },
      {
        num: "R002",
        status: ocupadoId,
        vehicleType: carroId,
        type: residenteId,
        user: owners[0] ? owners[0].Users_id : null,
      },
      {
        num: "R003",
        status: disponibleId,
        vehicleType: carroId,
        type: residenteId,
        user: null,
      },
      {
        num: "R004",
        status: ocupadoId,
        vehicleType: carroId,
        type: residenteId,
        user: owners[4] ? owners[4].Users_id : null,
      },
      {
        num: "R005",
        status: disponibleId,
        vehicleType: carroId,
        type: residenteId,
        user: null,
      },

      // RESIDENTES - Motos (algunas ocupadas por owners)
      {
        num: "RM01",
        status: disponibleId,
        vehicleType: motoId,
        type: residenteId,
        user: null,
      },
      {
        num: "RM02",
        status: ocupadoId,
        vehicleType: motoId,
        type: residenteId,
        user: owners[1] ? owners[1].Users_id : null,
      },
      {
        num: "RM03",
        status: disponibleId,
        vehicleType: motoId,
        type: residenteId,
        user: null,
      },
      {
        num: "RM04",
        status: disponibleId,
        vehicleType: motoId,
        type: residenteId,
        user: null,
      },

      // VISITANTES - Carros (siempre disponibles)
      {
        num: "V01",
        status: disponibleId,
        vehicleType: carroId,
        type: visitanteId,
        user: null,
      },
      {
        num: "V02",
        status: disponibleId,
        vehicleType: carroId,
        type: visitanteId,
        user: null,
      },
      {
        num: "V03",
        status: disponibleId,
        vehicleType: carroId,
        type: visitanteId,
        user: null,
      },
      {
        num: "V04",
        status: disponibleId,
        vehicleType: carroId,
        type: visitanteId,
        user: null,
      },
    ];

    for (const spot of parkingSpots) {
      await connection.query(
        `
        INSERT INTO parking (
          Parking_number, Parking_status_ID_FK, Vehicle_type_ID_FK, 
          Parking_type_ID_FK, User_ID_FK
        ) VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          Parking_status_ID_FK = VALUES(Parking_status_ID_FK),
          Vehicle_type_ID_FK = VALUES(Vehicle_type_ID_FK),
          Parking_type_ID_FK = VALUES(Parking_type_ID_FK),
          User_ID_FK = VALUES(User_ID_FK)
      `,
        [
          spot.num,
          spot.status,
          spot.vehicleType,
          spot.type,
          spot.user,
        ]
      );
    }
    console.log(`   ✓ ${parkingSpots.length} espacios de parqueadero creados`);

    console.log("\n🎉 ¡Seed de parqueaderos completado exitosamente!");
    console.log("\n📊 Resumen:");
    console.log("   • 🚗 2 tipos de vehículo");
    console.log("   • 📊 4 estados de parqueadero");
    console.log("   • 🅿️ 2 tipos de parqueadero (Residente y Visitante)");
    console.log("   • 🚀 16 espacios de parqueadero creados");
    console.log("     - 8 Residentes (carros, motos)");
    console.log("     - 4 Visitantes (carros)");

    return { success: true };
  } catch (error) {
    console.error("❌ Error en seed de parqueaderos:", error);
    return { success: false, error };
  } finally {
    if (connection) await connection.end();
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedParking().then((result) => {
    process.exit(result.success ? 0 : 1);
  });
}
