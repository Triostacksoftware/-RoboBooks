import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testLoginFlow() {
  console.log('🧪 Testing complete login flow...\n');

  try {
    // Step 1: Login
    console.log('1. Attempting login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailOrPhone: 'test@example.com',
        password: 'password123'
      }),
    });

    console.log(`Login status: ${loginResponse.status}`);
    
    if (!loginResponse.ok) {
      const errorData = await loginResponse.json();
      console.log(`❌ Login failed: ${errorData.message}`);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');

    // Get cookies from login response
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('🍪 Cookies received:', cookies ? 'Yes' : 'No');

    // Step 2: Test authenticated endpoints
    console.log('\n2. Testing authenticated endpoints...');
    
    const protectedEndpoints = [
      '/api/auth/me',
      '/api/documents',
      '/api/reports'
    ];

    for (const endpoint of protectedEndpoints) {
      console.log(`\nTesting ${endpoint}...`);
      
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Include cookies for authentication
        credentials: 'include'
      });
      
      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success: ${JSON.stringify(data).substring(0, 100)}...`);
      } else {
        const errorData = await response.json();
        console.log(`❌ Error: ${errorData.message || 'Unknown error'}`);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLoginFlow();


