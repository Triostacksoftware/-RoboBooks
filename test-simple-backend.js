/**
 * Simple Backend Test
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testBackend() {
  console.log('Testing backend connection...');
  
  try {
    const response = await fetch('http://localhost:5000/api/invoices');
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    const text = await response.text();
    console.log('Response text:', text);
    
    if (response.ok) {
      console.log('✅ Backend is working');
    } else {
      console.log('❌ Backend returned error status');
    }
  } catch (error) {
    console.log('❌ Error connecting to backend:', error.message);
  }
}

testBackend();
