import 'dotenv/config';
import { runConsolidatedMigration } from './migration_consolidated.js';
import { cleanupOldRBAC } from './cleanup_old_rbac.js';
import { createConnection, dbConfig } from './dbConnection.js';

async function checkDatabaseExists() {
  let connection;
  try {
    connection = await createConnection({ database: null });

    const [databases] = await connection.query(
      `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?`,
      [dbConfig.database]
    );

    return databases.length > 0;
  } catch (error) {
    console.error('Error checking database:', error);
    return false;
  } finally {
    if (connection) await connection.end();
  }
}

async function runMigrations() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🏗️  VALLHALLA DATABASE MIGRATION');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Check if database exists
    const dbExists = await checkDatabaseExists();

    if (dbExists) {
      console.log('⚠️  Database already exists!');
      console.log('   This will DROP and RECREATE the database.');
      console.log('   All existing data will be lost!\n');

      // Optional: Check for old RBAC tables before full migration
      console.log('🔍 Checking for old RBAC structure...');
      const cleanupResult = await cleanupOldRBAC();

      if (cleanupResult.success && cleanupResult.tablesRemoved > 0) {
        console.log('✅ Old RBAC tables cleaned up successfully\n');
      }
    }

    // Run consolidated migration
    console.log('═══════════════════════════════════════════════════════');
    console.log('📦 RUNNING CONSOLIDATED MIGRATION');
    console.log('═══════════════════════════════════════════════════════\n');

    const result = await runConsolidatedMigration();

    if (result.success) {
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('✅ MIGRATION COMPLETED SUCCESSFULLY!');
      console.log('═══════════════════════════════════════════════════════\n');
      console.log('📝 Next steps:');
      console.log('   1. Run seeders to populate initial data');
      console.log('   2. Create an admin user');
      console.log('   3. Start your application\n');
      process.exit(0);
    } else {
      console.error('\n❌ Migration failed:', result.error);
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Unexpected error during migration:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations();