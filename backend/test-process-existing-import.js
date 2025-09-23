import mongoose from 'mongoose';
import BankStatementImport from './models/BankStatementImport.js';
import fileProcessingService from './services/fileProcessingService.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/robobooks');

async function testProcessExistingImport() {
  try {
    console.log('🔍 Testing existing Excel import processing...');
    
    // Get the most recent Excel import
    const importRecord = await BankStatementImport.findOne({
      fileType: 'excel'
    }).sort({ createdAt: -1 });

    if (!importRecord) {
      console.log('❌ No Excel import found');
      return;
    }

    console.log(`✅ Found Excel import: ${importRecord.fileName}`);
    console.log(`📊 Import status: ${importRecord.importStatus}`);
    console.log(`📊 Total rows: ${importRecord.totalRows}`);
    console.log(`📊 Field mapping:`, importRecord.fieldMapping);
    
    // Show sample raw data
    console.log('\n📋 Sample raw data (first 3 rows):');
    importRecord.processedData.slice(0, 3).forEach((row, index) => {
      console.log(`  Row ${index + 1}:`, row);
    });

    // Test processing with current field mapping
    console.log('\n🔄 Testing processing with current field mapping:');
    const processedData = importRecord.processedData.map((row, index) => {
      const processed = {};
      
      console.log(`\nProcessing row ${index + 1}:`);
      console.log('  Original:', row);
      
      // Date mapping
      if (importRecord.fieldMapping.date && row[importRecord.fieldMapping.date]) {
        const dateStr = String(row[importRecord.fieldMapping.date]).trim();
        let parsedDate;

        if (dateStr.includes('-') && dateStr.split('-').length === 3) {
          const parts = dateStr.split('-');
          if (parts[0].length === 2 && parts[1].length === 2) {
            parsedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
          } else {
            parsedDate = new Date(dateStr);
          }
        } else {
          parsedDate = new Date(dateStr);
        }
        
        processed.date = !isNaN(parsedDate.getTime()) ? parsedDate : new Date();
      } else {
        processed.date = new Date();
      }

      // Description mapping
      processed.description = fileProcessingService.generateDescription(row, importRecord.fieldMapping);

      // Payee mapping
      processed.payee = importRecord.fieldMapping.payee && row[importRecord.fieldMapping.payee]
        ? String(row[importRecord.fieldMapping.payee]).trim()
        : '';

      // Reference Number mapping
      processed.referenceNumber = importRecord.fieldMapping.referenceNumber && row[importRecord.fieldMapping.referenceNumber]
        ? String(row[importRecord.fieldMapping.referenceNumber]).trim()
        : '';

      // Category mapping
      processed.category = importRecord.fieldMapping.category && row[importRecord.fieldMapping.category]
        ? String(row[importRecord.fieldMapping.category]).trim()
        : '';

      // Status mapping
      processed.status = importRecord.fieldMapping.status && row[importRecord.fieldMapping.status]
        ? String(row[importRecord.fieldMapping.status]).trim()
        : 'pending';

      // Amount parsing
      const parseAmount = fileProcessingService.parseAmount.bind(fileProcessingService);

      // Handle withdrawals (debit amounts)
      const withdrawalKey = importRecord.fieldMapping.withdrawals;
      const withdrawalValue = withdrawalKey ? row[withdrawalKey] : null;
      processed.withdrawals = parseAmount(withdrawalValue);

      // Handle deposits (credit amounts)
      const depositKey = importRecord.fieldMapping.deposits;
      const depositValue = depositKey ? row[depositKey] : null;
      processed.deposits = parseAmount(depositValue);

      console.log(`  Withdrawal key: "${withdrawalKey}", value: "${withdrawalValue}", parsed: ${processed.withdrawals}`);
      console.log(`  Deposit key: "${depositKey}", value: "${depositValue}", parsed: ${processed.deposits}`);

      // Determine final amount and type
      if (processed.withdrawals > 0) {
        processed.amount = -processed.withdrawals;
        processed.type = 'debit';
      } else if (processed.deposits > 0) {
        processed.amount = processed.deposits;
        processed.type = 'credit';
      } else {
        // Check if there are any non-zero values in debit/credit columns
        const hasDebit = withdrawalValue && parseFloat(withdrawalValue) > 0;
        const hasCredit = depositValue && parseFloat(depositValue) > 0;
        
        if (hasDebit) {
          processed.amount = -parseFloat(withdrawalValue);
          processed.type = 'debit';
        } else if (hasCredit) {
          processed.amount = parseFloat(depositValue);
          processed.type = 'credit';
        } else {
          processed.amount = 0;
          processed.type = 'unknown';
        }
      }

      processed.status = 'ready';
      processed.errors = [];

      console.log('  Processed:', processed);
      return processed;
    });

    const readyRows = processedData.filter(row => row.status === 'ready' && row.amount !== 0);
    console.log(`\n📊 Processing results:`);
    console.log(`  Total rows: ${processedData.length}`);
    console.log(`  Ready rows: ${readyRows.length}`);
    console.log(`  Ready rows with amounts: ${readyRows.length}`);

    if (readyRows.length > 0) {
      console.log('\n📋 Sample ready rows:');
      readyRows.slice(0, 5).forEach((row, index) => {
        console.log(`  ${index + 1}. ${row.description} - ₹${row.amount} (${row.type})`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing existing import:', error);
    process.exit(1);
  }
}

testProcessExistingImport();
