import { connect } from '../config/db/connectMysql.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { hasPermission, isAdmin, ownsResource } from '../middleware/rbacConfig.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Mock request and response objects
const mockRequest = (token = '', body = {}, params = {}, user = null) => {
  return {
    headers: {
      authorization: token ? `Bearer ${token}` : '',
    },
    body,
    params,
    user,
  };
};

const mockResponse = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

// Test verifyToken middleware
const testVerifyToken = async () => {
  console.log('\n--- Testing verifyToken middleware ---');
  
  // Test with no token
  console.log('\nTest: No token provided');
  const reqNoToken = mockRequest();
  const resNoToken = mockResponse();
  let nextNoTokenCalled = false;
  const nextNoToken = () => { nextNoTokenCalled = true; };
  
  verifyToken(reqNoToken, resNoToken, nextNoToken);
  console.log('Status:', resNoToken.statusCode);
  console.log('Response:', resNoToken.body);
  console.log('Next called:', nextNoTokenCalled);
  
  // Test with invalid token
  console.log('\nTest: Invalid token');
  const reqInvalidToken = mockRequest('invalidtoken');
  const resInvalidToken = mockResponse();
  let nextInvalidTokenCalled = false;
  const nextInvalidToken = () => { nextInvalidTokenCalled = true; };
  
  verifyToken(reqInvalidToken, resInvalidToken, nextInvalidToken);
  console.log('Status:', resInvalidToken.statusCode);
  console.log('Response:', resInvalidToken.body);
  console.log('Next called:', nextInvalidTokenCalled);
  
  // Test with valid token
  console.log('\nTest: Valid token');
  // Create a valid token for testing
  const payload = {
    userId: 1,
    roleId: 1, // Admin
    email: 'admin@test.com',
  };
  
  const token = jwt.sign(payload, process.env.JWT_SECRET || 'testsecret', {
    expiresIn: '1h',
  });
  
  const reqValidToken = mockRequest(token);
  const resValidToken = mockResponse();
  let nextValidTokenCalled = false;
  const nextValidToken = () => { nextValidTokenCalled = true; };
  
  verifyToken(reqValidToken, resValidToken, nextValidToken);
  console.log('Next called:', nextValidTokenCalled);
  console.log('User in request:', reqValidToken.user);
};

// Test hasPermission function
const testHasPermission = async () => {
  console.log('\n--- Testing hasPermission function ---');
  
  // Test admin user (should have all permissions)
  const userId = 1; // Assuming user ID 1 is admin
  
  console.log('\nTest: Admin user permissions');
  console.log('Admin has users:read permission:', await hasPermission(connect, userId, 'users', 'read'));
  console.log('Admin has apartments:create permission:', await hasPermission(connect, userId, 'apartments', 'create'));
  console.log('Admin has nonexistent:action permission:', await hasPermission(connect, userId, 'nonexistent', 'action'));
  
  // Test owner user (should have limited permissions)
  const ownerId = 2; // Assuming user ID 2 is owner
  
  console.log('\nTest: Owner user permissions');
  console.log('Owner has reservations:read permission:', await hasPermission(connect, ownerId, 'reservations', 'read'));
  console.log('Owner has reservations:create permission:', await hasPermission(connect, ownerId, 'reservations', 'create'));
  console.log('Owner has users:create permission:', await hasPermission(connect, ownerId, 'users', 'create'));
};

// Test isAdmin function
const testIsAdmin = async () => {
  console.log('\n--- Testing isAdmin function ---');
  
  console.log('User with ID 1 is admin:', await isAdmin(connect, 1));
  console.log('User with ID 2 is admin:', await isAdmin(connect, 2));
};

// Test ownsResource function
const testOwnsResource = async () => {
  console.log('\n--- Testing ownsResource function ---');
  
  // Test owner accessing resources
  const ownerId = 2; // Assuming user ID 2 is owner
  
  // Test with different resource types
  console.log('\nTest: Owner resource access');
  console.log('Owner owns apartment 1:', await ownsResource(connect, ownerId, 'apartment', 1));
  console.log('Owner owns pet 1:', await ownsResource(connect, ownerId, 'pet', 1));
  console.log('Owner owns reservation 1:', await ownsResource(connect, ownerId, 'reservation', 1));
  
  // Test admin access to resources
  const adminId = 1; // Assuming user ID 1 is admin
  
  console.log('\nTest: Admin resource access');
  console.log('Admin can access apartment 1:', await ownsResource(connect, adminId, 'apartment', 1));
  console.log('Admin can access pet 1:', await ownsResource(connect, adminId, 'pet', 1));
  console.log('Admin can access reservation 1:', await ownsResource(connect, adminId, 'reservation', 1));
};

// Run all tests
const runTests = async () => {
  console.log('=== AUTH MIDDLEWARE TESTS ===');
  
  try {
    await testVerifyToken();
    await testHasPermission();
    await testIsAdmin();
    await testOwnsResource();
    
    console.log('\n=== ALL TESTS COMPLETED ===');
  } catch (error) {
    console.error('Error running tests:', error);
  } finally {
    // Close database connection
    await connect.end();
  }
};

runTests(); 