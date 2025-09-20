import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

// Create a fresh test token
const testUser = {
  uid: '68c6a46a3bff541520f65e2a',
  email: 'test@example.com'
};

const token = jwt.sign(testUser, 'your-super-secret-jwt-key-change-this-in-production', { expiresIn: '1h' });

console.log('🔐 Fresh test token created');

// Test the dashboard API
async function testDashboardAPI() {
  try {
    console.log('📊 Testing dashboard API...');
    
    const response = await fetch('http://localhost:5000/api/dashboard/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Dashboard API working!');
      console.log('📈 Dashboard stats:', JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log('❌ Dashboard API error:', response.status, error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDashboardAPI();
