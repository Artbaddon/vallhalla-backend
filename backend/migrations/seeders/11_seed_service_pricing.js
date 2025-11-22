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

export async function seedServicePricing() {
  let connection;

  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("💰 Sembrando tarifas de servicios...");

    // Datos de tarifas
    const pricingData = [
      // PARQUEADEROS (generalmente por día)
      {
        service_type: "parking_rental",
        name: "Parqueadero Residente",
        base_price: 5000.0,
        pricing_model: "per_day",
        is_active: true,
      },
      {
        service_type: "parking_rental",
        name: "Parqueadero Visitante",
        base_price: 10000.0,
        pricing_model: "per_day",
        is_active: true,
      },
      {
        service_type: "parking_rental",
        name: "Parqueadero Discapacitado",
        base_price: 3000.0,
        pricing_model: "per_day",
        is_active: true,
      },

      // ZONAS COMUNES (por horas o tarifa fija)
      {
        service_type: "common_area",
        name: "Zona BBQ",
        base_price: 25000.0,
        pricing_model: "per_hour",
        is_active: true,
      },
      {
        service_type: "common_area",
        name: "Salón Comunal",
        base_price: 50000.0,
        pricing_model: "per_hour",
        is_active: true,
      },
      {
        service_type: "common_area",
        name: "Cancha Deportiva",
        base_price: 15000.0,
        pricing_model: "per_hour",
        is_active: true,
      },
      {
        service_type: "common_area",
        name: "Piscina (Acceso Diario)",
        base_price: 10000.0,
        pricing_model: "fixed_fee",
        is_active: true,
      },
      {
        service_type: "common_area",
        name: "Gimnasio (Acceso Diario)",
        base_price: 8000.0,
        pricing_model: "fixed_fee",
        is_active: true,
      },

      // ADMINISTRACIÓN (mensual)
      {
        service_type: "administration_fee",
        name: "Administración Mensual Residente",
        base_price: 150000.0,
        pricing_model: "per_month",
        is_active: true,
      },
      {
        service_type: "administration_fee",
        name: "Administración Mensual Visitante",
        base_price: 200000.0,
        pricing_model: "per_month",
        is_active: true,
      },
      {
        service_type: "administration_fee",
        name: "Cuota Administración Básica",
        base_price: 120000.0,
        pricing_model: "per_month",
        is_active: true,
      },

      // SERVICIOS INACTIVOS (ejemplos)
      {
        service_type: "common_area",
        name: "Sala de Cine (Fuera de Servicio)",
        base_price: 40000.0,
        pricing_model: "per_hour",
        is_active: false,
      },
      {
        service_type: "parking_rental",
        name: "Parqueadero Premium (No Disponible)",
        base_price: 15000.0,
        pricing_model: "per_day",
        is_active: false,
      },
    ];

    let insertedCount = 0;
    let updatedCount = 0;

    for (const pricing of pricingData) {
      try {
        const [result] = await connection.query(
          `
          INSERT INTO service_pricing 
          (service_type, name, base_price, pricing_model, is_active)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            base_price = VALUES(base_price),
            pricing_model = VALUES(pricing_model),
            is_active = VALUES(is_active),
            updated_at = CURRENT_TIMESTAMP
        `,
          [
            pricing.service_type,
            pricing.name,
            pricing.base_price,
            pricing.pricing_model,
            pricing.is_active,
          ]
        );

        if (result.affectedRows === 1) {
          insertedCount++;
        } else if (result.affectedRows === 2) {
          updatedCount++;
        }
      } catch (error) {
        console.error(
          `   ❌ Error insertando tarifa "${pricing.name}":`,
          error.message
        );
      }
    }

    console.log(`   ✓ ${insertedCount} tarifas nuevas insertadas`);
    console.log(`   ✓ ${updatedCount} tarifas existentes actualizadas`);
    console.log(`   📊 Total: ${pricingData.length} tarifas procesadas`);

    // Verificar datos insertados
    const [activePricing] = await connection.query(`
      SELECT 
        service_type,
        COUNT(*) as count,
        CONCAT('$', FORMAT(SUM(base_price), 2)) as total_base_value
      FROM service_pricing 
      WHERE is_active = true
      GROUP BY service_type
    `);

    console.log("\n   📈 Resumen de tarifas activas:");
    activePricing.forEach((row) => {
      console.log(
        `      ${row.service_type}: ${row.count} servicios (${row.total_base_value})`
      );
    });

    return {
      success: true,
      stats: {
        total: pricingData.length,
        inserted: insertedCount,
        updated: updatedCount,
        active: activePricing.reduce((sum, row) => sum + row.count, 0),
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