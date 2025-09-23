// Test frontend authentication and expense update
async function testFrontendAuth() {
  try {
    console.log('🧪 Testing frontend authentication...');
    
    // Step 1: Login to get authentication
    const loginResponse = await fetch('http://localhost:5001/api/test-login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!loginResponse.ok) {
      throw new Error('Login failed');
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', loginData);
    
    // Store token in localStorage (simulating frontend behavior)
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', loginData.token);
    }
    
    // Step 2: Test expense update with authentication
    const expenseId = '68d239d69399fb6637de2b93';
    const updateData = {
      notes: `Frontend test update at ${new Date().toISOString()}`,
      amount: 340000
    };
    
    console.log('\n🔄 Testing expense update with authentication...');
    const updateResponse = await fetch(`http://localhost:5000/api/expenses/${expenseId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify(updateData)
    });
    
    console.log('📊 Update response status:', updateResponse.status);
    
    if (updateResponse.ok) {
      const updateResult = await updateResponse.json();
      console.log('✅ Expense update successful:', updateResult);
    } else {
      const error = await updateResponse.text();
      console.log('❌ Expense update failed:', error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testFrontendAuth();
