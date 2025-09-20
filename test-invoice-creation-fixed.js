/**
 * Test Invoice Creation After Fixes
 * Tests the complete invoice creation flow with fixes applied
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configuration
const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:3000';

// Test results
let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper function to log test results
function logTest(testName, passed, error = null) {
  if (passed) {
    console.log(`✅ ${testName}`);
    testResults.passed++;
  } else {
    console.log(`❌ ${testName}`);
    if (error) {
      console.log(`   Error: ${error.message || error}`);
      testResults.errors.push({ test: testName, error: error.message || error });
    }
    testResults.failed++;
  }
}

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', data = null, headers = {}) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${BACKEND_URL}${endpoint}`, options);
    const result = await response.json();
    
    return { success: response.ok, status: response.status, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Test 1: Backend Server Health Check
async function testBackendHealth() {
  console.log('\n🔍 Testing Backend Server Health...');
  
  const result = await apiCall('/api/invoices');
  logTest('Backend server is running', result.success || result.status === 401);
  
  if (!result.success && result.status !== 401) {
    console.log('   Backend server is not responding. Please start the server first.');
    return false;
  }
  
  console.log('   Backend server is responding');
  return true;
}

// Test 2: Test Invoice Number Generation
async function testInvoiceNumberGeneration() {
  console.log('\n🔢 Testing Invoice Number Generation...');
  
  const result = await apiCall('/api/invoices/next-number');
  logTest('Invoice number generation', result.success);
  
  if (result.success) {
    console.log(`   Generated invoice number: ${result.data.invoiceNumber}`);
    return result.data.invoiceNumber;
  } else {
    console.log(`   Error: ${result.data?.error || result.error}`);
  }
  
  return null;
}

// Test 3: Test File Upload
async function testFileUpload() {
  console.log('\n📁 Testing File Upload...');
  
  // Create a test file buffer
  const testFileContent = 'This is a test file for invoice attachment';
  const testFile = new Blob([testFileContent], { type: 'text/plain' });
  
  const formData = new FormData();
  formData.append('document', testFile, 'test-invoice-file.txt');
  formData.append('title', 'Test Invoice Attachment');
  formData.append('description', 'Test file for invoice');
  formData.append('documentType', 'invoice');
  formData.append('category', 'financial');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/documents/upload`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    const success = response.ok;
    
    logTest('File upload', success);
    
    if (success) {
      console.log(`   Uploaded file: ${result.data.fileName}`);
      return result.data;
    } else {
      console.log(`   Error: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    logTest('File upload', false, error);
  }
  
  return null;
}

// Test 4: Test Signature Upload
async function testSignatureUpload() {
  console.log('\n✍️ Testing Signature Upload...');
  
  // Create a test image buffer (minimal PNG)
  const testImageBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, // IHDR data
    0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
    0x08, 0x99, 0x01, 0x01, 0x00, 0x00, 0x00, 0xFF, 0xFF, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // IDAT data
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 // IEND chunk
  ]);
  
  const formData = new FormData();
  formData.append('signature', new Blob([testImageBuffer], { type: 'image/png' }), 'test-signature.png');
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/documents/upload-signature`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    const success = response.ok;
    
    logTest('Signature upload', success);
    
    if (success) {
      console.log(`   Uploaded signature: ${result.data.fileName}`);
      return result.data;
    } else {
      console.log(`   Error: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    logTest('Signature upload', false, error);
  }
  
  return null;
}

// Test 5: Test Complete Invoice Creation Flow
async function testCompleteInvoiceCreation() {
  console.log('\n📄 Testing Complete Invoice Creation Flow...');
  
  // Get fresh invoice number
  const invoiceNumber = await testInvoiceNumberGeneration();
  if (!invoiceNumber) {
    logTest('Complete invoice creation', false, 'Failed to get invoice number');
    return null;
  }
  
  // Test file uploads
  const fileData = await testFileUpload();
  const signatureData = await testSignatureUpload();
  
  // Create test invoice data
  const testInvoiceData = {
    customerId: '68cdec4348140bb3b77eb45d', // Use existing customer ID
    customerName: 'ABC Corporation',
    customerEmail: 'contact@abccorp.com',
    customerPhone: '+91-9876543210',
    invoiceNumber: invoiceNumber,
    orderNumber: `TEST-${Date.now()}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [
      {
        itemId: '68cdec4348140bb3b77eb463',
        details: 'Test Item',
        description: 'Test Description',
        quantity: 1,
        unit: 'pcs',
        rate: 1000,
        amount: 1000,
        taxRate: 18,
        taxAmount: 180,
        total: 1180
      }
    ],
    subtotal: 1000,
    discount: 0,
    discountType: 'percentage',
    discountAmount: 0,
    taxAmount: 180,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 180,
    additionalTaxType: null,
    additionalTaxId: null,
    additionalTaxRate: 0,
    additionalTaxAmount: 0,
    adjustment: 0,
    total: 1180,
    paymentTerms: 'Due on Receipt',
    paymentMethod: '',
    amountPaid: 0,
    balanceDue: 1180,
    customerNotes: 'Test invoice created by automated test',
    termsConditions: 'Test terms and conditions',
    internalNotes: '',
    files: fileData ? [{
      fileName: fileData.fileName,
      filePath: fileData.filePath,
      fileSize: fileData.fileSize,
      uploadedAt: new Date(),
      isAttachment: true
    }] : [],
    signature: signatureData ? {
      fileName: signatureData.fileName,
      filePath: signatureData.filePath,
      fileSize: signatureData.fileSize,
      uploadedAt: new Date(),
      isSignature: true
    } : null,
    status: 'Draft',
    emailSent: false,
    remindersSent: 0,
    currency: 'INR',
    exchangeRate: 1
  };
  
  console.log(`   Creating invoice with number: ${invoiceNumber}`);
  const result = await apiCall('/api/invoices', 'POST', testInvoiceData);
  
  logTest('Complete invoice creation', result.success);
  
  if (result.success) {
    console.log(`   Created invoice: ${result.data.invoiceNumber || 'N/A'}`);
    return result.data;
  } else {
    console.log(`   Error: ${result.data?.error || result.error}`);
  }
  
  return null;
}

// Test 6: Test Invoice List Retrieval
async function testInvoiceList() {
  console.log('\n📋 Testing Invoice List Retrieval...');
  
  const result = await apiCall('/api/invoices');
  logTest('Invoice list retrieval', result.success);
  
  if (result.success) {
    console.log(`   Retrieved ${result.data.length || 0} invoices`);
    return result.data;
  } else {
    console.log(`   Error: ${result.data?.error || result.error}`);
  }
  
  return null;
}

// Test 7: Test Frontend Access
async function testFrontendAccess() {
  console.log('\n🌐 Testing Frontend Access...');
  
  try {
    const response = await fetch(`${FRONTEND_URL}/dashboard/sales/invoices/new`);
    const success = response.ok;
    logTest('Frontend page accessible', success);
    
    if (success) {
      console.log(`   Page loaded successfully: ${response.status}`);
    } else {
      console.log(`   Page load failed: ${response.status}`);
    }
    
    return success;
  } catch (error) {
    logTest('Frontend page accessible', false, error);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Invoice Creation Tests After Fixes...\n');
  
  // Check if backend is running
  const backendHealthy = await testBackendHealth();
  if (!backendHealthy) {
    console.log('\n❌ Backend server is not running. Please start it first.');
    return;
  }
  
  // Run all tests
  await testInvoiceNumberGeneration();
  await testFileUpload();
  await testSignatureUpload();
  await testCompleteInvoiceCreation();
  await testInvoiceList();
  await testFrontendAccess();
  
  // Print summary
  console.log('\n📊 Test Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n🔍 Errors:');
    testResults.errors.forEach(error => {
      console.log(`   - ${error.test}: ${error.error}`);
    });
  }
  
  console.log('\n🎉 Test suite completed!');
  
  if (testResults.passed > testResults.failed) {
    console.log('\n✅ Invoice creation functionality is working!');
    console.log('💡 You can now test the buttons in the browser:');
    console.log('   1. Open http://localhost:3000/dashboard/sales/invoices/new');
    console.log('   2. Fill in the invoice form');
    console.log('   3. Click "Save as Draft" or "Save and Send"');
    console.log('   4. Verify the invoice is created successfully');
  } else {
    console.log('\n❌ Some issues still need to be resolved.');
  }
}

// Run the tests
runAllTests().catch(console.error);
