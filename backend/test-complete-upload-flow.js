import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const BASE_URL = 'http://localhost:5000';
const TEST_UPLOAD_DIR = path.join(__dirname, 'uploads', 'test-receipts');

// Ensure test upload directory exists
if (!fs.existsSync(TEST_UPLOAD_DIR)) {
  fs.mkdirSync(TEST_UPLOAD_DIR, { recursive: true });
}

// Test data
const testFiles = [
  {
    name: 'test-receipt-1.pdf',
    content: Buffer.from('PDF content for test receipt 1'),
    mimeType: 'application/pdf'
  },
  {
    name: 'test-receipt-2.jpg',
    content: Buffer.from('JPEG content for test receipt 2'),
    mimeType: 'image/jpeg'
  },
  {
    name: 'test-receipt-3.png',
    content: Buffer.from('PNG content for test receipt 3'),
    mimeType: 'image/png'
  }
];

// Create test files
function createTestFiles() {
  console.log('📁 Creating test files...');
  testFiles.forEach(file => {
    const filePath = path.join(TEST_UPLOAD_DIR, file.name);
    fs.writeFileSync(filePath, file.content);
    console.log(`✅ Created test file: ${file.name}`);
  });
}

// Test server connectivity
async function testServerConnectivity() {
  try {
    console.log('\n🧪 Testing server connectivity...');
    const response = await fetch(`${BASE_URL}/api/health`, {
      method: 'GET',
      timeout: 5000
    });
    
    if (response.ok) {
      console.log('✅ Server is running and accessible');
      return true;
    } else {
      console.log(`⚠️ Server responded with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Server connectivity test failed: ${error.message}`);
    return false;
  }
}

// Test file upload endpoint
async function testFileUpload(filePath, fileName, mimeType) {
  try {
    console.log(`\n🧪 Testing upload for: ${fileName}`);
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(filePath), {
      filename: fileName,
      contentType: mimeType
    });

    const response = await fetch(`${BASE_URL}/api/expenses/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        ...formData.getHeaders(),
        'Authorization': 'Bearer test-token' // You may need to adjust this
      },
      timeout: 10000
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Upload successful for ${fileName}:`, result);
      return result;
    } else {
      console.log(`❌ Upload failed for ${fileName}:`, result);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error uploading ${fileName}:`, error.message);
    return null;
  }
}

// Test file retrieval
async function testFileRetrieval(fileId) {
  try {
    console.log(`\n🧪 Testing file retrieval for: ${fileId}`);
    
    const response = await fetch(`${BASE_URL}/api/expenses/files/${fileId}`, {
      headers: {
        'Authorization': 'Bearer test-token'
      },
      timeout: 5000
    });

    if (response.ok) {
      console.log(`✅ File retrieval successful for ${fileId}`);
      return true;
    } else {
      console.log(`❌ File retrieval failed for ${fileId}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error retrieving ${fileId}:`, error.message);
    return false;
  }
}

// Test file deletion
async function testFileDeletion(fileId) {
  try {
    console.log(`\n🧪 Testing file deletion for: ${fileId}`);
    
    const response = await fetch(`${BASE_URL}/api/expenses/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer test-token'
      },
      timeout: 5000
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ File deletion successful for ${fileId}:`, result);
      return true;
    } else {
      console.log(`❌ File deletion failed for ${fileId}:`, result);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error deleting ${fileId}:`, error.message);
    return false;
  }
}

// Test customer creation
async function testCustomerCreation() {
  try {
    console.log('\n🧪 Testing customer creation...');
    
    const customerData = {
      customerType: 'Individual',
      firstName: 'Test',
      lastName: 'Customer',
      displayName: 'Test Customer',
      email: 'test@example.com',
      mobile: '1234567890',
      billingAddress: {
        street: '123 Test Street'
      },
      isActive: true
    };

    const response = await fetch(`${BASE_URL}/api/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(customerData),
      timeout: 5000
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Customer creation successful:`, result);
      return result;
    } else {
      console.log(`❌ Customer creation failed:`, result);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error creating customer:`, error.message);
    return null;
  }
}

// Test project creation
async function testProjectCreation() {
  try {
    console.log('\n🧪 Testing project creation...');
    
    const projectData = {
      name: 'Test Project',
      client: 'Test Client',
      description: 'Test project description',
      status: 'active',
      startDate: new Date().toISOString(),
      budget: 1000
    };

    const response = await fetch(`${BASE_URL}/api/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      body: JSON.stringify(projectData),
      timeout: 5000
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Project creation successful:`, result);
      return result;
    } else {
      console.log(`❌ Project creation failed:`, result);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error creating project:`, error.message);
    return null;
  }
}

// Main test function
async function runCompleteUploadFlowTest() {
  console.log('🚀 Starting complete upload flow test...\n');

  try {
    // Test server connectivity
    const serverRunning = await testServerConnectivity();
    if (!serverRunning) {
      console.log('❌ Server is not running. Please start the server first.');
      return;
    }

    // Create test files
    createTestFiles();

    // Test customer and project creation
    const customer = await testCustomerCreation();
    const project = await testProjectCreation();

    // Test uploads
    const uploadResults = [];
    for (const testFile of testFiles) {
      const filePath = path.join(TEST_UPLOAD_DIR, testFile.name);
      const result = await testFileUpload(filePath, testFile.name, testFile.mimeType);
      uploadResults.push(result);
    }

    // Test file retrieval and deletion for successful uploads
    for (const result of uploadResults) {
      if (result && result.fileId) {
        await testFileRetrieval(result.fileId);
        await testFileDeletion(result.fileId);
      }
    }

    console.log('\n📊 Test Summary:');
    console.log(`- Server connectivity: ${serverRunning ? '✅' : '❌'}`);
    console.log(`- Customer creation: ${customer ? '✅' : '❌'}`);
    console.log(`- Project creation: ${project ? '✅' : '❌'}`);
    console.log(`- Test files created: ${testFiles.length}`);
    console.log(`- Successful uploads: ${uploadResults.filter(r => r).length}`);
    console.log(`- Failed uploads: ${uploadResults.filter(r => !r).length}`);

    if (uploadResults.filter(r => r).length > 0) {
      console.log('\n🎉 Upload functionality is working correctly!');
    } else {
      console.log('\n⚠️ Upload functionality needs attention.');
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error);
  } finally {
    // Cleanup test files
    console.log('\n🧹 Cleaning up test files...');
    testFiles.forEach(file => {
      const filePath = path.join(TEST_UPLOAD_DIR, file.name);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Deleted test file: ${file.name}`);
      }
    });
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCompleteUploadFlowTest();
}

export { runCompleteUploadFlowTest, testFileUpload, testCustomerCreation, testProjectCreation };
