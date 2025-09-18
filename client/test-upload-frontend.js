// Frontend file upload test
console.log('🧪 Starting frontend file upload tests...');

// Test file creation
function createTestFile(name, content, type) {
  const blob = new Blob([content], { type });
  const file = new File([blob], name, { type });
  return file;
}

// Test files
const testFiles = [
  createTestFile('test-receipt-1.pdf', 'PDF content for test', 'application/pdf'),
  createTestFile('test-receipt-2.jpg', 'JPEG content for test', 'image/jpeg'),
  createTestFile('test-receipt-3.png', 'PNG content for test', 'image/png'),
  createTestFile('test-receipt-4.txt', 'Text content for test', 'text/plain'), // Should fail validation
  createTestFile('test-receipt-5.pdf', 'Large PDF content'.repeat(1000000), 'application/pdf') // Should fail size validation
];

// Test file validation
function testFileValidation() {
  console.log('\n🧪 Testing file validation...');
  
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  testFiles.forEach((file, index) => {
    const sizeValid = file.size <= maxSize;
    const typeValid = allowedTypes.includes(file.type);
    const isValid = sizeValid && typeValid;

    console.log(`File ?{index + 1} (?{file.name}):`);
    console.log(`  - Size: ?{(file.size / 1024).toFixed(2)} KB (Max: ?{(maxSize / 1024).toFixed(2)} KB)`);
    console.log(`  - Type: ?{file.type} (Allowed: ?{typeValid ? 'Yes' : 'No'})`);
    console.log(`  - Valid: ?{isValid ? '✅' : '❌'}`);
    console.log('');
  });
}

// Test FormData creation
function testFormDataCreation() {
  console.log('\n🧪 Testing FormData creation...');
  
  testFiles.forEach((file, index) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log(`✅ FormData created successfully for file ?{index + 1} (?{file.name})`);
      
      // Test if we can iterate through FormData entries
      const entries = Array.from(formData.entries());
      console.log(`  - FormData entries: ?{entries.length}`);
      entries.forEach(([key, value]) => {
        console.log(`    - ?{key}: ?{value instanceof File ? value.name : value}`);
      });
    } catch (error) {
      console.log(`❌ FormData creation failed for file ?{index + 1}: ?{error.message}`);
    }
  });
}

// Test API client configuration
function testApiClientConfig() {
  console.log('\n🧪 Testing API client configuration...');
  
  // Check if apiClient is available
  if (typeof window !== 'undefined') {
    console.log('✅ Running in browser environment');
    
    // Test fetch availability
    if (typeof fetch !== 'undefined') {
      console.log('✅ Fetch API is available');
    } else {
      console.log('❌ Fetch API is not available');
    }
    
    // Test FormData availability
    if (typeof FormData !== 'undefined') {
      console.log('✅ FormData is available');
    } else {
      console.log('❌ FormData is not available');
    }
  } else {
    console.log('❌ Not running in browser environment');
  }
}

// Test file upload service
async function testFileUploadService() {
  console.log('\n🧪 Testing file upload service...');
  
  // Check if fileUploadService is available
  if (typeof window !== 'undefined') {
    try {
      // Dynamic import for ES modules
      const { fileUploadService } = await import('./src/services/fileUploadService.js');
      
      console.log('✅ File upload service imported successfully');
      
      // Test validation function
      const validFile = testFiles[0]; // PDF file
      const validation = fileUploadService.validateFile(validFile);
      console.log(`✅ File validation test: ?{validation.isValid ? 'Passed' : 'Failed'}`);
      
      if (!validation.isValid) {
        console.log(`  - Validation errors: ?{validation.errors.join(', ')}`);
      }
      
      // Test file size formatting
      const formattedSize = fileUploadService.formatFileSize(validFile.size);
      console.log(`✅ File size formatting: ?{validFile.size} bytes = ?{formattedSize}`);
      
      // Test file icon
      const icon = fileUploadService.getFileIcon(validFile.type);
      console.log(`✅ File icon: ?{icon}`);
      
    } catch (error) {
      console.log(`❌ File upload service test failed: ?{error.message}`);
    }
  } else {
    console.log('❌ Cannot test file upload service in non-browser environment');
  }
}

// Test upload endpoint availability
async function testUploadEndpoint() {
  console.log('\n🧪 Testing upload endpoint availability...');
  
  try {
    const response = await fetch('/api/expenses/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: true })
    });
    
    // We expect a 400 or 401 error for invalid requests, but the endpoint should exist
    if (response.status === 400 || response.status === 401 || response.status === 405) {
      console.log('✅ Upload endpoint is available (returned expected error)');
    } else {
      console.log(`⚠️ Upload endpoint returned unexpected status: ?{response.status}`);
    }
  } catch (error) {
    console.log(`❌ Upload endpoint test failed: ?{error.message}`);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting frontend file upload tests...\n');
  
  testFileValidation();
  testFormDataCreation();
  testApiClientConfig();
  await testFileUploadService();
  await testUploadEndpoint();
  
  console.log('\n📊 Frontend test summary completed!');
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runAllTests,
    testFileValidation,
    testFormDataCreation,
    testApiClientConfig,
    testFileUploadService,
    testUploadEndpoint
  };
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  runAllTests();
}
