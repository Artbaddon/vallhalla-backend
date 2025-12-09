import { createConnection } from '../dbConnection.js';

export async function seedServicePricing() {
  let connection;

  try {
    connection = await createConnection();
    console.log("💰 Sembrando precios de servicios...");

    // Primero obtener los IDs de las tablas relacionadas
    const [reservationTypes] = await connection.query(
      "SELECT * FROM reservation_type"
    );
    const [vehicleTypes] = await connection.query("SELECT * FROM vehicle_type");

    // Mapear nombres a IDs
    const reservationTypeMap = {};
    const vehicleTypeMap = {};

    reservationTypes.forEach((rt) => {
      reservationTypeMap[rt.Reservation_type_name] = rt.Reservation_type_id;
    });

    vehicleTypes.forEach((vt) => {
      vehicleTypeMap[vt.Vehicle_type_name] = vt.Vehicle_type_id;
    });

    // Datos de tarifas SIMPLIFICADOS
    const pricingData = [
      // PARQUEADEROS (solo por tipo de vehículo - por día)
      {
        vehicle_type_id: vehicleTypeMap["Carro"],
        pricing_model: "per_day",
        base_price: 20000.0,
      },
      {
        vehicle_type_id: vehicleTypeMap["Moto"],
        pricing_model: "per_day",
        base_price: 8000.0,
      },
      {
        vehicle_type_id: vehicleTypeMap["Camioneta"],
        pricing_model: "per_day",
        base_price: 25000.0,
      },
      {
        vehicle_type_id: vehicleTypeMap["Bicicleta"],
        pricing_model: "per_day",
        base_price: 0.0, // Gratis
      },

      // ÁREAS COMUNES (solo por tipo de reserva - por hora)
      {
        reservation_type_id: reservationTypeMap["Salón Comunal"],
        pricing_model: "per_hour",
        base_price: 25000.0,
      },
      {
        reservation_type_id: reservationTypeMap["Zona BBQ"],
        pricing_model: "per_hour",
        base_price: 15000.0,
      },
      {
        reservation_type_id: reservationTypeMap["Cancha Deportiva"],
        pricing_model: "per_hour",
        base_price: 10000.0,
      },
      {
        reservation_type_id: reservationTypeMap["Gimnasio"],
        pricing_model: "per_hour",
        base_price: 8000.0,
      },
      {
        reservation_type_id: reservationTypeMap["Piscina"],
        pricing_model: "per_hour",
        base_price: 12000.0,
      },
    ];

    let insertedCount = 0;
    let updatedCount = 0;

    for (const pricing of pricingData) {
      try {
        const [result] = await connection.query(
          `
          INSERT INTO service_pricing 
          (reservation_type_id, vehicle_type_id, pricing_model, base_price)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            base_price = VALUES(base_price),
            pricing_model = VALUES(pricing_model),
            updated_at = CURRENT_TIMESTAMP
        `,
          [
            pricing.reservation_type_id || null,
            pricing.vehicle_type_id || null,
            pricing.pricing_model,
            pricing.base_price,
          ]
        );

        if (result.affectedRows === 1) {
          insertedCount++;
        } else if (result.affectedRows === 2) {
          updatedCount++;
        }
      } catch (error) {
        console.error(`   ❌ Error insertando tarifa:`, error.message);
      }
    }

    console.log(`   ✓ ${insertedCount} tarifas nuevas insertadas`);
    console.log(`   ✓ ${updatedCount} tarifas existentes actualizadas`);
    console.log(`   📊 Total: ${pricingData.length} tarifas procesadas`);

    // Verificar datos insertados
    const [vehiclePricing] = await connection.query(`
      SELECT 
        vt.Vehicle_type_name,
        sp.pricing_model,
        COUNT(*) as count,
        CONCAT('$', FORMAT(SUM(base_price), 2)) as total_base_value
      FROM service_pricing sp
      INNER JOIN vehicle_type vt ON sp.vehicle_type_id = vt.Vehicle_type_id
      WHERE sp.vehicle_type_id IS NOT NULL
      GROUP BY vt.Vehicle_type_name, sp.pricing_model
    `);

    const [reservationPricing] = await connection.query(`
      SELECT 
        rt.Reservation_type_name,
        sp.pricing_model,
        COUNT(*) as count,
        CONCAT('$', FORMAT(SUM(base_price), 2)) as total_base_value
      FROM service_pricing sp
      INNER JOIN reservation_type rt ON sp.reservation_type_id = rt.Reservation_type_id
      WHERE sp.reservation_type_id IS NOT NULL
      GROUP BY rt.Reservation_type_name, sp.pricing_model
    `);

    console.log("\n   📈 Resumen de tarifas:");

    console.log("   🚗 Parqueaderos (por vehículo):");
    vehiclePricing.forEach((row) => {
      console.log(
        `      ${row.Vehicle_type_name} (${row.pricing_model}): ${row.count} tarifa - ${row.total_base_value}`
      );
    });

    console.log("   🏠 Áreas Comunes:");
    reservationPricing.forEach((row) => {
      console.log(
        `      ${row.Reservation_type_name} (${row.pricing_model}): ${row.count} tarifa - ${row.total_base_value}`
      );
    });

    return {
      success: true,
      stats: {
        total: pricingData.length,
        inserted: insertedCount,
        updated: updatedCount,
        vehicle_pricing: vehiclePricing.length,
        reservation_pricing: reservationPricing.length,
      },
    };
  } catch (error) {
    console.error("   ❌ Error sembrando tarifas de servicios:", error);
    return { success: false, error };
  } finally {
    if (connection) await connection.end();
  }
}

// Ejecutar directamente si es llamado desde la línea de comandos
if (import.meta.url === `file://${process.argv[1]}`) {
  seedServicePricing().then((result) => {
    if (result.success) {
      console.log("\n🎉 Seeder de tarifas completado exitosamente!");
      console.log(`📊 Estadísticas:`, result.stats);
    } else {
      console.error("\n💥 Seeder de tarifas falló:", result.error);
    }
    process.exit(result.success ? 0 : 1);
  });
}