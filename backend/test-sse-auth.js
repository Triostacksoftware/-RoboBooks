import jwt from 'jsonwebtoken';

// Create a fresh test token
const testUser = {
  uid: '68c6a46a3bff541520f65e2a',
  email: 'test@example.com'
};

const token = jwt.sign(testUser, 'your-super-secret-jwt-key-change-this-in-production', { expiresIn: '1h' });

console.log('🔐 Fresh test token created');

// Test the SSE endpoint with token
async function testSSEWithAuth() {
  try {
    console.log('📡 Testing SSE endpoint with authentication...');
    
    const response = await fetch(`http://localhost:5000/api/dashboard/events?token=${encodeURIComponent(token)}`, {
      headers: {
        'Accept': 'text/event-stream'
      }
    });

    if (response.ok) {
      console.log('✅ SSE endpoint is accessible with authentication!');
      console.log('📡 Response status:', response.status);
      console.log('📡 Content-Type:', response.headers.get('content-type'));
      
      // Read a few events
      const reader = response.body.getReader();
      let eventCount = 0;
      
      while (eventCount < 2) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        console.log('📡 SSE Event:', chunk);
        eventCount++;
      }
      
      reader.releaseLock();
    } else {
      const error = await response.text();
      console.log('❌ SSE endpoint error:', response.status, error);
    }
  } catch (error) {
    console.error('❌ SSE test failed:', error.message);
  }
}

testSSEWithAuth();
