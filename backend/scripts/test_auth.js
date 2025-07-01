import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api/auth';

// Test user credentials
const TEST_USER = {
    username: 'testadmin',
    password: 'test123',
    user_status_id: 1, // Active status
    role_id: 1 // Admin role
};

let authToken = '';

async function register() {
    try {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(TEST_USER)
        });

        const data = await response.json();
        console.log('\nRegistration Response:', data);
        return data;
    } catch (error) {
        console.error('Registration failed:', error);
    }
}

async function login() {
    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: TEST_USER.username,
                password: TEST_USER.password
            })
        });

        const data = await response.json();
        console.log('\nLogin Response:', data);
        
        if (data.token) {
            authToken = data.token;
            console.log('\nAuth Token:', authToken);
        }
        
        return data;
    } catch (error) {
        console.error('Login failed:', error);
    }
}

// Run tests
async function runTests() {
    console.log('Starting authentication tests...\n');
    
    // Try to register
    await register();
    
    // Try to login
    await login();
    
    if (authToken) {
        console.log('\nAuthentication tests completed successfully!');
    } else {
        console.log('\nAuthentication tests failed - no token received');
    }
}

runTests(); 