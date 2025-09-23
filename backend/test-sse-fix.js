// Test script to verify SSE JWT fix
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testSSEFix() {
  console.log('🧪 Testing SSE JWT Fix...\n');
  
  // You'll need to replace this with a valid JWT token from your app
  const testToken = 'your-test-token-here';
  
  if (testToken === 'your-test-token-here') {
    console.log('❌ Please replace testToken with a valid JWT token from your app');
    console.log('   You can get one by logging into the app and checking localStorage');
    return;
  }
  
  try {
    console.log('📡 Testing SSE endpoint with JWT token...');
    console.log(`   Endpoint: ${BASE_URL}/api/dashboard/events`);
    console.log(`   Token: ${testToken.substring(0, 20)}...`);
    
    const response = await fetch(`${BASE_URL}/api/dashboard/events?token=${encodeURIComponent(testToken)}`, {
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      console.log('✅ SSE endpoint is working correctly!');
      console.log('📡 Real-time updates should now work properly.');
      
      // Read a few messages to verify it's working
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      console.log('📨 Reading SSE messages...');
      for (let i = 0; i < 3; i++) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        console.log(`📨 Message ${i + 1}:`, chunk.substring(0, 100) + '...');
      }
      
      reader.releaseLock();
    } else {
      const errorText = await response.text();
      console.log('❌ SSE endpoint failed');
      console.log('📊 Error Response:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Error testing SSE:', error.message);
  }
}

testSSEFix().catch(console.error);
