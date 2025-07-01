import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

// Test security user
const SECURITY_USER = {
  username: 'testsecurity',
  password: '12345678'
};

// Helper function to make authenticated requests
async function authenticatedRequest(endpoint, method = 'GET', token = null, body = null) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers
  };
  
  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error(`Error making request to ${endpoint}:`, error);
    return { status: 500, error: error.message };
  }
}

// Login function
async function login(username, password) {
  const result = await authenticatedRequest('/auth/login', 'POST', null, { username, password });
  if (result.status === 200 && result.data.token) {
    return result.data.token;
  }
  return null;
}

async function runTests() {
  console.log('=== SECURITY USER TESTS ===');
  
  // Login as security
  console.log('\nLogging in as security...');
  const securityToken = await login(SECURITY_USER.username, SECURITY_USER.password);
  
  if (securityToken) {
    console.log('✅ Security login successful');
    
    // Test visitor endpoints (security should have access)
    console.log('\n--- Testing Visitor Module as Security ---');
    
    // Get all visitors
    console.log('\nGET /visitors');
    const allVisitors = await authenticatedRequest('/visitors', 'GET', securityToken);
    console.log(`Status: ${allVisitors.status}`);
    console.log(`Success: ${allVisitors.data.success}`);
    
    // Create a new visitor
    console.log('\nPOST /visitors');
    const newVisitor = {
      visitor_name: `Test Visitor ${Date.now()}`,
      visitor_document: `V-${Date.now()}`,
      visitor_host: 1,
      visitor_enter_date: new Date().toISOString()
    };
    
    const createVisitor = await authenticatedRequest('/visitors', 'POST', securityToken, newVisitor);
    console.log(`Status: ${createVisitor.status}`);
    console.log(`Success: ${createVisitor.data.success}`);
    
    // Test parking endpoints (security should have limited access)
    console.log('\n--- Testing Parking Module as Security ---');
    
    // Get all parking
    console.log('\nGET /parking');
    const allParking = await authenticatedRequest('/parking', 'GET', securityToken);
    console.log(`Status: ${allParking.status}`);
    console.log(`Success: ${allParking.data.success}`);
    
    // Test users endpoints (security should NOT have access)
    console.log('\n--- Testing Users Module as Security ---');
    
    // Get all users
    console.log('\nGET /users');
    const allUsers = await authenticatedRequest('/users', 'GET', securityToken);
    console.log(`Status: ${allUsers.status}`);
    console.log(`Success: ${allUsers.data.success}`);
    
  } else {
    console.log('❌ Security login failed');
  }
  
  console.log('\n=== ALL TESTS COMPLETED ===');
}

runTests(); 