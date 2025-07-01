import { connect } from "../config/db/connectMysql.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Test users for each role
const TEST_USERS = {
  ADMIN: {
    username: 'testadmin',
    password: '12345678',
    role: 'Admin'
  },
  OWNER: {
    username: 'testowner',
    password: '12345678',
    role: 'Owner'
  },
  SECURITY: {
    username: 'testsecurity',
    password: '12345678',
    role: 'Security'
  }
};

// Test endpoints for each role
const TEST_ENDPOINTS = {
  ADMIN: [
    { method: 'GET', endpoint: '/api/users', expectedStatus: 200 },
    { method: 'POST', endpoint: '/api/users', expectedStatus: 200 },
    { method: 'GET', endpoint: '/api/owners', expectedStatus: 200 },
    { method: 'GET', endpoint: '/api/apartments', expectedStatus: 200 }
  ],
  OWNER: [
    { method: 'GET', endpoint: '/api/owners/me/profile', expectedStatus: 200 },
    { method: 'GET', endpoint: '/api/apartments', expectedStatus: 200 },
    { method: 'POST', endpoint: '/api/pets', expectedStatus: 200 },
    { method: 'GET', endpoint: '/api/users', expectedStatus: 403 } // Should be denied
  ],
  SECURITY: [
    { method: 'GET', endpoint: '/api/visitors', expectedStatus: 200 },
    { method: 'POST', endpoint: '/api/visitors', expectedStatus: 200 },
    { method: 'PUT', endpoint: '/api/visitors', expectedStatus: 200 },
    { method: 'GET', endpoint: '/api/parking', expectedStatus: 200 },
    { method: 'PUT', endpoint: '/api/parking', expectedStatus: 200 },
    { method: 'POST', endpoint: '/api/owners', expectedStatus: 403 } // Should be denied
  ]
};

async function createTestUser(userData) {
  try {
    // Check if user exists
    const [existingUser] = await connect.query(
      'SELECT Users_id FROM users WHERE Users_name = ?',
      [userData.username]
    );

    if (existingUser.length > 0) {
      console.log(`User ${userData.username} already exists`);
      return existingUser[0].Users_id;
    }

    // Get role ID
    const [role] = await connect.query(
      'SELECT Role_id FROM role WHERE Role_name = ?',
      [userData.role]
    );

    if (!role.length) {
      throw new Error(`Role ${userData.role} not found`);
    }

    // Get active status ID
    const [status] = await connect.query(
      'SELECT User_status_id FROM user_status WHERE User_status_name = ?',
      ['Active']
    );

    if (!status.length) {
      throw new Error('Active status not found');
    }

    // Create user
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [result] = await connect.query(
      'INSERT INTO users (Users_name, Users_password, User_status_FK_ID, Role_FK_ID) VALUES (?, ?, ?, ?)',
      [userData.username, hashedPassword, status[0].User_status_id, role[0].Role_id]
    );

    console.log(`Created user ${userData.username} with role ${userData.role}`);
    return result.insertId;
  } catch (error) {
    console.error(`Error creating test user ${userData.username}:`, error);
    throw error;
  }
}

async function verifyPermissions(userId, roleKey) {
  try {
    // Get user's role and create JWT token
    const [user] = await connect.query(
      `SELECT u.Users_id, u.Users_name, r.Role_id, r.Role_name 
       FROM users u 
       JOIN role r ON u.Role_FK_ID = r.Role_id 
       WHERE u.Users_id = ?`,
      [userId]
    );

    if (!user.length) {
      throw new Error('User not found');
    }

    const token = jwt.sign(
      { 
        userId: user[0].Users_id,
        username: user[0].Users_name,
        roleId: user[0].Role_id
      },
      JWT_SECRET
    );

    console.log(`\nTesting permissions for ${user[0].Users_name} (${user[0].Role_name}):`);

    // Get user's permissions from the database
    const [permissions] = await connect.query(
      `SELECT DISTINCT 
        m.module_name,
        p.Permissions_name
      FROM module_role mr
      JOIN module m ON mr.Module_FK_ID = m.module_id
      JOIN permissions_module_role pmr ON pmr.Module_role_FK_ID = mr.Module_role_id
      JOIN permissions p ON pmr.Permissions_FK_ID = p.Permissions_id
      WHERE mr.Role_FK_ID = ?`,
      [user[0].Role_id]
    );

    console.log('\nAssigned Permissions:');
    const permissionsByModule = permissions.reduce((acc, p) => {
      if (!acc[p.module_name]) {
        acc[p.module_name] = [];
      }
      acc[p.module_name].push(p.Permissions_name);
      return acc;
    }, {});

    Object.entries(permissionsByModule).forEach(([module, perms]) => {
      console.log(`${module}: ${perms.join(', ')}`);
    });

    // Test endpoints
    console.log('\nEndpoint Tests:');
    for (const test of TEST_ENDPOINTS[roleKey]) {
      const moduleName = test.endpoint.split('/')[2];
      const permissionName = {
        'GET': 'read',
        'POST': 'create',
        'PUT': 'update',
        'DELETE': 'delete'
      }[test.method];

      const hasPermission = permissions.some(p => 
        p.module_name === moduleName && 
        p.Permissions_name === permissionName
      );

      console.log(`\n${test.method} ${test.endpoint}`);
      console.log(`Expected status: ${test.expectedStatus}`);
      console.log(`Has permission: ${hasPermission}`);
      console.log(`Result: ${(hasPermission && test.expectedStatus === 200) || (!hasPermission && test.expectedStatus === 403) ? '✅ PASS' : '❌ FAIL'}`);
    }
  } catch (error) {
    console.error('Error verifying permissions:', error);
  }
}

async function runTests() {
  try {
    console.log('Starting RBAC permission tests...\n');

    // Create test users and verify their permissions
    for (const [roleKey, userData] of Object.entries(TEST_USERS)) {
      const userId = await createTestUser(userData);
      await verifyPermissions(userId, roleKey);
    }

    console.log('\nRBAC permission tests completed.');
  } catch (error) {
    console.error('Error running tests:', error);
  } finally {
    await connect.end();
  }
}

// Run the tests
runTests(); 