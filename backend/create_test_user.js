import { connect } from "./config/db/connectMysql.js";
import bcrypt from "bcrypt";

async function createTestUser() {
  try {
    console.log('🔧 Creating test users...');
    
    // Check if admin test user already exists
    const [existingAdminUser] = await connect.query('SELECT * FROM users WHERE Users_name = ?', ['testuser']);
    
    if (existingAdminUser.length > 0) {
      console.log('✅ Admin test user already exists');
    } else {
      // Hash password
      const adminPassword = 'test123';
      const saltRounds = 10;
      const hashedAdminPassword = await bcrypt.hash(adminPassword, saltRounds);
      
      // Create admin test user
      const [adminResult] = await connect.query(
        'INSERT INTO users (Users_name, Users_password, User_status_FK_ID, Role_FK_ID, Users_createdAt, Users_updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        ['testuser', hashedAdminPassword, 1, 1] // status 1 = active, role 1 = admin
      );
      
      console.log(`✅ Admin test user created with ID: ${adminResult.insertId}`);
      console.log(`📝 Username: testuser`);
      console.log(`🔑 Password: ${adminPassword}`);
    }
    
    // Check if owner test user already exists
    const [existingOwnerUser] = await connect.query('SELECT * FROM users WHERE Users_name = ?', ['testowner']);
    
    if (existingOwnerUser.length > 0) {
      console.log('✅ Owner test user already exists');
    } else {
      // Hash password
      const ownerPassword = 'owner123';
      const saltRounds = 10;
      const hashedOwnerPassword = await bcrypt.hash(ownerPassword, saltRounds);
      
      // Create owner test user
      const [ownerResult] = await connect.query(
        'INSERT INTO users (Users_name, Users_password, User_status_FK_ID, Role_FK_ID, Users_createdAt, Users_updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
        ['testowner', hashedOwnerPassword, 1, 2] // status 1 = active, role 2 = owner
      );
      
      console.log(`✅ Owner test user created with ID: ${ownerResult.insertId}`);
      console.log(`📝 Username: testowner`);
      console.log(`🔑 Password: ${ownerPassword}`);
    }
    
  } catch (error) {
    console.error('❌ Error creating test users:', error.message);
  }
}

createTestUser();