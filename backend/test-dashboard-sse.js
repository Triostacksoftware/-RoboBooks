// Test script for dashboard SSE endpoint
const EventSource = require('eventsource');

async function testDashboardSSE() {
  console.log('🧪 Testing Dashboard SSE endpoint...');
  
  // You'll need to replace this with a valid JWT token from your app
  const testToken = 'your-test-token-here';
  
  if (testToken === 'your-test-token-here') {
    console.log('❌ Please replace testToken with a valid JWT token from your app');
    console.log('   You can get one by logging into the app and checking localStorage');
    return;
  }
  
  const eventSource = new EventSource(`http://localhost:5000/api/dashboard/events?token=${encodeURIComponent(testToken)}`);
  
  eventSource.onopen = () => {
    console.log('✅ SSE connection opened');
  };
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('📨 Received message:', data.type, data.timestamp);
      
      if (data.type === 'dashboard_update') {
        console.log('📊 Dashboard stats updated:', {
          customers: data.stats.customers?.total || 0,
          items: data.stats.items?.total || 0,
          sales: data.stats.sales?.totalRevenue || 0,
          purchases: data.stats.purchases?.totalExpenses || 0
        });
      }
    } catch (error) {
      console.error('❌ Error parsing message:', error);
    }
  };
  
  eventSource.onerror = (error) => {
    console.error('❌ SSE error:', error);
  };
  
  // Close after 30 seconds
  setTimeout(() => {
    console.log('🔌 Closing SSE connection...');
    eventSource.close();
    process.exit(0);
  }, 30000);
}

testDashboardSSE().catch(console.error);
