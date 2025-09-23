import mongoose from 'mongoose';
import BankTransaction from './models/BankTransaction.js';
import BankAccount from './models/BankAccount.js';
import BankStatementImport from './models/BankStatementImport.js';
import fileProcessingService from './services/fileProcessingService.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/robobooks');

async function testExcelImport() {
  try {
    console.log('🔍 Testing Excel import process...');
    
    // Get a bank account
    const bankAccount = await BankAccount.findOne();
    if (!bankAccount) {
      console.log('❌ No bank account found');
      return;
    }

    console.log(`✅ Found bank account: ${bankAccount.name} (ID: ${bankAccount._id})`);

    // Check existing Excel imports
    const excelImports = await BankStatementImport.find({ 
      accountId: bankAccount._id,
      fileType: 'excel'
    });

    console.log(`📊 Existing Excel imports: ${excelImports.length}`);
    
    if (excelImports.length > 0) {
      console.log('\n📋 Excel imports:');
      excelImports.forEach((imp, index) => {
        console.log(`${index + 1}. ${imp.fileName} - Status: ${imp.importStatus}`);
        console.log(`   Total Rows: ${imp.totalRows} | Imported: ${imp.importedRows} | Errors: ${imp.errorRows}`);
        console.log(`   Field Mapping:`, imp.fieldMapping);
        console.log(`   Processed Data Sample:`, imp.processedData.slice(0, 2));
        console.log(`   Created: ${imp.createdAt}`);
      });

      // Check if any Excel imports have processedData with ready status
      for (const imp of excelImports) {
        const readyRows = imp.processedData.filter(row => row.status === 'ready' && row.amount !== 0);
        console.log(`\n📊 Import "${imp.fileName}" ready rows: ${readyRows.length}/${imp.processedData.length}`);
        
        if (readyRows.length > 0) {
          console.log('📋 Sample ready rows:');
          readyRows.slice(0, 3).forEach((row, idx) => {
            console.log(`  ${idx + 1}. ${row.description} - ₹${row.amount} (${row.type})`);
            console.log(`     Date: ${row.date} | Withdrawals: ${row.withdrawals} | Deposits: ${row.deposits}`);
          });
        }
      }
    }

    // Check Excel transactions in database
    const excelTransactions = await BankTransaction.find({ 
      accountId: bankAccount._id,
      importSource: 'excel'
    });

    console.log(`\n📊 Excel transactions in database: ${excelTransactions.length}`);
    
    if (excelTransactions.length > 0) {
      console.log('\n📋 Excel transactions:');
      excelTransactions.slice(0, 5).forEach((txn, index) => {
        console.log(`${index + 1}. ${txn.description} - ₹${txn.amount} (${txn.type})`);
        console.log(`   Date: ${txn.date} | Import Batch: ${txn.importBatchId}`);
      });
    }

    // Check total transactions by import source
    const transactionSources = await BankTransaction.aggregate([
      { $match: { accountId: bankAccount._id } },
      { $group: { _id: '$importSource', count: { $sum: 1 } } }
    ]);

    console.log('\n📊 Transactions by import source:');
    transactionSources.forEach(source => {
      console.log(`  ${source._id}: ${source.count} transactions`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing Excel import:', error);
    process.exit(1);
  }
}

testExcelImport();

