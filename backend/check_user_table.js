import { connect } from "./config/db/connectMysql.js";

async function checkUserTable() {
  try {
    console.log('🔍 Checking users table structure...');
    
    // Check table structure
    const [columns] = await connect.query('DESCRIBE users');
    console.log('📋 Users table columns:');
    columns.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Check if there are any users
    const [userCount] = await connect.query('SELECT COUNT(*) as count FROM users');
    console.log(`\n📊 Found ${userCount[0].count} users in database`);
    
    if (userCount[0].count > 0) {
      const [users] = await connect.query('SELECT * FROM users LIMIT 3');
      console.log('\n👥 Sample users:');
      users.forEach(user => {
        console.log(`   - ID: ${user.Users_id}, Name: ${user.Users_name}, Status: ${user.User_status_FK_ID}, Role: ${user.Role_FK_ID}`);
      });
    }
    
    // Check role table
    console.log('\n🎭 Checking role table...');
    const [roleCount] = await connect.query('SELECT COUNT(*) as count FROM role');
    console.log(`📊 Found ${roleCount[0].count} roles in database`);
    
    if (roleCount[0].count > 0) {
      const [roles] = await connect.query('SELECT * FROM role');
      console.log('\n🎭 Roles:');
      roles.forEach(role => {
        console.log(`   - ID: ${role.Role_id}, Name: ${role.Role_name}, Description: ${role.Role_description}`);
      });
    }
    
    // Check user_status table
    console.log('\n📊 Checking user_status table...');
    const [statusCount] = await connect.query('SELECT COUNT(*) as count FROM user_status');
    console.log(`📊 Found ${statusCount[0].count} user statuses in database`);
    
    if (statusCount[0].count > 0) {
      const [statuses] = await connect.query('SELECT * FROM user_status');
      console.log('\n📊 User Statuses:');
      statuses.forEach(status => {
        console.log(`   - ID: ${status.User_status_id}, Name: ${status.User_status_name}, Description: ${status.User_status_description}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking user table:', error.message);
  }
}

checkUserTable(); 