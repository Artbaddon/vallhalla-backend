import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

async function testAuthMiddleware() {
  console.log('🧪 Testing Auth Middleware...\n');

  // Test 1: Public endpoint (should work without token)
  console.log('1️⃣ Testing public endpoint (login) without token...');
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: '12345678'
      })
    });
    
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, data);
    
    if (response.ok && data.token) {
      console.log('✅ Login successful! Got token.\n');
      
      // Test 2: Protected endpoint with valid token
      console.log('2️⃣ Testing protected endpoint with valid token...');
      const protectedResponse = await fetch(`${BASE_URL}/auth/validate-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const protectedData = await protectedResponse.json();
      console.log(`Status: ${protectedResponse.status}`);
      console.log(`Response:`, protectedData);
      
      if (protectedResponse.ok) {
        console.log('✅ Protected endpoint accessible with valid token!\n');
        
        // Test 3: Test role-based access (ADMIN only endpoint)
        console.log('3️⃣ Testing ADMIN-only endpoint...');
        const adminResponse = await fetch(`${BASE_URL}/users`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const adminData = await adminResponse.json();
        console.log(`Status: ${adminResponse.status}`);
        console.log(`Response:`, adminData);
        
        if (adminResponse.ok) {
          console.log('✅ ADMIN endpoint accessible with admin token!\n');
        } else {
          console.log('❌ ADMIN endpoint not accessible (might be role issue)\n');
        }
        
        // Test 4: Test without token (should fail)
        console.log('4️⃣ Testing protected endpoint without token...');
        const noTokenResponse = await fetch(`${BASE_URL}/users`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const noTokenData = await noTokenResponse.json();
        console.log(`Status: ${noTokenResponse.status}`);
        console.log(`Response:`, noTokenData);
        
        if (noTokenResponse.status === 401 || noTokenResponse.status === 403) {
          console.log('✅ Correctly denied access without token!\n');
        } else {
          console.log('❌ Should have denied access without token\n');
        }
        
        // Test 5: Test with invalid token
        console.log('5️⃣ Testing with invalid token...');
        const invalidTokenResponse = await fetch(`${BASE_URL}/users`, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer invalid_token_here',
            'Content-Type': 'application/json'
          }
        });
        
        const invalidTokenData = await invalidTokenResponse.json();
        console.log(`Status: ${invalidTokenResponse.status}`);
        console.log(`Response:`, invalidTokenData);
        
        if (invalidTokenResponse.status === 401 || invalidTokenResponse.status === 403) {
          console.log('✅ Correctly denied access with invalid token!\n');
        } else {
          console.log('❌ Should have denied access with invalid token\n');
        }
        
        // Test 6: Test different admin endpoint
        console.log('6️⃣ Testing another ADMIN endpoint (payments)...');
        const paymentsResponse = await fetch(`${BASE_URL}/payments`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const paymentsData = await paymentsResponse.json();
        console.log(`Status: ${paymentsResponse.status}`);
        console.log(`Response:`, paymentsData);
        
        if (paymentsResponse.ok) {
          console.log('✅ Payments endpoint accessible with admin token!\n');
        } else {
          console.log('❌ Payments endpoint not accessible\n');
        }
        
        // Test 7: Test reservation endpoint
        console.log('7️⃣ Testing reservation endpoint...');
        const reservationResponse = await fetch(`${BASE_URL}/reservations`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const reservationData = await reservationResponse.json();
        console.log(`Status: ${reservationResponse.status}`);
        console.log(`Response:`, reservationData);
        
        if (reservationResponse.ok) {
          console.log('✅ Reservation endpoint accessible with admin token!\n');
        } else {
          console.log('❌ Reservation endpoint not accessible\n');
        }
        
        // Test 8: Test PQRS endpoint
        console.log('8️⃣ Testing PQRS endpoint...');
        const pqrsResponse = await fetch(`${BASE_URL}/pqrs`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const pqrsData = await pqrsResponse.json();
        console.log(`Status: ${pqrsResponse.status}`);
        console.log(`Response:`, pqrsData);
        
        if (pqrsResponse.ok) {
          console.log('✅ PQRS endpoint accessible with admin token!\n');
        } else {
          console.log('❌ PQRS endpoint not accessible\n');
        }
        
      } else {
        console.log('❌ Protected endpoint not accessible with valid token\n');
      }
      
    } else {
      console.log('❌ Login failed\n');
    }
    
  } catch (error) {
    console.error('❌ Error testing auth middleware:', error.message);
  }
  
  console.log('🏁 Auth middleware testing completed!');
}

// Run the test
testAuthMiddleware(); 