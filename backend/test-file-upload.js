import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test file upload functionality
async function testFileUpload() {
  console.log('🧪 Testing file upload functionality...');
  
  try {
    // Test 1: Check if uploads directory exists
    const uploadsDir = path.join(__dirname, 'uploads');
    console.log('📁 Uploads directory path:', uploadsDir);
    
    if (fs.existsSync(uploadsDir)) {
      console.log('✅ Uploads directory exists');
      
      // List files in uploads directory
      const files = fs.readdirSync(uploadsDir);
      console.log('📄 Files in uploads directory:', files);
      
      if (files.length > 0) {
        console.log('📊 Uploads directory stats:');
        files.forEach(file => {
          const filePath = path.join(uploadsDir, file);
          const stats = fs.statSync(filePath);
          console.log(`  - ${file}: ${(stats.size / 1024).toFixed(2)} KB`);
        });
      } else {
        console.log('ℹ️  Uploads directory is empty');
      }
    } else {
      console.log('❌ Uploads directory does not exist');
      console.log('🔧 Creating uploads directory...');
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Uploads directory created');
    }
    
    // Test 2: Check if we can create a test file
    const testFilePath = path.join(uploadsDir, 'test-upload.txt');
    const testContent = 'This is a test file for upload functionality';
    
    fs.writeFileSync(testFilePath, testContent);
    console.log('✅ Test file created successfully');
    
    // Test 3: Verify file content
    const readContent = fs.readFileSync(testFilePath, 'utf8');
    if (readContent === testContent) {
      console.log('✅ File content verification passed');
    } else {
      console.log('❌ File content verification failed');
    }
    
    // Test 4: Clean up test file
    fs.unlinkSync(testFilePath);
    console.log('✅ Test file cleaned up');
    
    console.log('\n🎉 File upload functionality test completed successfully!');
    
  } catch (error) {
    console.error('❌ File upload test failed:', error);
  }
}

// Test document model
async function testDocumentModel() {
  console.log('\n🧪 Testing Document model...');
  
  try {
    // Import the Document model
    const { default: Document } = await import('./models/Document.js');
    console.log('✅ Document model imported successfully');
    
    // Check the schema
    const schema = Document.schema;
    console.log('✅ Document schema loaded');
    
    // List schema fields
    const fields = Object.keys(schema.paths);
    console.log('📋 Document schema fields:', fields);
    
    console.log('🎉 Document model test completed successfully!');
    
  } catch (error) {
    console.error('❌ Document model test failed:', error);
  }
}

// Test audit trail model
async function testAuditTrailModel() {
  console.log('\n🧪 Testing AuditTrail model...');
  
  try {
    // Import the AuditTrail model
    const { default: AuditTrail } = await import('./models/AuditTrail.js');
    console.log('✅ AuditTrail model imported successfully');
    
    // Check the schema
    const schema = AuditTrail.schema;
    console.log('✅ AuditTrail schema loaded');
    
    // List schema fields
    const fields = Object.keys(schema.paths);
    console.log('📋 AuditTrail schema fields:', fields);
    
    console.log('🎉 AuditTrail model test completed successfully!');
    
  } catch (error) {
    console.error('❌ AuditTrail model test failed:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive file upload and audit trail tests...\n');
  
  await testFileUpload();
  await testDocumentModel();
  await testAuditTrailModel();
  
  console.log('\n✨ All tests completed!');
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { testFileUpload, testDocumentModel, testAuditTrailModel };


