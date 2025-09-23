import mongoose from 'mongoose';
import BankAccount from './models/BankAccount.js';
import BankTransaction from './models/BankTransaction.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/robobooks', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const sampleTransactions = [
  // Credit transactions (deposits, income, etc.)
  { description: 'Salary Credit', amount: 75000, type: 'credit', category: 'income', referenceNumber: 'SAL-2025-001' },
  { description: 'Freelance Payment', amount: 25000, type: 'credit', category: 'income', referenceNumber: 'FL-2025-001' },
  { description: 'Investment Returns', amount: 15000, type: 'credit', category: 'investment', referenceNumber: 'INV-2025-001' },
  { description: 'Refund - Amazon', amount: 2500, type: 'credit', category: 'refund', referenceNumber: 'REF-2025-001' },
  { description: 'Cashback Credit', amount: 500, type: 'credit', category: 'cashback', referenceNumber: 'CB-2025-001' },
  { description: 'Interest Earned', amount: 1200, type: 'credit', category: 'interest', referenceNumber: 'INT-2025-001' },
  { description: 'Bonus Payment', amount: 18000, type: 'credit', category: 'income', referenceNumber: 'BON-2025-001' },
  { description: 'Rental Income', amount: 22000, type: 'credit', category: 'income', referenceNumber: 'RENT-2025-001' },
  { description: 'Dividend Payment', amount: 3500, type: 'credit', category: 'investment', referenceNumber: 'DIV-2025-001' },
  { description: 'Gift Received', amount: 5000, type: 'credit', category: 'gift', referenceNumber: 'GIFT-2025-001' },

  // Debit transactions (expenses, bills, etc.)
  { description: 'Grocery Shopping', amount: 3500, type: 'debit', category: 'food', referenceNumber: 'GRC-2025-001' },
  { description: 'Electricity Bill', amount: 2800, type: 'debit', category: 'utilities', referenceNumber: 'ELEC-2025-001' },
  { description: 'Internet Bill', amount: 1200, type: 'debit', category: 'utilities', referenceNumber: 'NET-2025-001' },
  { description: 'Mobile Recharge', amount: 599, type: 'debit', category: 'utilities', referenceNumber: 'MOB-2025-001' },
  { description: 'Fuel Payment', amount: 2500, type: 'debit', category: 'transport', referenceNumber: 'FUEL-2025-001' },
  { description: 'Restaurant Bill', amount: 1800, type: 'debit', category: 'food', referenceNumber: 'REST-2025-001' },
  { description: 'Movie Tickets', amount: 600, type: 'debit', category: 'entertainment', referenceNumber: 'MOV-2025-001' },
  { description: 'Online Shopping', amount: 4500, type: 'debit', category: 'shopping', referenceNumber: 'SHOP-2025-001' },
  { description: 'Medical Checkup', amount: 3200, type: 'debit', category: 'healthcare', referenceNumber: 'MED-2025-001' },
  { description: 'Insurance Premium', amount: 8500, type: 'debit', category: 'insurance', referenceNumber: 'INS-2025-001' },
  { description: 'EMI Payment', amount: 15000, type: 'debit', category: 'loan', referenceNumber: 'EMI-2025-001' },
  { description: 'Credit Card Bill', amount: 12000, type: 'debit', category: 'credit_card', referenceNumber: 'CC-2025-001' },
  { description: 'Gym Membership', amount: 2000, type: 'debit', category: 'fitness', referenceNumber: 'GYM-2025-001' },
  { description: 'Coffee Shop', amount: 350, type: 'debit', category: 'food', referenceNumber: 'COF-2025-001' },
  { description: 'Taxi Fare', amount: 450, type: 'debit', category: 'transport', referenceNumber: 'TAXI-2025-001' },
  { description: 'Book Purchase', amount: 1200, type: 'debit', category: 'education', referenceNumber: 'BOOK-2025-001' },
  { description: 'Charity Donation', amount: 1000, type: 'debit', category: 'charity', referenceNumber: 'CHAR-2025-001' },
  { description: 'Home Maintenance', amount: 5500, type: 'debit', category: 'maintenance', referenceNumber: 'MAINT-2025-001' },
  { description: 'Bank Charges', amount: 200, type: 'debit', category: 'fees', referenceNumber: 'FEE-2025-001' },
  { description: 'ATM Withdrawal', amount: 5000, type: 'debit', category: 'cash', referenceNumber: 'ATM-2025-001' },
];

async function createMoreTransactions() {
  try {
    console.log('🔍 Looking for existing bank account...');
    
    // Find the first bank account
    const bankAccount = await BankAccount.findOne();
    
    if (!bankAccount) {
      console.log('❌ No bank account found. Please create a bank account first.');
      return;
    }

    console.log(`✅ Found bank account: ${bankAccount.name}`);

    // Create 60 transactions (to test pagination with 2 pages)
    const transactionsToCreate = [];
    const baseDate = new Date();
    
    for (let i = 0; i < 60; i++) {
      const transactionTemplate = sampleTransactions[i % sampleTransactions.length];
      const transactionDate = new Date(baseDate);
      transactionDate.setDate(transactionDate.getDate() - i);
      
      // Fix amount based on transaction type
      const amount = transactionTemplate.type === 'debit' 
        ? -Math.abs(transactionTemplate.amount)  // Negative for debits
        : Math.abs(transactionTemplate.amount);  // Positive for credits

      const transaction = new BankTransaction({
        ...transactionTemplate,
        amount: amount,  // Use corrected amount
        accountId: bankAccount._id,
        userId: bankAccount.userId,
        transactionDate: transactionDate,
        date: transactionDate,
        status: i % 3 === 0 ? 'reconciled' : (i % 3 === 1 ? 'pending' : 'uncategorized'),
        importSource: i % 2 === 0 ? 'excel' : 'manual',  // Fix case
        payee: i % 2 === 0 ? `Payee ${i + 1}` : undefined,
        createdBy: 'User',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      transactionsToCreate.push(transaction);
    }

    // Insert all transactions
    await BankTransaction.insertMany(transactionsToCreate);
    
    console.log(`✅ Created ${transactionsToCreate.length} sample transactions`);
    
    // Update account balance
    const totalCredits = transactionsToCreate
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalDebits = transactionsToCreate
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    bankAccount.balance = bankAccount.balance + totalCredits - totalDebits;
    await bankAccount.save();
    
    console.log(`💰 Updated account balance to ₹${bankAccount.balance.toLocaleString('en-IN')}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating transactions:', error);
    process.exit(1);
  }
}

createMoreTransactions();
