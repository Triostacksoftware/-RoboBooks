import fetch from 'node-fetch';

const BACKEND_URL = 'http://localhost:5000';

async function testLogin() {
  try {
    console.log('🔐 Testing login...');
    
    // Login to get fresh token
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
      console.log('Access Token:', loginData.accessToken ? 'Present' : 'Missing');
      console.log('Token (first 50 chars):', loginData.accessToken ? loginData.accessToken.substring(0, 50) + '...' : 'None');
      
      // Test expenses API with fresh token
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
        
        if (expensesData.expenses && expensesData.expenses.length > 0) {
          const firstExpense = expensesData.expenses[0];
          console.log('First expense ID:', firstExpense._id);
          console.log('First expense description:', firstExpense.description);
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

testLogin();


