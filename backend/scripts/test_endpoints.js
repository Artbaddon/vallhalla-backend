import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// Test user credentials
const TEST_USER = {
    username: 'testadmin',
    password: 'test123',
    user_status_id: 1,  // Active status
    role_id: 1         // Admin role
};

// Test data
const TEST_APARTMENT = {
    apartment_number: "101",
    status_id: 1,
    tower_id: 1,
    owner_id: 1
};

const TEST_OWNER = {
    user_id: 1,
    is_tenant: false,
    birth_date: "1990-01-01"
};

const TEST_PAYMENT = {
    amount: 1000,
    owner_id: 1,
    payment_method: "CASH",
    reference_number: "REF123"
};

const TEST_PQRS = {
    title: "Test PQRS",
    description: "Test description",
    category_id: 1,
    owner_id: 1
};

const TEST_VISITOR = {
    name: "John Doe",
    identification: "123456789",
    host_id: 1,
    visit_date: "2024-03-20"
};

const TEST_RESERVATION = {
    owner_id: 1,
    facility_id: 1,
    start_date: "2024-03-20T10:00:00",
    end_date: "2024-03-20T12:00:00"
};

const TEST_GUARD = {
    name: "Security Guard",
    identification: "987654321",
    shift: "morning",
    arl: "ARL123",
    eps: "EPS123"
};

const TEST_PROFILE = {
    user_id: 1,
    full_name: "Test User",
    document_type: "ID",
    document_number: "123456789"
};

const TEST_ROLE = {
    name: "test_role",
    description: "Test role description"
};

const TEST_PERMISSION = {
    name: "test:permission",
    description: "Test permission description"
};

const TEST_MODULE = {
    name: "test_module",
    description: "Test module description"
};

const TEST_NOTIFICATION = {
    recipient_id: 1,
    recipient_type: "user",
    message: "Test notification"
};

// Add a test facility object
const TEST_FACILITY = {
    name: "Test Facility",
    description: "Test facility description",
    capacity: 20,
    status: "available"
};

async function register() {
    try {
        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_USER)
        });

        const data = await response.json();
        if (data.id) {
            console.log('\n✅ Registration successful');
            return true;
        } else {
            console.log('\n❌ Registration failed:', data.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Registration failed:', error);
        return false;
    }
}

async function login() {
    try {
        const loginPayload = {
            username: TEST_USER.username,
            password: TEST_USER.password
        };

        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginPayload)
        });

        const data = await response.json();
        if (data.token) {
            authToken = data.token;
            console.log('\n✅ Login successful');
            return true;
        } else {
            console.log('\n❌ Login failed:', data.error);
            return false;
        }
    } catch (error) {
        console.error('❌ Login failed:', error);
        return false;
    }
}

async function testEndpoint(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        console.log(`\n🔍 Testing ${method} ${endpoint}`);
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const result = await response.json();
        console.log('Response:', result);
        return result;
    } catch (error) {
        console.error(`❌ ${method} ${endpoint} failed:`, error);
        return null;
    }
}

async function testAuthEndpoints() {
    console.log('\n📋 Testing Auth Endpoints...');
    await testEndpoint('/auth/login', 'POST', TEST_USER);
    await testEndpoint('/auth/register', 'POST', TEST_USER);
    await testEndpoint('/auth/validate-token');
}

async function testUserEndpoints() {
    console.log('\n📋 Testing User Management Endpoints...');
    // Core User Management
    await testEndpoint('/users');
    await testEndpoint('/users/details');
    await testEndpoint('/users/search?name=test');
    await testEndpoint('/users/1');
    await testEndpoint('/users', 'POST', TEST_USER);
    
    // User Status
    await testEndpoint('/user-status');
    await testEndpoint('/user-status/1');
    
    // Profile
    await testEndpoint('/profile');
    await testEndpoint('/profile/1');
    await testEndpoint('/profile', 'POST', TEST_PROFILE);
    
    // Roles & Permissions
    await testEndpoint('/roles');
    await testEndpoint('/roles/1');
    await testEndpoint('/roles', 'POST', TEST_ROLE);
    
    await testEndpoint('/permissions');
    await testEndpoint('/permissions/1');
    await testEndpoint('/permissions', 'POST', TEST_PERMISSION);
    
    await testEndpoint('/role-permissions');
    await testEndpoint('/role-permissions/1');
    
    // Modules
    await testEndpoint('/modules');
    await testEndpoint('/modules/1');
    await testEndpoint('/modules', 'POST', TEST_MODULE);
}

