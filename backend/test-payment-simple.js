import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testPayment = {
  customerId: 'mock-customer-1',
  invoiceId: 'mock-invoice-1',
  amount: 1000,
  mode: 'Cash',
  referenceNumber: 'PAY-TEST-001',
  notes: 'Test payment for API testing',
  date: new Date().toISOString().split('T')[0]
};

async function testPaymentAPI() {
  console.log('🧪 Testing Payment API (Test Endpoint)...\n');

  try {
    // Test 1: Create Payment using test endpoint
    console.log('1️⃣ Testing CREATE Payment (Test Endpoint)...');
    const createResponse = await fetch(`${BASE_URL}/payments/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayment)
    });

    console.log('Status:', createResponse.status);
    const createData = await createResponse.json();
    console.log('Response:', JSON.stringify(createData, null, 2));

    if (createResponse.ok) {
      console.log('✅ CREATE Payment: SUCCESS\n');
      
      // Test 2: Try to get payments (should fail due to auth)
      console.log('2️⃣ Testing GET Payments (should fail due to auth)...');
      const getResponse = await fetch(`${BASE_URL}/payments`);
      console.log('Status:', getResponse.status);
      const getData = await getResponse.json();
      console.log('Response:', JSON.stringify(getData, null, 2));
      
      if (getResponse.status === 401) {
        console.log('✅ GET Payments: Correctly blocked due to auth (expected)\n');
      } else {
        console.log('❌ GET Payments: Unexpected response\n');
      }
    } else {
      console.log('❌ CREATE Payment: FAILED\n');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPaymentAPI();


