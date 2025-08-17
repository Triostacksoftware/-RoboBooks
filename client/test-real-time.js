// Test script for real-time payment updates
// Run this in the browser console or as a Node.js script

console.log('🧪 Testing real-time payment updates...');

// Test the real-time service
async function testRealTimeService() {
  try {
    console.log('1️⃣ Testing real-time service connection...');
    
    // Test SSE endpoint
    const response = await fetch('/api/payments/real-time');
    console.log('✅ SSE endpoint response:', response.status, response.statusText);
    
    if (response.ok) {
      console.log('✅ SSE endpoint is working');
      
      // Test EventSource
      const eventSource = new EventSource('/api/payments/real-time');
      
      eventSource.onopen = () => {
        console.log('✅ EventSource connection opened');
      };
      
      eventSource.onmessage = (event) => {
        console.log('📨 SSE message received:', event.data);
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Parsed message:', data);
        } catch (error) {
          console.error('❌ Failed to parse SSE message:', error);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('❌ EventSource error:', error);
      };
      
      // Close connection after 10 seconds
      setTimeout(() => {
        console.log('🔌 Closing EventSource connection...');
        eventSource.close();
      }, 10000);
      
    } else {
      console.error('❌ SSE endpoint failed:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test payment API endpoints
async function testPaymentAPI() {
  try {
    console.log('2️⃣ Testing payment API endpoints...');
    
    // Test GET payments
    const paymentsResponse = await fetch('/api/payments/test');
    console.log('✅ GET payments response:', paymentsResponse.status);
    
    if (paymentsResponse.ok) {
      const payments = await paymentsResponse.json();
      console.log('✅ Payments data:', payments);
    }
    
    // Test POST payment (create)
    const newPayment = {
      customerId: 'test-customer-1',
      invoiceId: 'test-invoice-1',
      amount: 1000,
      mode: 'Cash',
      referenceNumber: 'TEST-REF-001'
    };
    
    const createResponse = await fetch('/api/payments/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newPayment)
    });
    
    console.log('✅ POST payment response:', createResponse.status);
    
    if (createResponse.ok) {
      const createdPayment = await createResponse.json();
      console.log('✅ Created payment:', createdPayment);
    }
    
  } catch (error) {
    console.error('❌ Payment API test failed:', error);
  }
}

// Test real-time updates simulation
function testRealTimeUpdates() {
  console.log('3️⃣ Testing real-time updates simulation...');
  
  // Simulate payment updates
  const simulatePaymentUpdate = (type, payment) => {
    const event = new CustomEvent('payment_update', {
      detail: {
        type,
        payment,
        timestamp: new Date().toISOString()
      }
    });
    
    document.dispatchEvent(event);
    console.log(`📨 Simulated ${type} event:`, payment);
  };
  
  // Simulate different payment events
  setTimeout(() => {
    simulatePaymentUpdate('payment_created', {
      _id: 'simulated-payment-1',
      paymentNumber: 'PAY-SIM-001',
      amount: 1500,
      customerName: 'Simulated Customer',
      status: 'Pending'
    });
  }, 2000);
  
  setTimeout(() => {
    simulatePaymentUpdate('payment_updated', {
      _id: 'simulated-payment-1',
      paymentNumber: 'PAY-SIM-001',
      amount: 1500,
      customerName: 'Simulated Customer',
      status: 'Completed'
    });
  }, 4000);
  
  setTimeout(() => {
    simulatePaymentUpdate('payment_deleted', {
      _id: 'simulated-payment-1'
    });
  }, 6000);
  
  console.log('✅ Real-time updates simulation started');
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting all tests...');
  
  await testPaymentAPI();
  await testRealTimeService();
  testRealTimeUpdates();
  
  console.log('✅ All tests completed');
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testRealTimeService = testRealTimeService;
  window.testPaymentAPI = testPaymentAPI;
  window.testRealTimeUpdates = testRealTimeUpdates;
  window.runAllTests = runAllTests;
  
  console.log('🧪 Test functions available in global scope:');
  console.log('- testRealTimeService()');
  console.log('- testPaymentAPI()');
  console.log('- testRealTimeUpdates()');
  console.log('- runAllTests()');
}

// Run tests if this is a Node.js script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testRealTimeService,
    testPaymentAPI,
    testRealTimeUpdates,
    runAllTests
  };
}
