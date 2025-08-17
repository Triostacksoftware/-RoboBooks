import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testCRUDOperations() {
  console.log('🧪 Testing CRUD operations...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health check...');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    console.log(`   Status: ${healthResponse.status}`);
    const healthData = await healthResponse.json();
    console.log(`   Response:`, healthData);
    console.log('');

    // Test 2: Create payment (POST)
    console.log('2️⃣ Testing payment creation...');
    const createData = {
      customerId: 'test-customer-1',
      invoiceId: 'test-invoice-1',
      amount: 1000,
      mode: 'Cash',
      referenceNumber: 'TEST-REF-001'
    };
    
    const createResponse = await fetch(`${BASE_URL}/api/payments/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(createData)
    });
    
    console.log(`   Status: ${createResponse.status}`);
    const createResult = await createResponse.json();
    console.log(`   Response:`, createResult);
    
    if (createResult.success && createResult.data._id) {
      const paymentId = createResult.data._id;
      console.log(`   ✅ Payment created with ID: ${paymentId}`);
      console.log('');

      // Test 3: Get payment by ID (GET)
      console.log('3️⃣ Testing payment retrieval...');
      const getResponse = await fetch(`${BASE_URL}/api/payments/test/${paymentId}`);
      console.log(`   Status: ${getResponse.status}`);
      const getResult = await getResponse.json();
      console.log(`   Response:`, getResult);
      console.log('');

      // Test 4: Update payment (PUT)
      console.log('4️⃣ Testing payment update...');
      const updateData = {
        amount: 1500,
        notes: 'Updated payment amount'
      };
      
      const updateResponse = await fetch(`${BASE_URL}/api/payments/test/${paymentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      console.log(`   Status: ${updateResponse.status}`);
      const updateResult = await updateResponse.json();
      console.log(`   Response:`, updateResult);
      console.log('');

      // Test 5: Delete payment (DELETE)
      console.log('5️⃣ Testing payment deletion...');
      const deleteResponse = await fetch(`${BASE_URL}/api/payments/test/${paymentId}`, {
        method: 'DELETE'
      });
      
      console.log(`   Status: ${deleteResponse.status}`);
      const deleteResult = await deleteResponse.json();
      console.log(`   Response:`, deleteResult);
      console.log('');

    } else {
      console.log('   ❌ Failed to create payment for testing');
    }

    // Test 6: Get all payments (GET)
    console.log('6️⃣ Testing get all payments...');
    const getAllResponse = await fetch(`${BASE_URL}/api/payments/test`);
    console.log(`   Status: ${getAllResponse.status}`);
    const getAllResult = await getAllResponse.json();
    console.log(`   Response:`, getAllResult);
    console.log('');

    console.log('🎉 CRUD operations test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testCRUDOperations();
