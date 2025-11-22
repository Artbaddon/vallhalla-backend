import 'dotenv/config';
import { seedBasicData } from './seed_basic_data.js';
import { seedTowers } from './seeders/01_seed_towers.js';
import { seedUsers } from './seeders/02_seed_users.js';
import { seedProfiles } from './seeders/03_seed_profiles.js';
import { seedOwnersAndGuards } from './seeders/04_seed_owners_guards.js';
import { seedApartments } from './seeders/05_seed_apartments.js';
import { seedReservations } from './seeders/06_seed_facilities_reservations.js';
import { seedParking } from './seeders/07_seed_parking.js';
import { seedPQRSAndPayments } from './seeders/08_seed_pqrs_payments.js';
import { seedSurveysAndVisitors } from './seeders/09_seed_surveys_visitors.js';
import { seedNotifications } from './seeders/10_seed_notifications.js';
import { seedServicePricing } from './seeders/11_seed_service_pricing.js';

async function runAllSeeders() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🌱 SEMBRADORES DE BASE DE DATOS VALLHALLA');
  console.log('═══════════════════════════════════════════════════════\n');

  const startTime = Date.now();
  let successCount = 0;
  let failCount = 0;

  const seeders = [
    { name: 'Datos Básicos (Tablas de Referencia)', fn: seedBasicData },
    { name: 'Torres', fn: seedTowers },
    { name: 'Usuarios', fn: seedUsers },
    { name: 'Perfiles', fn: seedProfiles },
    { name: 'Propietarios y Guardias', fn: seedOwnersAndGuards },
    { name: 'Apartamentos', fn: seedApartments },
    { name: 'Reservas', fn: seedReservations },
    { name: 'Parqueaderos y Mascotas', fn: seedParking },
    { name: 'PQRS y Pagos', fn: seedPQRSAndPayments },
    { name: 'Encuestas y Visitantes', fn: seedSurveysAndVisitors },
    { name: 'Notificaciones', fn: seedNotifications },
    { name: 'Precios de servicio', fn: seedServicePricing }
  ];

  for (const seeder of seeders) {
    try {
      const result = await seeder.fn();
      if (result.success) {
        successCount++;
      } else {
        failCount++;
        console.error(`\n❌ ${seeder.name} seeder failed:`, result.error);
      }
    } catch (error) {
      failCount++;
      console.error(`\n❌ ${seeder.name} seeder threw error:`, error);
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 RESUMEN DE SEMBRADO');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`✅ Exitosos: ${successCount}/${seeders.length}`);
  console.log(`❌ Fallidos: ${failCount}/${seeders.length}`);
  console.log(`⏱️  Duración: ${duration}s`);
  console.log('═══════════════════════════════════════════════════════\n');

  if (failCount === 0) {
    console.log('🎉 ¡Todos los sembradores completados exitosamente!\n');
    console.log('📝 Credenciales de Prueba (todas las contraseñas: password123):');
    console.log('   Admin:      usuario: admin');
    console.log('   Propietario: usuario: testowner, owner2, owner3');
    console.log('   Seguridad:  usuario: testsecurity, guard1, guard2');
    console.log('\n💾 ¡Base de datos poblada con más de 150 registros de prueba!');
    console.log('   ¡Lista para comenzar a probar tu API! 🚀\n');
    process.exit(0);
  } else {
    console.log('⚠️  Algunos sembradores fallaron. Por favor revisa los errores anteriores.\n');
    process.exit(1);
  }
}

// Run all seeders
runAllSeeders();
