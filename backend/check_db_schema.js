import { connect } from "./config/db/connectMysql.js";

async function checkDatabaseSchema() {
  try {
    console.log('🔍 Checking database schema...');
    
    // Get all tables
    const [tables] = await connect.query('SHOW TABLES');
    console.log('📋 Tables found in database:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });
    
    // Check if users table exists (might be named differently)
    const userTables = tables.filter(table => {
      const tableName = Object.values(table)[0];
      return tableName.toLowerCase().includes('user');
    });
    
    if (userTables.length > 0) {
      console.log('\n👥 User-related tables:');
      userTables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`   - ${tableName}`);
      });
    }
    
    // Check if roles table exists
    const roleTables = tables.filter(table => {
      const tableName = Object.values(table)[0];
      return tableName.toLowerCase().includes('role');
    });
    
    if (roleTables.length > 0) {
      console.log('\n🎭 Role-related tables:');
      roleTables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`   - ${tableName}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking database schema:', error.message);
  }
}

checkDatabaseSchema(); 