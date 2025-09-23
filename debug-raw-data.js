const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function debugRawData() {
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

    // Create bank account
    console.log('🏦 Creating bank account...');
    const accountResponse = await axios.post(`${BASE_URL}/banking/accounts`, {
      name: 'Debug Bank Account',
      bankName: 'Debug Bank',
      accountNumber: '1234567890',
      accountType: 'bank',
      balance: 100000
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const accountId = accountResponse.data.data._id;
    console.log('✅ Bank account created:', accountId);

    // Create test CSV file
    const csvContent = `Date,Narration,Debit (₹),Balance (₹)
02-04-2024,PCD/2475,990,193704.4
04-04-2024,SentIMPS4,3854.83,189849.6`;

    require('fs').writeFileSync('debug-test.csv', csvContent);

    // Upload CSV file
    console.log('📊 Uploading CSV file...');
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('statement', require('fs').createReadStream('debug-test.csv'));
    formData.append('accountId', accountId);

    const uploadResponse = await axios.post(`${BASE_URL}/banking/import/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ File uploaded successfully');
    const importId = uploadResponse.data.data.importId;
    
    // Check what the raw data looks like
    console.log('🔍 Upload response sample data:', JSON.stringify(uploadResponse.data.data.sampleData, null, 2));
    
    // Update field mapping
    console.log('🔧 Updating field mapping...');
    const mappingResponse = await axios.put(`${BASE_URL}/banking/import/${importId}/mapping`, {
      fieldMapping: {
        date: 'Date',
        description: 'Narration',
        withdrawals: 'Debit (₹)',
        deposits: '',
        payee: '',
        referenceNumber: ''
      },
      dateFormat: 'dd-MM-yyyy',
      decimalFormat: '1234567.89'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Field mapping updated');
    console.log('📋 Processed data sample:', JSON.stringify(mappingResponse.data.data.processedData, null, 2));

    // Clean up
    require('fs').unlinkSync('debug-test.csv');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

debugRawData();