async function testPropertyEndpoints() {
    console.log('\n📋 Testing Property Management Endpoints...');
    
    // Apartments
    await testEndpoint('/apartments');
    await testEndpoint('/apartments/details');
    await testEndpoint('/apartments/search/number?apartment_number=101');
    await testEndpoint('/apartments/search/owner?owner_id=1');
    await testEndpoint('/apartments/search/status?status_id=1');
    await testEndpoint('/apartments/search/tower?tower_id=1');
    await testEndpoint('/apartments/report/occupancy');
    await testEndpoint('/apartments/1');
    await testEndpoint('/apartments/1/details');
    await testEndpoint('/apartments', 'POST', TEST_APARTMENT);
    
    // Apartment Status
    await testEndpoint('/apartment-status');
    await testEndpoint('/apartment-status/1');
    
    // Owners
    await testEndpoint('/owners');
    await testEndpoint('/owners/details');
    await testEndpoint('/owners/search?user_id=1');
    await testEndpoint('/owners/tenant-status');
    await testEndpoint('/owners/1');
    await testEndpoint('/owners/1/details');
    await testEndpoint('/owners', 'POST', TEST_OWNER);
}

async function testPaymentEndpoints() {
    console.log('\n📋 Testing Payment Endpoints...');
    await testEndpoint('/payments');
    await testEndpoint('/payments/stats');
    await testEndpoint('/payments/1');
    await testEndpoint('/payments/owner/1');
    await testEndpoint('/payments', 'POST', TEST_PAYMENT);
}

async function testPQRSEndpoints() {
    console.log('\n📋 Testing PQRS Endpoints...');
    await testEndpoint('/pqrs');
    await testEndpoint('/pqrs/search');
    await testEndpoint('/pqrs/stats');
    await testEndpoint('/pqrs/1');
    await testEndpoint('/pqrs/owner/1');
    await testEndpoint('/pqrs/status/1');
    await testEndpoint('/pqrs/category/1');
    await testEndpoint('/pqrs', 'POST', TEST_PQRS);
    
    await testEndpoint('/pqrs-categories');
    await testEndpoint('/pqrs-categories/1');
}

async function testSecurityEndpoints() {
    console.log('\n📋 Testing Security Endpoints...');
    
    // Visitors
    await testEndpoint('/visitors');
    await testEndpoint('/visitors/1');
    await testEndpoint('/visitors/host/1');
    await testEndpoint('/visitors/date/2024-03-20');
    await testEndpoint('/visitors', 'POST', TEST_VISITOR);
    
    // Guards
    await testEndpoint('/guards');
    await testEndpoint('/guards/1');
    await testEndpoint('/guards/shift/morning');
    await testEndpoint('/guards', 'POST', TEST_GUARD);
}

async function testReservationEndpoints() {
    console.log('\n📋 Testing Reservation Endpoints...');
    await testEndpoint('/reservations');
    await testEndpoint('/reservations/1');
    await testEndpoint('/reservations/owner/1');
    await testEndpoint('/reservations/date-range?start_date=2024-03-20&end_date=2024-03-21');
    await testEndpoint('/reservations', 'POST', TEST_RESERVATION);
    
    await testEndpoint('/reservation-status');
    await testEndpoint('/reservation-status/1');
    
    await testEndpoint('/reservation-types');
    await testEndpoint('/reservation-types/1');
}

async function testNotificationEndpoints() {
    console.log('\n📋 Testing Notification Endpoints...');
    await testEndpoint('/notifications');
    await testEndpoint('/notifications/stats');
    await testEndpoint('/notifications/1');
    await testEndpoint('/notifications/recipient/1/user');
    await testEndpoint('/notifications/unread/1/user');
    await testEndpoint('/notifications/type/1');
    await testEndpoint('/notifications', 'POST', TEST_NOTIFICATION);
}

// Add a facility endpoints test function
async function testFacilityEndpoints() {
    console.log('\n📋 Testing Facility Endpoints...');
    await testEndpoint('/facilities');
    await testEndpoint('/facilities/availability');
    await testEndpoint('/facilities/status?status=available');
    await testEndpoint('/facilities/1');
    await testEndpoint('/facilities', 'POST', TEST_FACILITY);
    await testEndpoint('/facilities/1', 'PUT', { name: "Updated Facility", description: "Updated description" });
    await testEndpoint('/facilities/1/status', 'PUT', { status: "maintenance" });
}

// Update the runTests function to include facility tests
async function runTests() {
    console.log('🚀 Starting endpoint tests...\n');
    
    // First try to login
    let loginSuccess = await login();
    
    // If login fails, try to register and then login
    if (!loginSuccess) {
        console.log('\nAttempting to register new test user...');
        const registerSuccess = await register();
        if (registerSuccess) {
            console.log('\nAttempting to login with new user...');
            loginSuccess = await login();
        }
    }
    
    if (loginSuccess) {
        // Test all endpoint categories
        await testAuthEndpoints();
        await testReservationEndpoints();
        await testFacilityEndpoints();
        
        // These endpoints may not be fully implemented yet
        await testUserEndpoints();
        await testPropertyEndpoints();
        await testPaymentEndpoints();
        await testPQRSEndpoints();
        await testSecurityEndpoints();
        await testNotificationEndpoints();
        
        console.log('\n✅ Tests completed!');
    } else {
        console.log('\n❌ Tests failed - could not authenticate');
    }
}

runTests(); 