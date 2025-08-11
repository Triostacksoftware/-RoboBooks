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

async function testMockPayment() {
  console.log('🧪 Testing Mock Payment Creation...\n');

  try {
    // Test 1: Create Payment using test endpoint
    console.log('1️⃣ Testing CREATE Payment (Mock Mode)...');
    console.log('Request data:', JSON.stringify(testPayment, null, 2));
    
    const createResponse = await fetch(`${BASE_URL}/payments/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayment)
    });

    console.log('Response Status:', createResponse.status);
    console.log('Response Headers:', Object.fromEntries(createResponse.headers.entries()));
    
    const createData = await createResponse.json();
    console.log('Response Body:', JSON.stringify(createData, null, 2));

    if (createResponse.ok) {
      console.log('✅ CREATE Payment: SUCCESS\n');
      console.log('Payment ID:', createData.data._id);
      console.log('Payment Number:', createData.data.paymentNumber);
    } else {
      console.log('❌ CREATE Payment: FAILED\n');
      console.log('Error details:', createData);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error stack:', error.stack);
  }
}

// Run the test
testMockPayment();
