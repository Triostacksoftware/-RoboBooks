import fetch from 'node-fetch';

async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    // Test the /me endpoint without authentication
    const response = await fetch('http://localhost:5000/api/auth/me', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
  } catch (error) {
    console.error('Error testing auth:', error);
  }
}

testAuth();
