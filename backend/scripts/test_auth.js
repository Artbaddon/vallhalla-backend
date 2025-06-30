import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testUser = {
  username: 'admin',
  password: 'admin123'
};

const newUser = {
  username: 'testuser',
  password: 'testpass123',
  user_status_id: 1,
  role_id: 2
};

async function testAuth() {
  console.log('🧪 Testing Vallhalla Authentication System\n');

  try {
    // Test 1: Login
    console.log('1️⃣ Testing Login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    const loginData = await loginResponse.json();
    
    if (loginResponse.ok) {
      console.log('✅ Login successful');
      console.log('   Token:', loginData.token.substring(0, 50) + '...');
      console.log('   User:', loginData.user);
      
      const token = loginData.token;

      // Test 2: Validate Token
      console.log('\n2️⃣ Testing Token Validation...');
      const validateResponse = await fetch(`${BASE_URL}/auth/validate-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const validateData = await validateResponse.json();
      
      if (validateResponse.ok) {
        console.log('✅ Token validation successful');
        console.log('   User info:', validateData.user);
        console.log('   Token expires:', validateData.token.expiresAt);
      } else {
        console.log('❌ Token validation failed:', validateData.error);
      }

      // Test 3: Change Password (protected route)
      console.log('\n3️⃣ Testing Change Password (Protected Route)...');
      const changePasswordResponse = await fetch(`${BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: 'admin123',
          newPassword: 'newpassword123'
        })
      });

      const changePasswordData = await changePasswordResponse.json();
      
      if (changePasswordResponse.ok) {
        console.log('✅ Password change successful');
      } else {
        console.log('❌ Password change failed:', changePasswordData.error);
      }

    } else {
      console.log('❌ Login failed:', loginData.error);
    }

    // Test 4: Register New User
    console.log('\n4️⃣ Testing User Registration...');
    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newUser)
    });

    const registerData = await registerResponse.json();
    
    if (registerResponse.ok) {
      console.log('✅ User registration successful');
      console.log('   User ID:', registerData.id);
    } else {
      console.log('❌ User registration failed:', registerData.error);
    }

    // Test 5: Forgot Password
    console.log('\n5️⃣ Testing Forgot Password...');
    const forgotPasswordResponse = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin'
      })
    });

    const forgotPasswordData = await forgotPasswordResponse.json();
    
    if (forgotPasswordResponse.ok) {
      console.log('✅ Forgot password request successful');
      console.log('   Message:', forgotPasswordData.message);
    } else {
      console.log('❌ Forgot password failed:', forgotPasswordData.error);
    }

    // Test 6: Test Invalid Login
    console.log('\n6️⃣ Testing Invalid Login...');
    const invalidLoginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'wrongpassword'
      })
    });

    const invalidLoginData = await invalidLoginResponse.json();
    
    if (!invalidLoginResponse.ok) {
      console.log('✅ Invalid login correctly rejected');
      console.log('   Error:', invalidLoginData.error);
    } else {
      console.log('❌ Invalid login should have been rejected');
    }

    // Test 7: Test Protected Route Without Token
    console.log('\n7️⃣ Testing Protected Route Without Token...');
    const noTokenResponse = await fetch(`${BASE_URL}/auth/validate-token`, {
      method: 'GET'
    });

    const noTokenData = await noTokenResponse.json();
    
    if (!noTokenResponse.ok) {
      console.log('✅ Protected route correctly rejected without token');
      console.log('   Error:', noTokenData.error || noTokenData.message);
    } else {
      console.log('❌ Protected route should have been rejected without token');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }

  console.log('\n🏁 Authentication tests completed!');
}

// Run the tests
testAuth(); 