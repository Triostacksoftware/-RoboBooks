import fetch from 'node-fetch';

const BACKEND_URL = 'http://localhost:5000';

async function loginAndTest() {
  try {
    console.log('🔐 Logging in...');
    
    // Login to get token
    const loginResponse = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@robobooks.com',
        password: 'admin123'
      })
    });

    console.log('Login status:', loginResponse.status);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful');
      console.log('Token:', loginData.accessToken ? 'Present' : 'Missing');
      
      // Test expenses API with token
      const expensesResponse = await fetch(`${BACKEND_URL}/api/expenses`, {
        headers: {
          'Authorization': `Bearer ${loginData.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Expenses API status:', expensesResponse.status);
      
      if (expensesResponse.ok) {
        const expensesData = await expensesResponse.json();
        console.log('✅ Expenses API working');
        console.log('Number of expenses:', expensesData.expenses?.length || 0);
        
        // Test specific expense
        if (expensesData.expenses && expensesData.expenses.length > 0) {
          const firstExpense = expensesData.expenses[0];
          console.log('Testing specific expense:', firstExpense._id);
          
          const expenseResponse = await fetch(`${BACKEND_URL}/api/expenses/${firstExpense._id}`, {
            headers: {
              'Authorization': `Bearer ${loginData.accessToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log('Specific expense status:', expenseResponse.status);
          if (expenseResponse.ok) {
            console.log('✅ Specific expense API working');
          } else {
            console.log('❌ Specific expense API failed');
          }
        }
      } else {
        console.log('❌ Expenses API failed');
        const errorData = await expensesResponse.text();
        console.log('Error:', errorData);
      }
    } else {
      console.log('❌ Login failed');
      const errorData = await loginResponse.text();
      console.log('Error:', errorData);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

loginAndTest();
