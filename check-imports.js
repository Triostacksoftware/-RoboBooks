const mongoose = require('mongoose');
require('dotenv').config();

// Import the model
const BankStatementImport = require('./backend/models/BankStatementImport.js');

async function checkImports() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const imports = await BankStatementImport.find().sort({ createdAt: -1 }).limit(3);
    console.log(`\n📋 Found ${imports.length} import records:`);
    
    imports.forEach((importRecord, index) => {
      console.log(`\n--- Import Record ${index + 1} ---`);
      console.log(`ID: ${importRecord._id}`);
      console.log(`File: ${importRecord.fileName}`);
      console.log(`Status: ${importRecord.importStatus}`);
      console.log(`Total Rows: ${importRecord.totalRows}`);
      console.log(`Field Mapping:`, JSON.stringify(importRecord.fieldMapping, null, 2));
      console.log(`Sample Raw Data:`, JSON.stringify(importRecord.processedData.slice(0, 2), null, 2));
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

checkImports();
