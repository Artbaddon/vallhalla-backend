import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:3000/api';

// Test users
const ADMIN_USER = {
  username: 'testadmin',
  password: '12345678',
  email: 'admin@test.com'
};

const OWNER_USER = {
  username: 'testowner',
  password: '12345678',
  email: 'owner@test.com'
};

const SECURITY_USER = {
  username: 'testsecurity',
  password: '12345678',
  email: 'security@test.com'
};

// Store tokens
let adminToken = '';
let ownerToken = '';
let securityToken = '';
let securityToken = '';

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

// Test functions for each module
async function testUsersModule(role, token) {
  console.log(`\n--- Testing Users Module as ${role} ---`);
  
  // Get all users
  console.log('\nGET /users');
  const allUsers = await authenticatedRequest('/users', 'GET', token);
  console.log(`Status: ${allUsers.status}`);
  console.log(`Success: ${allUsers.data.success}`);
  console.log(`Count: ${allUsers.data.count || 0}`);
  
  // Get user profile
  console.log('\nGET /users/me/profile');
  const profile = await authenticatedRequest('/users/me/profile', 'GET', token);
  console.log(`Status: ${profile.status}`);
  console.log(`Success: ${profile.data.success}`);
  
  if (role === 'Admin') {
    // Create a new user (admin only)
    console.log('\nPOST /users');
    const newUser = {
      username: `testuser_${Date.now()}`,
      password: 'test123',
      email: `test${Date.now()}@example.com`,
      user_status_id: 1,
      role_id: 3
    };
    
    const createUser = await authenticatedRequest('/users', 'POST', token, newUser);
    console.log(`Status: ${createUser.status}`);
    console.log(`Success: ${createUser.data.success}`);
    
    if (createUser.data.success) {
      const userId = createUser.data.data.id;
      
      // Update user
      console.log(`\nPUT /users/${userId}`);
      const updateUser = await authenticatedRequest(`/users/${userId}`, 'PUT', token, {
        email: `updated${Date.now()}@example.com`
      });
      console.log(`Status: ${updateUser.status}`);
      console.log(`Success: ${updateUser.data.success}`);
      
      // Delete user
      console.log(`\nDELETE /users/${userId}`);
      const deleteUser = await authenticatedRequest(`/users/${userId}`, 'DELETE', token);
      console.log(`Status: ${deleteUser.status}`);
      console.log(`Success: ${deleteUser.data.success}`);
    }
  }
}

async function testReservationsModule(role, token) {
  console.log(`\n--- Testing Reservations Module as ${role} ---`);
  
  // Get all reservations
  console.log('\nGET /reservations');
  const allReservations = await authenticatedRequest('/reservations', 'GET', token);
  console.log(`Status: ${allReservations.status}`);
  console.log(`Success: ${allReservations.data.success}`);
  console.log(`Count: ${allReservations.data.count || 0}`);
  
  // Create a new reservation
  console.log('\nPOST /reservations');
  const newReservation = {
    reservation_date: new Date().toISOString().split('T')[0],
    reservation_start_time: '10:00:00',
    reservation_end_time: '12:00:00',
    reservation_type_id: 1,
    owner_id: 1,
    notes: 'Test reservation'
  };
  
  const createReservation = await authenticatedRequest('/reservations', 'POST', token, newReservation);
  console.log(`Status: ${createReservation.status}`);
  console.log(`Success: ${createReservation.data.success}`);
  
  if (createReservation.data.success) {
    const reservationId = createReservation.data.data.id;
    
    // Get specific reservation
    console.log(`\nGET /reservations/${reservationId}`);
    const getReservation = await authenticatedRequest(`/reservations/${reservationId}`, 'GET', token);
    console.log(`Status: ${getReservation.status}`);
    console.log(`Success: ${getReservation.data.success}`);
    
    // Update reservation
    console.log(`\nPUT /reservations/${reservationId}`);
    const updateReservation = await authenticatedRequest(`/reservations/${reservationId}`, 'PUT', token, {
      notes: 'Updated test reservation'
    });
    console.log(`Status: ${updateReservation.status}`);
    console.log(`Success: ${updateReservation.data.success}`);
    
    if (role === 'Admin') {
      // Delete reservation (admin only)
      console.log(`\nDELETE /reservations/${reservationId}`);
      const deleteReservation = await authenticatedRequest(`/reservations/${reservationId}`, 'DELETE', token);
      console.log(`Status: ${deleteReservation.status}`);
      console.log(`Success: ${deleteReservation.data.success}`);
    }
  }
}

