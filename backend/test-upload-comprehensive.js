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

// Test file upload
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
      }
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
      }
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
      }
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

// Test file validation
function testFileValidation() {
  console.log('\n🧪 Testing file validation...');
  
  const testCases = [
    {
      name: 'valid-pdf.pdf',
      size: 1024 * 1024, // 1MB
      type: 'application/pdf',
      shouldPass: true
    },
    {
      name: 'valid-jpg.jpg',
      size: 2 * 1024 * 1024, // 2MB
      type: 'image/jpeg',
      shouldPass: true
    },
    {
      name: 'too-large.pdf',
      size: 15 * 1024 * 1024, // 15MB
      type: 'application/pdf',
      shouldPass: false
    },
    {
      name: 'invalid-type.txt',
      size: 1024, // 1KB
      type: 'text/plain',
      shouldPass: false
    }
  ];

  testCases.forEach(testCase => {
    const mockFile = {
      name: testCase.name,
      size: testCase.size,
      type: testCase.type
    };

    // Simulate validation logic
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

    const sizeValid = mockFile.size <= maxSize;
    const typeValid = allowedTypes.includes(mockFile.type);
    const isValid = sizeValid && typeValid;

    const result = isValid === testCase.shouldPass ? '✅' : '❌';
    console.log(`${result} ${testCase.name}: ${isValid ? 'Valid' : 'Invalid'} (Expected: ${testCase.shouldPass ? 'Valid' : 'Invalid'})`);
  });
}

// Main test function
async function runComprehensiveUploadTests() {
  console.log('🚀 Starting comprehensive file upload tests...\n');

  try {
    // Create test files
    createTestFiles();

    // Test file validation
    testFileValidation();

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
    console.log(`- Test files created: ${testFiles.length}`);
    console.log(`- Successful uploads: ${uploadResults.filter(r => r).length}`);
    console.log(`- Failed uploads: ${uploadResults.filter(r => !r).length}`);

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
  runComprehensiveUploadTests();
}

export { runComprehensiveUploadTests, testFileUpload, testFileValidation };
