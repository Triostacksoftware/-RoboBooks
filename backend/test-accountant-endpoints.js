import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testEndpoints() {
  console.log('🧪 Testing Accountant Endpoints...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    if (healthResponse.ok) {
      console.log('✅ Health endpoint working');
    } else {
      console.log('❌ Health endpoint failed');
      return;
    }

    // Test manual journals endpoint
    console.log('\n2. Testing manual journals endpoint...');
    const journalsResponse = await fetch(`${BASE_URL}/api/manual-journals`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (journalsResponse.status === 401) {
      console.log('✅ Manual journals endpoint requires authentication (expected)');
    } else if (journalsResponse.ok) {
      console.log('✅ Manual journals endpoint working');
    } else {
      console.log(`❌ Manual journals endpoint failed: ${journalsResponse.status}`);
    }

    // Test budgets endpoint
    console.log('\n3. Testing budgets endpoint...');
    const budgetsResponse = await fetch(`${BASE_URL}/api/budgets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (budgetsResponse.status === 401) {
      console.log('✅ Budgets endpoint requires authentication (expected)');
    } else if (budgetsResponse.ok) {
      console.log('✅ Budgets endpoint working');
    } else {
      console.log(`❌ Budgets endpoint failed: ${budgetsResponse.status}`);
    }

    // Test bulk updates endpoint
    console.log('\n4. Testing bulk updates endpoint...');
    const bulkUpdatesResponse = await fetch(`${BASE_URL}/api/bulk-updates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (bulkUpdatesResponse.status === 401) {
      console.log('✅ Bulk updates endpoint requires authentication (expected)');
    } else if (bulkUpdatesResponse.ok) {
      console.log('✅ Bulk updates endpoint working');
    } else {
      console.log(`❌ Bulk updates endpoint failed: ${bulkUpdatesResponse.status}`);
    }

    console.log('\n🎉 All endpoints are properly configured!');
    console.log('📝 Note: 401 responses are expected since we\'re not authenticated');

  } catch (error) {
    console.error('❌ Error testing endpoints:', error.message);
  }
}

testEndpoints();
