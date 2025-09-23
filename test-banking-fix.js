const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:5000/api';

async function testBankingFix() {
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
      name: 'Test Bank Account',
      bankName: 'Test Bank',
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
04-04-2024,SentIMPS4,3854.83,189849.6
01-05-2024,TRF TO PR,450,189399.6
15-05-2024,Tips/Schgs,5623.73,176387.9
20-05-2024,ATM Withdrawal,5000,171387.9`;

    fs.writeFileSync('test-bank-data.csv', csvContent);

    // Upload CSV file
    console.log('📊 Uploading CSV file...');
    const formData = new FormData();
    formData.append('statement', fs.createReadStream('test-bank-data.csv'));
    formData.append('accountId', accountId);

    const uploadResponse = await axios.post(`${BASE_URL}/banking/import/upload`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ File uploaded successfully');
    const importId = uploadResponse.data.data.importId;
    
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
    console.log('📋 Processed data sample:', JSON.stringify(mappingResponse.data.data.processedData.slice(0, 2), null, 2));

    // Import transactions
    console.log('📥 Importing transactions...');
    const importResponse = await axios.post(`${BASE_URL}/banking/import/${importId}/process`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Transactions imported successfully');

    // Get transactions to verify
    console.log('🔍 Fetching transactions to verify...');
    const transactionsResponse = await axios.get(`${BASE_URL}/banking/transactions`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Transactions fetched');
    const transactions = transactionsResponse.data.data;
    console.log(`\n🎉 Found ${transactions.length} transactions:`);
    
    transactions.forEach((txn, index) => {
      console.log(`\nTransaction ${index + 1}:`);
      console.log(`  Description: ${txn.description}`);
      console.log(`  Amount: ₹${txn.amount}`);
      console.log(`  Type: ${txn.type}`);
      console.log(`  Withdrawals: ₹${txn.withdrawals}`);
      console.log(`  Deposits: ₹${txn.deposits}`);
      console.log(`  Date: ${txn.date}`);
    });

    // Clean up
    fs.unlinkSync('test-bank-data.csv');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testBankingFix();
