import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

async function testDocumentsAPI() {
  try {
    console.log('🧪 Testing Documents API...');
    
    // Test 1: Health check
    console.log('\n1. Testing health check...');
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    console.log('Health check status:', healthResponse.status);
    
    // Test 2: Get documents (should fail without auth)
    console.log('\n2. Testing get documents without auth...');
    try {
      const docsResponse = await fetch(`${BASE_URL}/api/documents`);
      console.log('Get documents status:', docsResponse.status);
      if (docsResponse.status === 401) {
        console.log('✅ Correctly requires authentication');
      } else {
        console.log('❌ Should require authentication');
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
    
    console.log('\n✅ Document API tests completed');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDocumentsAPI();


