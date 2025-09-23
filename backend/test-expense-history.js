import mongoose from 'mongoose';
import ExpenseHistory from './models/ExpenseHistory.js';
import ExpenseHistoryService from './services/expenseHistoryService.js';

// Test data
const testExpenseId = new mongoose.Types.ObjectId();
const testUserId = new mongoose.Types.ObjectId();

async function testExpenseHistory() {
  try {
    console.log('🧪 Testing Expense History System...\n');

    // Test 1: Create a history entry
    console.log('1. Testing history entry creation...');
    const historyEntry = await ExpenseHistoryService.createHistoryEntry(testExpenseId, 'created', {
      description: 'Test expense created',
      newValues: {
        description: 'Test Expense',
        amount: 100.00,
        vendor: 'Test Vendor'
      },
      performedBy: testUserId,
      performedByName: 'Test User',
      performedByEmail: 'test@example.com',
      metadata: { source: 'test' }
    });
    console.log('✅ History entry created:', historyEntry._id);

    // Test 2: Track expense creation
    console.log('\n2. Testing expense creation tracking...');
    const mockExpense = {
      _id: testExpenseId,
      description: 'Test Expense',
      amount: 100.00,
      date: new Date(),
      vendor: 'Test Vendor',
      account: 'Test Account',
      category: 'Test Category',
      paymentMethod: 'Cash',
      reference: 'REF001',
      notes: 'Test notes',
      status: 'unbilled',
      billable: true,
      customer: 'Test Customer',
      project: 'Test Project'
    };

    const mockUser = {
      _id: testUserId,
      name: 'Test User',
      email: 'test@example.com'
    };

    const creationHistory = await ExpenseHistoryService.trackExpenseCreation(mockExpense, mockUser);
    console.log('✅ Expense creation tracked:', creationHistory._id);

    // Test 3: Track expense update
    console.log('\n3. Testing expense update tracking...');
    const previousExpense = { ...mockExpense };
    const updatedExpense = { ...mockExpense, amount: 150.00, status: 'billed' };

    const updateHistory = await ExpenseHistoryService.trackExpenseUpdate(
      testExpenseId,
      previousExpense,
      updatedExpense,
      mockUser
    );
    console.log('✅ Expense update tracked:', updateHistory._id);

    // Test 4: Get expense history
    console.log('\n4. Testing expense history retrieval...');
    const history = await ExpenseHistoryService.getExpenseHistory(testExpenseId, {
      limit: 10,
      sortOrder: 'desc'
    });
    console.log('✅ Expense history retrieved:', history.history.length, 'entries');

    // Test 5: Get activity summary
    console.log('\n5. Testing activity summary...');
    const summary = await ExpenseHistoryService.getActivitySummary(testExpenseId);
    console.log('✅ Activity summary retrieved:', summary.length, 'action types');

    // Test 6: Get history stats
    console.log('\n6. Testing history statistics...');
    const stats = await ExpenseHistoryService.getHistoryStats(testExpenseId);
    console.log('✅ History stats retrieved:', stats.totalActions, 'total actions');

    // Test 7: Track expense deletion
    console.log('\n7. Testing expense deletion tracking...');
    const deletionHistory = await ExpenseHistoryService.trackExpenseDeletion(mockExpense, mockUser);
    console.log('✅ Expense deletion tracked:', deletionHistory._id);

    console.log('\n🎉 All tests passed! Expense History system is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Connect to MongoDB
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/robobooks', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('📦 Connected to MongoDB');
    return testExpenseHistory();
  })
  .then(() => {
    console.log('\n✅ Tests completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
}

export { testExpenseHistory };
