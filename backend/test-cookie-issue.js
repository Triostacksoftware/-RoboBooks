import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testCookieIssue() {
  console.log('🧪 Testing cookie issue...\n');

  try {
    // Step 1: Test login
    console.log('1. Testing login...');
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
      
      // Try to create a test user first
      console.log('\n2. Creating test user...');
      const signupResponse = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: 'Test Company',
          email: 'test@example.com',
          phoneNumber: '9876543210',
          phoneDialCode: '+91',
          phoneIso2: 'IN',
          password: 'password123',
          country: 'India',
          state: 'Maharashtra'
        }),
      });

      if (signupResponse.ok) {
        console.log('✅ Test user created');
        const signupData = await signupResponse.json();
        console.log('Signup response:', signupData);
        
        // Check cookies from signup
        const signupCookies = signupResponse.headers.get('set-cookie');
        console.log('🍪 Signup cookies:', signupCookies);
        
        // Try login again
        console.log('\n3. Trying login again...');
        const loginResponse2 = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emailOrPhone: 'test@example.com',
            password: 'password123'
          }),
        });
        
        if (loginResponse2.ok) {
          const loginData = await loginResponse2.json();
          console.log('✅ Login successful');
          console.log('Login response:', loginData);
          
          // Check cookies from login
          const loginCookies = loginResponse2.headers.get('set-cookie');
          console.log('🍪 Login cookies:', loginCookies);
          
          // Test authenticated endpoint
          console.log('\n4. Testing authenticated endpoint...');
          const meResponse = await fetch(`${BASE_URL}/api/auth/me`, {
            headers: {
              'Cookie': loginCookies || ''
            }
          });
          
          console.log(`Me endpoint status: ${meResponse.status}`);
          if (meResponse.ok) {
            const meData = await meResponse.json();
            console.log('✅ Me endpoint successful:', meData);
          } else {
            const meError = await meResponse.json();
            console.log('❌ Me endpoint failed:', meError);
          }
        } else {
          const loginError = await loginResponse2.json();
          console.log('❌ Login failed again:', loginError);
        }
      } else {
        const signupError = await signupResponse.json();
        console.log('❌ Signup failed:', signupError);
      }
    } else {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful');
      console.log('Login response:', loginData);
      
      // Check cookies from login
      const loginCookies = loginResponse.headers.get('set-cookie');
      console.log('🍪 Login cookies:', loginCookies);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCookieIssue();


