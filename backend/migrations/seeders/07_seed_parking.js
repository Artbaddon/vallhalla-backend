import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../../../.env") });

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "vallhalladb",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
};

export async function seedParking() {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log(
      "🚗 Sembrando datos de parqueaderos y vehículos (solo owners)..."
    );

    // 1. SEMBRAR TIPOS DE VEHÍCULO (SOLO TIPOS)
    console.log("📝 Sembrando tipos de vehículo...");
    await connection.query(`
      INSERT INTO vehicle_type (Vehicle_type_name, Vehicle_type_description) VALUES
        ('Carro', 'Vehículo de 4 ruedas'),
        ('Moto', 'Motocicleta de 2 ruedas'), 
        ('Camioneta', 'Vehículo grande para carga'),
        ('Bicicleta', 'Bicicleta sin motor')
      ON DUPLICATE KEY UPDATE 
        Vehicle_type_description = VALUES(Vehicle_type_description)
    `);
    console.log("   ✓ 4 tipos de vehículo creados");

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

    // 4. SEMBRAR VEHÍCULOS (SOLO PARA OWNERS)
    console.log("\n🚘 Sembrando vehículos de owners...");

    // Obtener IDs necesarios - SOLO USUARIOS CON ROL "Propietario"
    const [vehicleTypes] = await connection.query(
      "SELECT Vehicle_type_id, Vehicle_type_name FROM vehicle_type"
    );
    const [owners] = await connection.query(`
      SELECT u.Users_id 
      FROM users u 
      JOIN role r ON u.Role_FK_ID = r.Role_id 
      WHERE r.Role_name = 'Propietario' 
      AND u.User_status_FK_ID = (SELECT User_status_id FROM user_status WHERE User_status_name = 'Activo')
      LIMIT 6
    `);

    if (owners.length === 0) {
      throw new Error("No se encontraron usuarios con rol Propietario activos");
    }

    // Mapear IDs
    const carroId = vehicleTypes.find(
      (v) => v.Vehicle_type_name === "Carro"
    ).Vehicle_type_id;
    const motoId = vehicleTypes.find(
      (v) => v.Vehicle_type_name === "Moto"
    ).Vehicle_type_id;
    const camionetaId = vehicleTypes.find(
      (v) => v.Vehicle_type_name === "Camioneta"
    ).Vehicle_type_id;
    const bicicletaId = vehicleTypes.find(
      (v) => v.Vehicle_type_name === "Bicicleta"
    ).Vehicle_type_id;

    const vehicles = [
      // Carros - Owner 1
      {
        plate: "ABC123",
        model: "Civic",
        brand: "Honda",
        color: "Rojo",
        year: 2022,
        type: carroId,
        user: owners[0].Users_id,
      },
      {
        plate: "XYZ789",
        model: "Corolla",
        brand: "Toyota",
        color: "Azul",
        year: 2021,
        type: carroId,
        user: owners[0].Users_id,
      },

      // Motos - Owner 2
      {
        plate: "MOT001",
        model: "Ninja",
        brand: "Kawasaki",
        color: "Verde",
        year: 2023,
        type: motoId,
        user: owners[1].Users_id,
      },
      {
        plate: "MOT002",
        model: "CBR",
        brand: "Honda",
        color: "Rojo",
        year: 2022,
        type: motoId,
        user: owners[1].Users_id,
      },

      // Camionetas - Owner 3
      {
        plate: "CAM001",
        model: "Ranger",
        brand: "Ford",
        color: "Blanco",
        year: 2021,
        type: camionetaId,
        user: owners[2].Users_id,
      },
      {
        plate: "CAM002",
        model: "Hilux",
        brand: "Toyota",
        color: "Gris",
        year: 2023,
        type: camionetaId,
        user: owners[2].Users_id,
      },

      // Bicicletas - Owner 4
      {
        plate: "BIC001",
        model: "Mountain",
        brand: "Trek",
        color: "Negro",
        year: 2024,
        type: bicicletaId,
        user: owners[3].Users_id,
      },
      {
        plate: "BIC002",
        model: "Urban",
        brand: "Specialized",
        color: "Azul",
        year: 2023,
        type: bicicletaId,
        user: owners[3].Users_id,
      },

      // Más vehículos - Owner 5
      {
        plate: "DEF456",
        model: "Accord",
        brand: "Honda",
        color: "Plateado",
        year: 2020,
        type: carroId,
        user: owners[4].Users_id,
      },
      {
        plate: "MOT003",
        model: "YZF",
        brand: "Yamaha",
        color: "Azul",
        year: 2022,
        type: motoId,
        user: owners[4].Users_id,
      },
    ];

    for (const vehicle of vehicles) {
      await connection.query(
        `
        INSERT INTO vehicles (
          Vehicle_type_FK_ID, User_FK_ID, vehicle_plate, vehicle_model, 
          vehicle_brand, vehicle_color, vehicle_year
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          vehicle_model = VALUES(vehicle_model),
          vehicle_brand = VALUES(vehicle_brand),
          vehicle_color = VALUES(vehicle_color)
      `,
        [
          vehicle.type,
          vehicle.user,
          vehicle.plate,
          vehicle.model,
          vehicle.brand,
          vehicle.color,
          vehicle.year,
        ]
      );
    }
    console.log(`   ✓ ${vehicles.length} vehículos de owners creados`);

    // 5. SEMBRAR ESPACIOS DE PARQUEADERO (SOLO VISITANTES Y RESIDENTES)
    console.log("\n🚀 Sembrando espacios de parqueadero...");

    // Obtener IDs necesarios
    const [parkingStatuses] = await connection.query(
      "SELECT Parking_status_id, Parking_status_name FROM parking_status"
    );
    const [parkingTypes] = await connection.query(
      "SELECT Parking_type_id, Parking_type_name FROM parking_type"
    );
    const [vehiclesData] = await connection.query(
      "SELECT Vehicle_id, Vehicle_type_FK_ID, User_FK_ID FROM vehicles"
    );

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

    // Encontrar vehículos específicos para asignar (solo de owners)
    const carroOwner1 = vehiclesData.find(
      (v) =>
        v.Vehicle_type_FK_ID === carroId && v.User_FK_ID === owners[0].Users_id
    );
    const motoOwner2 = vehiclesData.find(
      (v) =>
        v.Vehicle_type_FK_ID === motoId && v.User_FK_ID === owners[1].Users_id
    );
    const carroOwner5 = vehiclesData.find(
      (v) =>
        v.Vehicle_type_FK_ID === carroId && v.User_FK_ID === owners[4].Users_id
    );

    const parkingSpots = [
      // RESIDENTES - Carros (algunos ocupados por owners)
      {
        num: "R001",
        status: disponibleId,
        vehicleType: carroId,
        vehicleId: null,
        type: residenteId,
        user: null,
      },
      {
        num: "R002",
        status: ocupadoId,
        vehicleType: carroId,
        vehicleId: carroOwner1?.Vehicle_id,
        type: residenteId,
        user: owners[0].Users_id,
      },
      {
        num: "R003",
        status: disponibleId,
        vehicleType: carroId,
        vehicleId: null,
        type: residenteId,
        user: null,
      },
      {
        num: "R004",
        status: ocupadoId,
        vehicleType: carroId,
        vehicleId: carroOwner5?.Vehicle_id,
        type: residenteId,
        user: owners[4].Users_id,
      },
      {
        num: "R005",
        status: disponibleId,
        vehicleType: carroId,
        vehicleId: null,
        type: residenteId,
        user: null,
      },

      // RESIDENTES - Motos (algunas ocupadas por owners)
      {
        num: "RM01",
        status: disponibleId,
        vehicleType: motoId,
        vehicleId: null,
        type: residenteId,
        user: null,
      },
      {
        num: "RM02",
        status: ocupadoId,
        vehicleType: motoId,
        vehicleId: motoOwner2?.Vehicle_id,
        type: residenteId,
        user: owners[1].Users_id,
      },
      {
        num: "RM03",
        status: disponibleId,
        vehicleType: motoId,
        vehicleId: null,
        type: residenteId,
        user: null,
      },
      {
        num: "RM04",
        status: disponibleId,
        vehicleType: motoId,
        vehicleId: null,
        type: residenteId,
        user: null,
      },

      // RESIDENTES - Camionetas
      {
        num: "RC01",
        status: disponibleId,
        vehicleType: camionetaId,
        vehicleId: null,
        type: residenteId,
        user: null,
      },
      {
        num: "RC02",
        status: disponibleId,
        vehicleType: camionetaId,
        vehicleId: null,
        type: residenteId,
        user: null,
      },

      // RESIDENTES - Bicicletas
      {
        num: "RB01",
        status: disponibleId,
        vehicleType: bicicletaId,
        vehicleId: null,
        type: residenteId,
        user: null,
      },
      {
        num: "RB02",
        status: disponibleId,
        vehicleType: bicicletaId,
        vehicleId: null,
        type: residenteId,
        user: null,
      },

      // VISITANTES - Carros (siempre disponibles)
      {
        num: "V01",
        status: disponibleId,
        vehicleType: carroId,
        vehicleId: null,
        type: visitanteId,
        user: null,
      },
      {
        num: "V02",
        status: disponibleId,
        vehicleType: carroId,
        vehicleId: null,
        type: visitanteId,
        user: null,
      },
      {
        num: "V03",
        status: disponibleId,
        vehicleType: carroId,
        vehicleId: null,
        type: visitanteId,
        user: null,
      },
      {
        num: "V04",
        status: disponibleId,
        vehicleType: carroId,
        vehicleId: null,
        type: visitanteId,
        user: null,
      },
    ];

    for (const spot of parkingSpots) {
      await connection.query(
        `
        INSERT INTO parking (
          Parking_number, Parking_status_ID_FK, Vehicle_type_ID_FK, 
          Vehicle_ID_FK, Parking_type_ID_FK, User_ID_FK
        ) VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          Parking_status_ID_FK = VALUES(Parking_status_ID_FK),
          Vehicle_type_ID_FK = VALUES(Vehicle_type_ID_FK),
          Vehicle_ID_FK = VALUES(Vehicle_ID_FK),
          Parking_type_ID_FK = VALUES(Parking_type_ID_FK),
          User_ID_FK = VALUES(User_ID_FK)
      `,
        [
          spot.num,
          spot.status,
          spot.vehicleType,
          spot.vehicleId,
          spot.type,
          spot.user,
        ]
      );
    }
    console.log(`   ✓ ${parkingSpots.length} espacios de parqueadero creados`);

    console.log("\n🎉 ¡Seed de parqueaderos completado exitosamente!");
    console.log("\n📊 Resumen:");
    console.log("   • 🚗 4 tipos de vehículo");
    console.log("   • 📊 4 estados de parqueadero");
    console.log("   • 🅿️ 2 tipos de parqueadero (Residente y Visitante)");
    console.log("   • 🚘 10 vehículos de owners creados");
    console.log("   • 🚀 16 espacios de parqueadero creados");
    console.log("     - 8 Residentes (carros, motos, camionetas, bicicletas)");
    console.log("     - 4 Visitantes (carros)");
    console.log(
      '   • 👥 Solo usuarios con rol "Propietario" tienen vehículos y parqueaderos asignados'
    );

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