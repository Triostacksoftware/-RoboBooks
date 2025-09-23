// Test dashboard endpoints without authentication (for debugging)
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testDashboardWithoutAuth() {
  console.log('🧪 Testing Dashboard Endpoints Without Authentication...\n');
  
  try {
    // Test the unified dashboard endpoint
    console.log('📊 Testing unified dashboard endpoint...');
    const response = await fetch(`${BASE_URL}/api/dashboard/stats`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.status === 401) {
      console.log('✅ Authentication is properly required');
    } else if (response.status === 200) {
      console.log('⚠️ Dashboard endpoint is accessible without authentication');
    } else {
      console.log('❌ Unexpected response status');
    }
    
  } catch (error) {
    console.error('❌ Error testing dashboard:', error.message);
  }
}

testDashboardWithoutAuth().catch(console.error);
