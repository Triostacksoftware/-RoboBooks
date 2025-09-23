const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function debugImport() {
  try {
    // Login
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      emailOrPhone: 'test@example.com',
      password: 'password123'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    const token = loginResponse.data.accessToken;
    console.log('✅ Login successful');

    // Get recent import records
    console.log('🔍 Getting import records...');
    const importsResponse = await axios.get(`${BASE_URL}/banking/imports`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('📋 Import records:', JSON.stringify(importsResponse.data, null, 2));

  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

debugImport();
