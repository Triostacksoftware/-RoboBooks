#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Clearing Next.js cache and optimizing compilation...\n');

const cacheDirs = [
  '.next',
  '.turbo',
  'node_modules/.cache',
  'dist',
  'out'
];

const currentDir = process.cwd();

// Function to remove directory recursively
function removeDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Removed: ?{dirPath}`);
    } catch (error) {
      console.log(`⚠️  Could not remove ?{dirPath}: ?{error.message}`);
    }
  } else {
    console.log(`ℹ️  Directory not found: ?{dirPath}`);
  }
}

// Clear all cache directories
console.log('📁 Clearing cache directories...');
cacheDirs.forEach(dir => {
  const fullPath = path.join(currentDir, dir);
  removeDir(fullPath);
});

// Clear npm cache
console.log('\n📦 Clearing npm cache...');
try {
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ npm cache cleared');
} catch (error) {
  console.log('⚠️  Could not clear npm cache');
}

// Clear Next.js cache
console.log('\n🚀 Clearing Next.js cache...');
try {
  execSync('npx next clear', { stdio: 'inherit' });
  console.log('✅ Next.js cache cleared');
} catch (error) {
  console.log('⚠️  Could not clear Next.js cache');
}

// Reinstall dependencies if node_modules is corrupted
const nodeModulesPath = path.join(currentDir, 'node_modules');
if (!fs.existsSync(nodeModulesPath) || !fs.existsSync(path.join(nodeModulesPath, 'package.json'))) {
  console.log('\n📥 Reinstalling dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies reinstalled');
  } catch (error) {
    console.log('⚠️  Could not reinstall dependencies');
  }
}

console.log('\n🎉 Cache clearing complete!');
console.log('\n💡 Next steps:');
console.log('   1. Run: npm run dev:fast (for turbopack mode)');
console.log('   2. Run: npm run dev (for regular mode)');
console.log('   3. Run: npm run build:fast (for fast builds)');

console.log('\n🚀 Your Next.js app should now compile much faster!');
