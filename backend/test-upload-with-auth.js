import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000';

async function testUploadWithAuth() {
  try {
    console.log('🧪 Testing upload with authentication...');

    // Step 1: Login to get session cookie
    console.log('\n1. Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailOrPhone: 'test@example.com',
        password: 'password123'
      }),
    });

    console.log('Login status:', loginResponse.status);
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed, trying to create a test user...');
      // Try to create a test user first
      const signupResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: 'Test Company',
          email: 'test@example.com',
          phone: '+1234567890',
          password: 'password123',
          country: 'US',
          state: 'CA'
        }),
      });

      if (signupResponse.ok) {
        console.log('✅ Test user created, trying login again...');
        const loginResponse2 = await fetch(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            emailOrPhone: 'test@example.com',
            password: 'password123'
          }),
        });
        
        if (!loginResponse2.ok) {
          throw new Error('Login failed after user creation');
        }
      } else {
        throw new Error('Both signup and login failed');
      }
    }

    // Get cookies from login response
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Cookies received:', cookies);

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

    console.log('\n2. Attempting upload with authentication...');
    
    const uploadResponse = await fetch(`${BASE_URL}/api/documents/upload`, {
      method: 'POST',
      headers: {
        'Cookie': cookies || '',
      },
      body: formData,
    });

    console.log('📊 Upload response status:', uploadResponse.status);
    console.log('📊 Upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));

    if (uploadResponse.ok) {
      const result = await uploadResponse.json();
      console.log('✅ Upload successful:', result);
    } else {
      const errorData = await uploadResponse.json();
      console.log('❌ Upload failed:', errorData);
    }

    // Clean up test file
    fs.unlinkSync(testFilePath);

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUploadWithAuth();
