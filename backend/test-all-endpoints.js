// Comprehensive test script for all dashboard API endpoints
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// You'll need to replace this with a valid JWT token from your app
const TEST_TOKEN = 'your-test-token-here';

async function testEndpoint(endpoint, name) {
  try {
    console.log(`\n🧪 Testing ${name}...`);
    console.log(`   Endpoint: ${endpoint}`);
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ ${name} - SUCCESS`);
      console.log(`   📊 Response:`, JSON.stringify(data, null, 2));
      return { success: true, data };
    } else {
      console.log(`   ❌ ${name} - FAILED`);
      console.log(`   📊 Error:`, data);
      return { success: false, error: data };
    }
  } catch (error) {
    console.log(`   ❌ ${name} - ERROR`);
    console.log(`   📊 Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function testAllEndpoints() {
  console.log('🧪 Testing All Dashboard API Endpoints...\n');
  
  if (TEST_TOKEN === 'your-test-token-here') {
    console.log('❌ Please replace TEST_TOKEN with a valid JWT token from your app');
    console.log('   You can get one by logging into the app and checking localStorage');
    return;
  }
  
  const endpoints = [
    { endpoint: '/api/dashboard/stats', name: 'Dashboard Stats (Unified)' },
    { endpoint: '/api/customers/stats', name: 'Customer Stats' },
    { endpoint: '/api/items/stats', name: 'Item Stats' },
    { endpoint: '/api/banking/overview', name: 'Banking Overview' },
    { endpoint: '/api/invoices/stats', name: 'Invoice Stats (Sales)' },
    { endpoint: '/api/bills/stats', name: 'Bill Stats (Purchases)' },
    { endpoint: '/api/projects/stats', name: 'Project Stats' },
    { endpoint: '/api/reports/stats', name: 'Report Stats' },
    { endpoint: '/api/sales-orders/stats', name: 'Sales Order Stats' },
    { endpoint: '/api/purchase-orders/stats', name: 'Purchase Order Stats' }
  ];
  
  const results = {};
  
  for (const { endpoint, name } of endpoints) {
    const result = await testEndpoint(endpoint, name);
    results[name] = result;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  
  const successful = Object.values(results).filter(r => r.success).length;
  const total = Object.keys(results).length;
  
  console.log(`\n✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  
  console.log('\n📋 Detailed Results:');
  Object.entries(results).forEach(([name, result]) => {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${status} ${name}`);
    if (!result.success) {
      console.log(`      Error: ${result.error}`);
    }
  });
  
  if (successful === total) {
    console.log('\n🎉 All endpoints are working correctly!');
    console.log('🚀 Dashboard should now display data properly.');
  } else {
    console.log('\n⚠️ Some endpoints are failing. Check the errors above.');
    console.log('🔧 You may need to:');
    console.log('   1. Check if the backend server is running');
    console.log('   2. Verify the JWT token is valid');
    console.log('   3. Check if the database has data');
    console.log('   4. Verify the API routes are properly configured');
  }
}

testAllEndpoints().catch(console.error);