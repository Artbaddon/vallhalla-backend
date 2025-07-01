import { connect } from "./config/db/connectMysql.js";
import bcrypt from "bcrypt";

async function createTestOwner() {
  try {
    console.log('🔧 Creating test owner user...');
    
    // Check if owner test user already exists
    const [existingOwnerUser] = await connect.query('SELECT * FROM users WHERE Users_name = ?', ['testowner']);
    
    if (existingOwnerUser.length > 0) {
      console.log('✅ Owner test user already exists');
      return;
    }
    
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
    
  } catch (error) {
    console.error('❌ Error creating test owner user:', error.message);
  }
}

createTestOwner(); 