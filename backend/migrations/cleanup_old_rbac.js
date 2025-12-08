import { createConnection } from './dbConnection.js';

/**
 * CLEANUP OLD RBAC STRUCTURE
 * 
 * This script removes the old complex RBAC system that used:
 * - module
 * - module_role
 * - permissions
 * - permissions_module_role
 * 
 * These tables are being replaced with a simpler role-based system
 * where permissions are managed directly in the application code.
 */

const cleanupStatements = [
  `USE ${dbConfig.database};`,
  
  // Drop foreign key constraints first (must be done before dropping tables)
  `SET FOREIGN_KEY_CHECKS = 0;`,
  
  // Drop the old RBAC tables
  `DROP TABLE IF EXISTS permissions_module_role;`,
  `DROP TABLE IF EXISTS module_role;`,
  `DROP TABLE IF EXISTS permissions;`,
  `DROP TABLE IF EXISTS module;`,
  
  // Re-enable foreign key checks
  `SET FOREIGN_KEY_CHECKS = 1;`,
];

export async function cleanupOldRBAC() {
  let connection;

  console.log('\n🧹 Starting RBAC cleanup...');

  try {
    connection = await createConnection({ multipleStatements: true });
    console.log('✅ Connected to MySQL database');

    // Check which tables exist before cleanup
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME IN ('module', 'module_role', 'permissions', 'permissions_module_role')`
    );

    if (tables.length === 0) {
      console.log('ℹ️  No old RBAC tables found. Database is already clean.');
      return { success: true, tablesRemoved: 0 };
    }

    console.log('\n📊 Found old RBAC tables to remove:');
    tables.forEach(table => console.log(`   - ${table.TABLE_NAME}`));

    // Execute cleanup statements
    for (const sql of cleanupStatements) {
      try {
        await connection.query(sql);
      } catch (error) {
        // Ignore errors for tables that don't exist
        if (!error.message.includes("doesn't exist")) {
          console.error('⚠️  Warning:', error.message);
        }
      }
    }

    console.log('\n✅ Old RBAC structure cleaned up successfully!');
    console.log(`📊 Tables removed: ${tables.length}`);
    console.log('\n📝 Removed tables:');
    console.log('   - permissions_module_role (linking table)');
    console.log('   - module_role (linking table)');
    console.log('   - permissions (old permissions system)');
    console.log('   - module (old module system)\n');

    return { success: true, tablesRemoved: tables.length };
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    return { success: false, error };
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed\n');
    }
  }
}
