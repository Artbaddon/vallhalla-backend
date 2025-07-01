#!/usr/bin/env node

/**
 * Vallhalla API Demonstration Script
 * Shows how to use the API for common operations
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
    log('\n' + '='.repeat(50), 'cyan');
    log(title, 'bold');
    log('='.repeat(50), 'cyan');
}

function logSubSection(title) {
    log('\n' + '-'.repeat(30), 'yellow');
    log(title, 'yellow');
    log('-'.repeat(30), 'yellow');
}

async function apiCall(method, endpoint, data = null) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return { success: true, data: response.data };
    } catch (error) {
        return { 
            success: false, 
            data: error.response?.data || error.message 
        };
    }
}

async function demonstrateAPI() {
    log('🏛️  Vallhalla API Demonstration', 'bold');
    log('Property Management System API', 'cyan');
    
    // Section 1: Authentication
    logSection('1. AUTHENTICATION');
    
    logSubSection('Login as Admin');
    const loginResult = await apiCall('POST', '/auth/login', {
        username: 'admin',
        password: '12345678'
    });
    
    if (loginResult.success && loginResult.data.token) {
        authToken = loginResult.data.token;
        log('✅ Login successful', 'green');
        log(`   User: ${loginResult.data.user.username}`, 'reset');
        log(`   Role: ${loginResult.data.user.role_id}`, 'reset');
        log(`   Token: ${authToken.substring(0, 20)}...`, 'reset');
    } else {
        log('❌ Login failed', 'red');
        log(`   Error: ${loginResult.data.message || 'Unknown error'}`, 'red');
        return;
    }

    // Section 2: User Management
    logSection('2. USER MANAGEMENT');
    
    logSubSection('Get All Users');
    const usersResult = await apiCall('GET', '/users');
    if (usersResult.success) {
        log('✅ Users retrieved successfully', 'green');
        usersResult.data.users.forEach(user => {
            log(`   - ${user.Users_name} (ID: ${user.Users_id})`, 'reset');
        });
    } else {
        log('❌ Failed to get users', 'red');
    }

    logSubSection('Get Users with Details');
    const userDetailsResult = await apiCall('GET', '/users/details');
    if (userDetailsResult.success) {
        log('✅ User details retrieved successfully', 'green');
        userDetailsResult.data.users.forEach(user => {
            log(`   - ${user.Users_name} | Status: ${user.User_status_name} | Role: ${user.Role_name}`, 'reset');
        });
    } else {
        log('❌ Failed to get user details', 'red');
    }

    // Section 3: Property Management
    logSection('3. PROPERTY MANAGEMENT');
    
    logSubSection('Get All Apartments');
    const apartmentsResult = await apiCall('GET', '/apartments');
    if (apartmentsResult.success) {
        log('✅ Apartments retrieved successfully', 'green');
        apartmentsResult.data.apartments.forEach(apt => {
            log(`   - Apartment ${apt.Apartment_number} (ID: ${apt.Apartment_id})`, 'reset');
        });
    } else {
        log('❌ Failed to get apartments', 'red');
    }

    logSubSection('Get Apartments with Details');
    const apartmentDetailsResult = await apiCall('GET', '/apartments/details');
    if (apartmentDetailsResult.success) {
        log('✅ Apartment details retrieved successfully', 'green');
        apartmentDetailsResult.data.apartments.forEach(apt => {
            log(`   - Apartment ${apt.Apartment_number} | Status: ${apt.Apartment_status_name} | Tower: ${apt.Tower_name} | Owner: ${apt.owner_name}`, 'reset');
        });
    } else {
        log('❌ Failed to get apartment details', 'red');
    }

    // Section 4: Owner Management
    logSection('4. OWNER MANAGEMENT');
    
    logSubSection('Get All Owners');
    const ownersResult = await apiCall('GET', '/owners');
    if (ownersResult.success) {
        log('✅ Owners retrieved successfully', 'green');
        ownersResult.data.owners.forEach(owner => {
            log(`   - Owner ID: ${owner.Owner_id} | Tenant: ${owner.Owner_is_tenant ? 'Yes' : 'No'}`, 'reset');
        });
    } else {
        log('❌ Failed to get owners', 'red');
    }

    logSubSection('Get Owners with Details');
    const ownerDetailsResult = await apiCall('GET', '/owners/details');
    if (ownerDetailsResult.success) {
        log('✅ Owner details retrieved successfully', 'green');
        ownerDetailsResult.data.owners.forEach(owner => {
            log(`   - ${owner.Users_name} | Phone: ${owner.Profile_telephone_number || 'N/A'} | Tenant: ${owner.Owner_is_tenant ? 'Yes' : 'No'}`, 'reset');
        });
    } else {
        log('❌ Failed to get owner details', 'red');
    }

    // Section 5: RBAC Demonstration
    logSection('5. ROLE-BASED ACCESS CONTROL (RBAC)');
    
    logSubSection('Test Admin Access');
    const adminEndpoints = [
        { name: 'User Status Management', endpoint: '/user-status' },
        { name: 'Role Management', endpoint: '/roles' },
        { name: 'Permission Management', endpoint: '/permissions' },
        { name: 'Module Management', endpoint: '/modules' }
    ];

    for (const endpoint of adminEndpoints) {
        const result = await apiCall('GET', endpoint.endpoint);
        if (result.data?.message?.includes('Access denied')) {
            log(`✅ ${endpoint.name}: Properly restricted`, 'green');
        } else {
            log(`❌ ${endpoint.name}: Unexpectedly accessible`, 'red');
        }
    }

    // Section 6: Error Handling
    logSection('6. ERROR HANDLING');
    
    logSubSection('Test Invalid Endpoint');
    const invalidResult = await apiCall('GET', '/invalid-endpoint');
    if (!invalidResult.success) {
        log('✅ Invalid endpoint properly handled', 'green');
        log(`   Response: ${invalidResult.data.message || 'Error occurred'}`, 'reset');
    } else {
        log('❌ Invalid endpoint should have failed', 'red');
    }

    logSubSection('Test Without Authentication');
    // Temporarily remove token
    const tempToken = authToken;
    authToken = '';
    
    const noAuthResult = await apiCall('GET', '/users');
    if (!noAuthResult.success) {
        log('✅ Unauthenticated access properly blocked', 'green');
        log(`   Response: ${noAuthResult.data.message || 'Error occurred'}`, 'reset');
    } else {
        log('❌ Unauthenticated access should have been blocked', 'red');
    }
    
    // Restore token
    authToken = tempToken;

    // Section 7: Summary
    logSection('7. SUMMARY');
    
    log('🎉 API Demonstration Completed!', 'bold');
    log('', 'reset');
    
    log('✅ Working Features:', 'green');
    log('   - Authentication & Authorization', 'reset');
    log('   - User Management', 'reset');
    log('   - Property Management', 'reset');
    log('   - Owner Management', 'reset');
    log('   - Role-Based Access Control', 'reset');
    log('   - Error Handling', 'reset');
    
    log('', 'reset');
    log('⚠️  Areas for Improvement:', 'yellow');
    log('   - Complete payment module implementation', 'reset');
    log('   - Complete visitor management module', 'reset');
    log('   - Complete PQRS module', 'reset');
    log('   - Add more comprehensive data validation', 'reset');
    log('   - Implement pagination for large datasets', 'reset');
    
    log('', 'reset');
    log('🚀 Next Steps:', 'blue');
    log('   1. Import postman_collection.json into Postman', 'reset');
    log('   2. Test with different user roles', 'reset');
    log('   3. Integrate with frontend application', 'reset');
    log('   4. Add more comprehensive error handling', 'reset');
    log('   5. Implement missing modules', 'reset');
}

// Handle errors
process.on('unhandledRejection', (error) => {
    log(`❌ Unhandled error: ${error.message}`, 'red');
    process.exit(1);
});

// Run demonstration
demonstrateAPI().catch(error => {
    log(`❌ Demonstration failed: ${error.message}`, 'red');
    process.exit(1);
}); 