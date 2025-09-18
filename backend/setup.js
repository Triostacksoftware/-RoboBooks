#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 RoboBooks Backend Setup\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env file...');
  
  const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/robobooks
MONGODB_DB=robobooks

# JWT Secret (generate a strong secret in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Configuration
CLIENT_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Google OAuth (optional - for Google login)
GOOGLE_CLIENT_ID=your-google-client-id-here
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('⚠️  Please update the JWT_SECRET and other values as needed.\n');
} else {
  console.log('✅ .env file already exists\n');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  console.log('Run: npm install\n');
} else {
  console.log('✅ Dependencies are installed\n');
}

console.log('🚀 To start the server:');
console.log('   npm start\n');

console.log('📋 Next steps:');
console.log('   1. Make sure MongoDB is running');
console.log('   2. Update the .env file with your configuration');
console.log('   3. Run: npm start');
console.log('   4. The API will be available at http://localhost:5000\n');

console.log('🔗 Frontend should be configured with:');
console.log('   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000\n'); 


