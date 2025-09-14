// Test script for expense API
const testExpenseAPI = async () => {
  const baseURL = 'http://localhost:5000/api';
  
  try {
    // Test health endpoint
    console.log('🔍 Testing health endpoint...');
    const healthResponse = await fetch(`${baseURL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test expenses endpoint (should require auth)
    console.log('\n🔍 Testing expenses endpoint...');
    const expensesResponse = await fetch(`${baseURL}/expenses`);
    const expensesData = await expensesResponse.json();
    console.log('📊 Expenses response:', expensesData);
    
    // Test creating an expense (should require auth)
    console.log('\n🔍 Testing expense creation...');
    const newExpense = {
      date: new Date().toISOString(),
      description: 'Test Expense',
      amount: 100.50,
      vendor: 'Test Vendor',
      account: 'Office Supplies',
      category: 'Supplies',
      paymentMethod: 'Cash',
      billable: false,
      hasReceipt: false
    };
    
    const createResponse = await fetch(`${baseURL}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newExpense)
    });
    
    const createData = await createResponse.json();
    console.log('💰 Create expense response:', createData);
    
  } catch (error) {
    console.error('❌ Error testing API:', error);
  }
};

// Run the test
testExpenseAPI();
