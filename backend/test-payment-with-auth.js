import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testUser = {
  emailOrPhone: 'admin@robobooks.com',
  password: 'admin123'
};

const testPayment = {
  customerId: 'mock-customer-1',
  invoiceId: 'mock-invoice-1',
  amount: 1000,
  mode: 'Cash',
  referenceNumber: 'PAY-TEST-001',
  notes: 'Test payment for API testing',
  date: new Date().toISOString().split('T')[0]
};

async function authenticateUser() {
  console.log('🔐 Authenticating user...');
  
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Authentication successful');
      return data.accessToken;
    } else {
      const error = await response.json();
      console.log('❌ Authentication failed:', error.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    return null;
  }
}

async function testPaymentAPI(token) {
  console.log('🧪 Testing Payment API...\n');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  try {
    // Test 1: Create Payment
    console.log('1️⃣ Testing CREATE Payment...');
    const createResponse = await fetch(`${BASE_URL}/payments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testPayment)
    });

    console.log('Status:', createResponse.status);
    const createData = await createResponse.json();
    console.log('Response:', JSON.stringify(createData, null, 2));

    if (createResponse.ok) {
      console.log('✅ CREATE Payment: SUCCESS\n');
      
      // Test 2: Get Payments
      console.log('2️⃣ Testing GET Payments...');
      const getResponse = await fetch(`${BASE_URL}/payments`, {
        headers
      });
      console.log('Status:', getResponse.status);
      const getData = await getResponse.json();
      console.log('Response:', JSON.stringify(getData, null, 2));
      
      if (getResponse.ok) {
        console.log('✅ GET Payments: SUCCESS\n');
      } else {
        console.log('❌ GET Payments: FAILED\n');
      }
    } else {
      console.log('❌ CREATE Payment: FAILED\n');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

async function runTest() {
  console.log('🚀 Starting Payment API Test with Authentication...\n');
  
  const token = await authenticateUser();
  if (token) {
    await testPaymentAPI(token);
  } else {
    console.log('❌ Cannot proceed without authentication token');
  }
}

// Run the test
runTest();


