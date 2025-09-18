// Test script to verify currency API with authentication
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:3000';

// Test credentials (update with actual credentials)
const TEST_EMAIL = 'user@robobooks.com';
const TEST_PASSWORD = 'password123'; // You may need to update this

async function testLoginAndCurrencyAPI() {
  console.log('🔐 Testing Login and Currency API Integration...\n');

  try {
    // Step 1: Login to get authentication token
    console.log('1️⃣ Attempting to login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailOrPhone: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginResponse.status);
      const error = await loginResponse.json();
      console.log('Error details:', error);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');
    console.log(`👤 User: ${loginData.user?.email || 'N/A'}`);
    console.log(`🔑 Token received: ${loginData.accessToken ? 'Yes' : 'No'}`);

    const token = loginData.accessToken;

    // Step 2: Test currency API with authentication
    console.log('\n2️⃣ Testing Currency API with authentication...');
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Test exchange rates endpoint
    console.log('📊 Testing GET /api/currency/rates');
    const ratesResponse = await fetch(`${BASE_URL}/currency/rates`, {
      method: 'GET',
      headers
    });

    if (ratesResponse.ok) {
      const rates = await ratesResponse.json();
      console.log('✅ Exchange rates fetched successfully');
      console.log(`📈 Found ${rates.data?.length || 0} exchange rates`);
    } else {
      console.log('❌ Failed to fetch exchange rates:', ratesResponse.status);
    }

    // Test currency adjustments endpoint
    console.log('\n📊 Testing GET /api/currency/adjustments');
    const adjustmentsResponse = await fetch(`${BASE_URL}/currency/adjustments`, {
      method: 'GET',
      headers
    });

    if (adjustmentsResponse.ok) {
      const adjustments = await adjustmentsResponse.json();
      console.log('✅ Currency adjustments fetched successfully');
      console.log(`📋 Found ${adjustments.data?.length || 0} adjustments`);
    } else {
      console.log('❌ Failed to fetch adjustments:', adjustmentsResponse.status);
    }

    // Test statistics endpoint
    console.log('\n📊 Testing GET /api/currency/stats');
    const statsResponse = await fetch(`${BASE_URL}/currency/stats`, {
      method: 'GET',
      headers
    });

    if (statsResponse.ok) {
      const stats = await statsResponse.json();
      console.log('✅ Statistics fetched successfully');
      console.log('📊 Stats:', stats.data);
    } else {
      console.log('❌ Failed to fetch statistics:', statsResponse.status);
    }

    // Step 3: Test frontend page access
    console.log('\n3️⃣ Testing frontend page access...');
    const frontendResponse = await fetch(`${FRONTEND_URL}/dashboard/accountant/currency-adjustments`);
    
    if (frontendResponse.ok) {
      console.log('✅ Currency adjustments page is accessible');
      console.log(`📄 Status: ${frontendResponse.status} ${frontendResponse.statusText}`);
    } else {
      console.log('❌ Currency adjustments page not accessible:', frontendResponse.status);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Open your browser and go to: http://localhost:3000');
    console.log('2. Login with your credentials');
    console.log('3. Navigate to: Dashboard → Accountant → Currency Adjustments');
    console.log('4. You should see the currency data loaded from the API');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testLoginAndCurrencyAPI();
