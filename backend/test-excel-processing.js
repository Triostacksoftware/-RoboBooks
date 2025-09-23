import fileProcessingService from './services/fileProcessingService.js';
import path from 'path';

async function testExcelProcessing() {
  try {
    console.log('🔍 Testing Excel processing...');
    
    const testFile = 'test-banking-transactions.xlsx';
    console.log('📁 Processing test file:', testFile);
    
    // Test file processing
    const data = await fileProcessingService.processFile(testFile, 'excel');
    console.log('📊 Processed data length:', data.length);
    console.log('📊 Processed data:', data);
    
    // Test header extraction
    const headers = fileProcessingService.extractHeaders(data);
    console.log('📋 Extracted headers:', headers);
    
    // Test auto-mapping
    const autoMapping = fileProcessingService.autoMapFields(headers);
    console.log('🔍 Auto-mapping result:', autoMapping);
    
    // Test amount parsing
    console.log('\n🧮 Testing amount parsing:');
    const testAmounts = ['5000', '2500.50', '15,000', '(3200)', '-1500', '₹25,000.75'];
    testAmounts.forEach(amount => {
      const parsed = fileProcessingService.parseAmount(amount);
      console.log(`  "${amount}" → ${parsed}`);
    });
    
    // Test description generation
    console.log('\n📝 Testing description generation:');
    const testRow = {
      'Narration': 'ATM Withdrawal',
      'Reference': 'REF-001'
    };
    const testMapping = {
      description: 'Narration',
      referenceNumber: 'Reference'
    };
    const description = fileProcessingService.generateDescription(testRow, testMapping);
    console.log(`  Generated description: "${description}"`);
    
    // Test full processing simulation
    console.log('\n🔄 Testing full processing simulation:');
    data.forEach((row, index) => {
      console.log(`\nRow ${index + 1}:`);
      console.log('  Original:', row);
      
      // Process with auto-mapping
      const processed = {
        date: row[autoMapping.date] ? new Date(row[autoMapping.date]) : new Date(),
        description: fileProcessingService.generateDescription(row, autoMapping),
        withdrawals: fileProcessingService.parseAmount(row[autoMapping.withdrawals]),
        deposits: fileProcessingService.parseAmount(row[autoMapping.deposits]),
        referenceNumber: row[autoMapping.referenceNumber] || '',
        payee: row[autoMapping.payee] || '',
        category: row[autoMapping.category] || '',
        status: row[autoMapping.status] || 'pending'
      };
      
      // Determine amount and type
      if (processed.withdrawals > 0) {
        processed.amount = -processed.withdrawals;
        processed.type = 'debit';
      } else if (processed.deposits > 0) {
        processed.amount = processed.deposits;
        processed.type = 'credit';
      } else {
        processed.amount = 0;
        processed.type = 'unknown';
      }
      
      processed.status = 'ready';
      
      console.log('  Processed:', processed);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing Excel processing:', error);
    process.exit(1);
  }
}

testExcelProcessing();

