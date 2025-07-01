import { runMigration as runMainMigration } from './migration.js';

async function migrate() {
  try {
    console.log('Starting migration process...');
    await runMainMigration();
    console.log('All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations immediately
migrate();