const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

// Import models
const User = require('./models/User');
const Customer = require('./models/Customer');
const Invoice = require('./models/invoicemodel');
const Payment = require('./models/Payment');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_EMAIL = 'testuser@example.com';
const TEST_PASSWORD = 'testpassword123';

let authToken = null;
let testCustomerId = null;
let testInvoiceId = null;
let testPaymentId = null;

// Test data
const testCustomer = {
  name: 'Test Customer',
  email: 'testcustomer@example.com',
  phone: '+1234567890',
  address: '123 Test Street, Test City, TC 12345',
  company: 'Test Company Inc.',
  gstNumber: 'GST123456789',
  panNumber: 'ABCDE1234F'
};

const testInvoice = {
  invoiceNumber: 'INV-TEST-001',
  customerId: null, // Will be set after customer creation
  items: [{
    itemId: '507f1f77bcf86cd799439011', // Dummy ObjectId
    name: 'Test Item',
    description: 'Test item description',
    quantity: 2,
    rate: 500,
    amount: 1000
  }],
  subtotal: 1000,
  taxAmount: 180,
  totalAmount: 1180,
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
  status: 'sent'
};

const testPayment = {
  customerId: null, // Will be set after customer creation
  invoiceId: null, // Will be set after invoice creation
  amount: 1180,
  mode: 'Cash',
  referenceNumber: 'PAY-TEST-001',
  notes: 'Test payment for API testing'
};

async function setupTestData() {
  console.log('🔧 Setting up test data...\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/robobooks', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Create test user if it doesn't exist
    let testUser = await User.findOne({ email: TEST_EMAIL });
    if (!testUser) {
      const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
      testUser = new User({
        name: 'Test User',
        email: TEST_EMAIL,
        password: hashedPassword,
        role: 'user'
      });
      await testUser.save();
      console.log('✅ Created test user');
    } else {
      console.log('✅ Test user already exists');
    }

    // Create test customer if it doesn't exist
    let customer = await Customer.findOne({ email: testCustomer.email });
    if (!customer) {
      customer = new Customer(testCustomer);
      await customer.save();
      console.log('✅ Created test customer');
    } else {
      console.log('✅ Test customer already exists');
    }
    testCustomerId = customer._id;

    // Create test invoice if it doesn't exist
    const invoiceData = { ...testInvoice, customerId: testCustomerId };
    let invoice = await Invoice.findOne({ invoiceNumber: testInvoice.invoiceNumber });
    if (!invoice) {
      invoice = new Invoice(invoiceData);
      await invoice.save();
      console.log('✅ Created test invoice');
    } else {
      console.log('✅ Test invoice already exists');
    }
    testInvoiceId = invoice._id;

    // Update test payment data
    testPayment.customerId = testCustomerId;
    testPayment.invoiceId = testInvoiceId;

    console.log('✅ Test data setup complete\n');
    
  } catch (error) {
    console.error('❌ Error setting up test data:', error.message);
    throw error;
  }
}

async function authenticateUser() {
  console.log('🔐 Authenticating test user...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.success && data.data && data.data.token) {
      authToken = data.data.token;
      console.log('✅ Authentication successful');
      console.log(`   Token: ${authToken.substring(0, 20)}...`);
    } else {
      throw new Error('Invalid response structure from login');
    }
    
  } catch (error) {
    console.error('❌ Authentication failed:', error.message);
    throw error;
  }
}

async function testPaymentsAPI() {
  console.log('🧪 Testing Payments API...\n');

  if (!authToken) {
    console.error('❌ No authentication token available');
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  };

  try {
    // Test 1: Get all payments
    console.log('1. Testing GET /api/payments');
    try {
      const response = await fetch(`${BASE_URL}/payments`, { headers });
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   Success: ${data.success}`);
        console.log(`   Message: ${data.message}`);
        if (data.data && Array.isArray(data.data)) {
          console.log(`   Payments count: ${data.data.length}`);
        }
      } else {
        const errorData = await response.json();
        console.log(`   Error: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`);
    }

    // Test 2: Create a new payment
    console.log('\n2. Testing POST /api/payments');
    try {
      const response = await fetch(`${BASE_URL}/payments`, {
        method: 'POST',
        headers,
        body: JSON.stringify(testPayment)
      });
      
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   Success: ${data.success}`);
        console.log(`   Message: ${data.message}`);
        if (data.data && data.data._id) {
          testPaymentId = data.data._id;
          console.log(`   Payment ID: ${testPaymentId}`);
        }
      } else {
        const errorData = await response.json();
        console.log(`   Error: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`);
    }

    // Test 3: Get payment by ID
    if (testPaymentId) {
      console.log('\n3. Testing GET /api/payments/:id');
      try {
        const response = await fetch(`${BASE_URL}/payments/${testPaymentId}`, { headers });
        console.log(`   Status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`   Success: ${data.success}`);
          console.log(`   Payment Number: ${data.data.paymentNumber}`);
        } else {
          const errorData = await response.json();
          console.log(`   Error: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.log(`   ❌ Request failed: ${error.message}`);
      }
    }

    // Test 4: Update payment
    if (testPaymentId) {
      console.log('\n4. Testing PUT /api/payments/:id');
      try {
        const updateData = {
          amount: 1200,
          notes: 'Updated test payment'
        };
        
        const response = await fetch(`${BASE_URL}/payments/${testPaymentId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(updateData)
        });
        
        console.log(`   Status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`   Success: ${data.success}`);
          console.log(`   Updated amount: ${data.data.amount}`);
          console.log(`   Updated notes: ${data.data.notes}`);
        } else {
          const errorData = await response.json();
          console.log(`   Error: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.log(`   ❌ Request failed: ${error.message}`);
      }
    }

    // Test 5: Get payment statistics
    console.log('\n5. Testing GET /api/payments/stats');
    try {
      const response = await fetch(`${BASE_URL}/payments/stats`, { headers });
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   Success: ${data.success}`);
        if (data.data && data.data.summary) {
          console.log(`   Total payments: ${data.data.summary.totalPayments}`);
          console.log(`   Total amount: ${data.data.summary.totalAmount}`);
        }
      } else {
        const errorData = await response.json();
        console.log(`   Error: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`);
    }

    // Test 6: Delete test payment
    if (testPaymentId) {
      console.log('\n6. Testing DELETE /api/payments/:id');
      try {
        const response = await fetch(`${BASE_URL}/payments/${testPaymentId}`, {
          method: 'DELETE',
          headers
        });
        
        console.log(`   Status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`   Success: ${data.success}`);
          console.log(`   Message: ${data.message}`);
        } else {
          const errorData = await response.json();
          console.log(`   Error: ${errorData.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.log(`   ❌ Request failed: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error during API testing:', error.message);
  }
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...\n');
  
  try {
    // Clean up test data
    if (testPaymentId) {
      await Payment.findByIdAndDelete(testPaymentId);
      console.log('✅ Cleaned up test payment');
    }
    
    // Note: We're not cleaning up customer and invoice as they might be used by other tests
    // In a real test environment, you might want to clean these up as well
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
  }
}

async function runTests() {
  try {
    await setupTestData();
    await authenticateUser();
    await testPaymentsAPI();
    await cleanup();
    
    console.log('\n🎉 All tests completed!');
    
  } catch (error) {
    console.error('\n💥 Test suite failed:', error.message);
    await cleanup();
    process.exit(1);
  }
}

// Run the tests
runTests();
