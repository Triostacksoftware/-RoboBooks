import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Test data
const testBankAccount = {
  name: "Test Business Account",
  bank: "Test Bank",
  accountNumber: "1234567890",
  type: "checking",
  currency: "USD",
  accountType: "Business"
};

const testTransaction = {
  description: "Test Transaction",
  amount: 100.00,
  type: "deposit",
  category: "Test Category",
  bankAccount: "", // Will be set after creating account
  account: "", // Will be set after creating account
  currency: "USD"
};

async function testBankingAPI() {
  try {
    console.log('🧪 Testing Banking API...\n');

    // Test 1: Get bank accounts
    console.log('1. Testing GET /bank-accounts');
    try {
      const response = await axios.get(`${API_BASE_URL}/bank-accounts`);
      console.log('✅ Success:', response.data.length, 'accounts found');
    } catch (error) {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }

    // Test 2: Create bank account
    console.log('\n2. Testing POST /bank-accounts');
    try {
      const response = await axios.post(`${API_BASE_URL}/bank-accounts`, testBankAccount);
      console.log('✅ Success: Account created with ID:', response.data._id);
      const accountId = response.data._id;
      
      // Test 3: Get specific account
      console.log('\n3. Testing GET /bank-accounts/:id');
      const accountResponse = await axios.get(`${API_BASE_URL}/bank-accounts/${accountId}`);
      console.log('✅ Success: Account retrieved:', accountResponse.data.name);
      
      // Test 4: Sync account
      console.log('\n4. Testing PATCH /bank-accounts/:id/sync');
      const syncResponse = await axios.patch(`${API_BASE_URL}/bank-accounts/${accountId}/sync`);
      console.log('✅ Success: Account synced, balance:', syncResponse.data.balance);
      
      // Test 5: Get account summary
      console.log('\n5. Testing GET /bank-accounts/summary');
      const summaryResponse = await axios.get(`${API_BASE_URL}/bank-accounts/summary`);
      console.log('✅ Success: Summary retrieved:', summaryResponse.data);
      
    } catch (error) {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }

    // Test 6: Get transactions
    console.log('\n6. Testing GET /bank-transactions');
    try {
      const response = await axios.get(`${API_BASE_URL}/bank-transactions`);
      console.log('✅ Success:', response.data.transactions?.length || 0, 'transactions found');
    } catch (error) {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }

    // Test 7: Get transaction categories
    console.log('\n7. Testing GET /bank-transactions/categories');
    try {
      const response = await axios.get(`${API_BASE_URL}/bank-transactions/categories`);
      console.log('✅ Success: Categories retrieved:', response.data);
    } catch (error) {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }

    // Test 8: Get banking overview
    console.log('\n8. Testing GET /banking/overview');
    try {
      const response = await axios.get(`${API_BASE_URL}/banking/overview`);
      console.log('✅ Success: Overview retrieved:', {
        totalBalance: response.data.totalBalance,
        connectedAccounts: response.data.connectedAccounts?.length || 0,
        recentTransactions: response.data.recentTransactions?.length || 0
      });
    } catch (error) {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }

    // Test 9: Get cash flow
    console.log('\n9. Testing GET /banking/cash-flow');
    try {
      const response = await axios.get(`${API_BASE_URL}/banking/cash-flow`);
      console.log('✅ Success: Cash flow retrieved:', {
        period: response.data.period,
        totals: response.data.totals
      });
    } catch (error) {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }

    // Test 10: Get sync status
    console.log('\n10. Testing GET /banking/sync-status');
    try {
      const response = await axios.get(`${API_BASE_URL}/banking/sync-status`);
      console.log('✅ Success: Sync status retrieved:', {
        total: response.data.total,
        connected: response.data.connected,
        pending: response.data.pending
      });
    } catch (error) {
      console.log('❌ Error:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Banking API tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testBankingAPI();
