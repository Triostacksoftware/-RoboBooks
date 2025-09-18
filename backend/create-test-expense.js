import mongoose from 'mongoose';
import Expense from './models/Expense.js';
import dotenv from 'dotenv';

dotenv.config();

async function createTestExpense() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create a test expense
    const testExpense = new Expense({
      date: new Date(),
      description: 'Test Office Supplies',
      amount: 150.00,
      vendor: 'Test Vendor',
      account: 'Office Supplies',
      category: 'Office Supplies',
      paymentMethod: 'Credit Card',
      reference: 'TEST-001',
      notes: 'Test expense for editing functionality',
      status: 'unbilled',
      hasReceipt: false,
      billable: true,
      customer: null,
      project: null,
      organization: '68c6a46a3bff541520f65e2a', // Use the authenticated user's organization
      createdBy: '68c6a46a3bff541520f65e2a',
      updatedBy: '68c6a46a3bff541520f65e2a'
    });

    const savedExpense = await testExpense.save();
    console.log('✅ Test expense created successfully!');
    console.log('Expense ID:', savedExpense._id);
    console.log('Expense details:', {
      description: savedExpense.description,
      amount: savedExpense.amount,
      vendor: savedExpense.vendor,
      status: savedExpense.status
    });

    // List all expenses
    const allExpenses = await Expense.find({ organization: '68c6a46a3bff541520f65e2a' });
    console.log(`\n📋 Total expenses in database: ${allExpenses.length}`);
    allExpenses.forEach((expense, index) => {
      console.log(`${index + 1}. ${expense.description} - ${expense.amount} (ID: ${expense._id})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createTestExpense();