async function testPetsModule(role, token) {
  console.log(`\n--- Testing Pets Module as ${role} ---`);
  
  // Get all pets
  console.log('\nGET /pets');
  const allPets = await authenticatedRequest('/pets', 'GET', token);
  console.log(`Status: ${allPets.status}`);
  console.log(`Success: ${allPets.data.success}`);
  console.log(`Count: ${allPets.data.count || 0}`);
  
  // Create a new pet
  console.log('\nPOST /pets');
  const newPet = {
    pet_name: `Test Pet ${Date.now()}`,
    pet_type: 'Dog',
    pet_breed: 'Mixed',
    pet_color: 'Brown',
    pet_age: 3,
    owner_id: 1
  };
  
  const createPet = await authenticatedRequest('/pets', 'POST', token, newPet);
  console.log(`Status: ${createPet.status}`);
  console.log(`Success: ${createPet.data.success}`);
  
  if (createPet.data.success) {
    const petId = createPet.data.data.id;
    
    // Get specific pet
    console.log(`\nGET /pets/${petId}`);
    const getPet = await authenticatedRequest(`/pets/${petId}`, 'GET', token);
    console.log(`Status: ${getPet.status}`);
    console.log(`Success: ${getPet.data.success}`);
    
    // Update pet
    console.log(`\nPUT /pets/${petId}`);
    const updatePet = await authenticatedRequest(`/pets/${petId}`, 'PUT', token, {
      pet_name: `Updated Pet ${Date.now()}`
    });
    console.log(`Status: ${updatePet.status}`);
    console.log(`Success: ${updatePet.data.success}`);
    
    // Delete pet
    console.log(`\nDELETE /pets/${petId}`);
    const deletePet = await authenticatedRequest(`/pets/${petId}`, 'DELETE', token);
    console.log(`Status: ${deletePet.status}`);
    console.log(`Success: ${deletePet.data.success}`);
  }
}

async function testPaymentsModule(role, token) {
  console.log(`\n--- Testing Payments Module as ${role} ---`);
  
  // Get all payments
  console.log('\nGET /payments');
  const allPayments = await authenticatedRequest('/payments', 'GET', token);
  console.log(`Status: ${allPayments.status}`);
  console.log(`Success: ${allPayments.data.success}`);
  console.log(`Count: ${allPayments.data.count || 0}`);
  
  // Create a new payment
  console.log('\nPOST /payments');
  const newPayment = {
    total_payment: 100.00,
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'Credit Card',
    reference_number: `REF-${Date.now()}`,
    owner_id: 1
  };
  
  const createPayment = await authenticatedRequest('/payments', 'POST', token, newPayment);
  console.log(`Status: ${createPayment.status}`);
  console.log(`Success: ${createPayment.data.success}`);
  
  if (createPayment.data.success && role === 'Admin') {
    const paymentId = createPayment.data.data.id;
    
    // Get specific payment
    console.log(`\nGET /payments/${paymentId}`);
    const getPayment = await authenticatedRequest(`/payments/${paymentId}`, 'GET', token);
    console.log(`Status: ${getPayment.status}`);
    console.log(`Success: ${getPayment.data.success}`);
    
    // Update payment (admin only)
    console.log(`\nPUT /payments/${paymentId}`);
    const updatePayment = await authenticatedRequest(`/payments/${paymentId}`, 'PUT', token, {
      total_payment: 150.00
    });
    console.log(`Status: ${updatePayment.status}`);
    console.log(`Success: ${updatePayment.data.success}`);
    
    // Delete payment (admin only)
    console.log(`\nDELETE /payments/${paymentId}`);
    const deletePayment = await authenticatedRequest(`/payments/${paymentId}`, 'DELETE', token);
    console.log(`Status: ${deletePayment.status}`);
    console.log(`Success: ${deletePayment.data.success}`);
  }
}

// Main test function
async function runTests() {
  console.log('=== API ENDPOINT TESTS ===');
  
  // Login as admin
  console.log('\nLogging in as admin...');
  adminToken = await login(ADMIN_USER.username, ADMIN_USER.password);
  
  if (adminToken) {
    console.log('✅ Admin login successful');
    
    // Run admin tests
    await testUsersModule('Admin', adminToken);
    await testReservationsModule('Admin', adminToken);
    await testPetsModule('Admin', adminToken);
    await testPaymentsModule('Admin', adminToken);
  } else {
    console.log('❌ Admin login failed');
  }
  
  // Login as owner
  console.log('\nLogging in as owner...');
  ownerToken = await login(OWNER_USER.username, OWNER_USER.password);
  
  if (ownerToken) {
    console.log('✅ Owner login successful');
    
    // Run owner tests
    await testUsersModule('Owner', ownerToken);
    await testReservationsModule('Owner', ownerToken);
    await testPetsModule('Owner', ownerToken);
    await testPaymentsModule('Owner', ownerToken);
  } else {
    console.log('❌ Owner login failed');
  }
  
  // Login as security
  console.log('\nLogging in as security...');
  securityToken = await login(SECURITY_USER.username, SECURITY_USER.password);
  
  if (securityToken) {
    console.log('✅ Security login successful');
    
    // Test visitor endpoints (security should have access)
    console.log('\n--- Testing Visitor Module as Security ---');
    
    // Get all visitors
    console.log('\nGET /visitors');
    const allVisitors = await authenticatedRequest('/visitors', 'GET', securityToken);
    console.log(`Status: ${allVisitors.status}`);
    console.log(`Success: ${allVisitors.data.success}`);
    
    // Test parking endpoints (security should have limited access)
    console.log('\n--- Testing Parking Module as Security ---');
    
    // Get all parking
    console.log('\nGET /parking');
    const allParking = await authenticatedRequest('/parking', 'GET', securityToken);
    console.log(`Status: ${allParking.status}`);
    console.log(`Success: ${allParking.data.success}`);
  } else {
    console.log('❌ Security login failed');
  }
  
  console.log('\n=== ALL TESTS COMPLETED ===');
}

runTests(); 