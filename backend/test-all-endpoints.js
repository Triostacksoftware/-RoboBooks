import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testEndpoints() {
  console.log('🧪 Testing all API endpoints...\n');

  const endpoints = [
    { path: '/api/health', method: 'GET', auth: false },
    { path: '/api/auth/me', method: 'GET', auth: true },
    { path: '/api/documents', method: 'GET', auth: true },
    { path: '/api/reports', method: 'GET', auth: true },
    { path: '/api/customers', method: 'GET', auth: true },
    { path: '/api/items', method: 'GET', auth: true },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing ${endpoint.method} ${endpoint.path}...`);
      
      const response = await fetch(`${BASE_URL}${endpoint.path}`, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success: ${JSON.stringify(data).substring(0, 100)}...`);
      } else {
        const errorData = await response.json();
        console.log(`❌ Error: ${errorData.message || 'Unknown error'}`);
      }
      
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`);
    }
    
    console.log('---');
  }
}

testEndpoints();
