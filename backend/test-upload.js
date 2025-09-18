import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000';

async function testUpload() {
  try {
    console.log('🧪 Testing upload endpoint...');

    // Create a test file
    const testFilePath = path.join(process.cwd(), 'test-file.txt');
    fs.writeFileSync(testFilePath, 'This is a test file for upload testing.');

    // Create form data
    const formData = new FormData();
    formData.append('document', fs.createReadStream(testFilePath));
    formData.append('title', 'Test Document');
    formData.append('description', 'Test upload from script');
    formData.append('documentType', 'other');
    formData.append('category', 'other');
    formData.append('tags', 'test, upload');
    formData.append('isPublic', 'false');

    console.log('📤 Attempting upload...');
    
    const response = await fetch(`${BASE_URL}/api/documents/upload`, {
      method: 'POST',
      body: formData,
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Upload successful:', result);
    } else {
      const errorData = await response.json();
      console.log('❌ Upload failed:', errorData);
    }

    // Clean up test file
    fs.unlinkSync(testFilePath);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUpload();


