// Script to seed currency data for testing
import mongoose from 'mongoose';
import CurrencyRate from '../models/CurrencyRate.js';
import CurrencyAdjustment from '../models/CurrencyAdjustment.js';
import Account from '../models/Account.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/robobooks');
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedCurrencyData = async () => {
  try {
    console.log('🌱 Seeding currency data...');

    // Find a test user
    const testUser = await User.findOne({ email: 'user@robobooks.com' });
    if (!testUser) {
      console.log('❌ No test user found. Please create a user first.');
      return;
    }

    console.log(`👤 Using test user: ${testUser.email}`);

    // Clear existing currency data
    await CurrencyRate.deleteMany({ userId: testUser._id });
    await CurrencyAdjustment.deleteMany({ userId: testUser._id });

    // Create sample exchange rates
    const exchangeRates = [
      {
        fromCurrency: 'USD',
        toCurrency: 'INR',
        rate: 83.25,
        date: new Date(),
        source: 'RBI',
        isActive: true,
        userId: testUser._id,
        notes: 'Current RBI exchange rate'
      },
      {
        fromCurrency: 'EUR',
        toCurrency: 'INR',
        rate: 90.50,
        date: new Date(),
        source: 'RBI',
        isActive: true,
        userId: testUser._id,
        notes: 'Current RBI exchange rate'
      },
      {
        fromCurrency: 'GBP',
        toCurrency: 'INR',
        rate: 105.75,
        date: new Date(),
        source: 'RBI',
        isActive: true,
        userId: testUser._id,
        notes: 'Current RBI exchange rate'
      },
      {
        fromCurrency: 'USD',
        toCurrency: 'EUR',
        rate: 0.92,
        date: new Date(),
        source: 'MANUAL',
        isActive: true,
        userId: testUser._id,
        notes: 'Manual entry'
      }
    ];

    const createdRates = await CurrencyRate.insertMany(exchangeRates);
    console.log(`✅ Created ${createdRates.length} exchange rates`);

    // Find some accounts for adjustments
    const accounts = await Account.find({ userId: testUser._id }).limit(3);
    if (accounts.length === 0) {
      console.log('⚠️ No accounts found. Creating sample accounts...');
      
      const sampleAccounts = [
        {
          code: '10010001',
          name: 'Bank Account - USD',
          accountHead: 'asset',
          accountGroup: 'bank',
          openingBalance: 10000,
          balance: 10000,
          balanceType: 'debit',
          currency: 'USD',
          isActive: true,
          userId: testUser._id
        },
        {
          code: '10010002',
          name: 'Accounts Receivable - EUR',
          accountHead: 'asset',
          accountGroup: 'accounts_receivable',
          openingBalance: 5000,
          balance: 5000,
          balanceType: 'debit',
          currency: 'EUR',
          isActive: true,
          userId: testUser._id
        },
        {
          code: '10010003',
          name: 'Cash Account - GBP',
          accountHead: 'asset',
          accountGroup: 'cash',
          openingBalance: 2000,
          balance: 2000,
          balanceType: 'debit',
          currency: 'GBP',
          isActive: true,
          userId: testUser._id
        }
      ];

      const createdAccounts = await Account.insertMany(sampleAccounts);
      console.log(`✅ Created ${createdAccounts.length} sample accounts`);
      accounts.push(...createdAccounts);
    }

    // Create sample currency adjustments
    const currencyAdjustments = [
      {
        accountId: accounts[0]._id,
        accountName: accounts[0].name,
        fromCurrency: 'USD',
        toCurrency: 'INR',
        originalAmount: 1000,
        convertedAmount: 83250,
        exchangeRate: 83.25,
        adjustmentDate: new Date(),
        description: 'Monthly currency adjustment for USD account',
        status: 'approved',
        adjustmentType: 'gain',
        amount: 250,
        userId: testUser._id,
        approvedBy: testUser._id,
        approvedAt: new Date()
      },
      {
        accountId: accounts[1]._id,
        accountName: accounts[1].name,
        fromCurrency: 'EUR',
        toCurrency: 'INR',
        originalAmount: 500,
        convertedAmount: 45250,
        exchangeRate: 90.50,
        adjustmentDate: new Date(),
        description: 'Foreign exchange gain on EUR receivables',
        status: 'pending',
        adjustmentType: 'gain',
        amount: 250,
        userId: testUser._id
      },
      {
        accountId: accounts[2]._id,
        accountName: accounts[2].name,
        fromCurrency: 'GBP',
        toCurrency: 'INR',
        originalAmount: 200,
        convertedAmount: 21150,
        exchangeRate: 105.75,
        adjustmentDate: new Date(),
        description: 'Currency conversion for GBP cash account',
        status: 'approved',
        adjustmentType: 'loss',
        amount: -50,
        userId: testUser._id,
        approvedBy: testUser._id,
        approvedAt: new Date()
      }
    ];

    const createdAdjustments = await CurrencyAdjustment.insertMany(currencyAdjustments);
    console.log(`✅ Created ${createdAdjustments.length} currency adjustments`);

    console.log('\n🎉 Currency data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Exchange Rates: ${createdRates.length}`);
    console.log(`- Currency Adjustments: ${createdAdjustments.length}`);
    console.log(`- Accounts: ${accounts.length}`);

  } catch (error) {
    console.error('❌ Error seeding currency data:', error);
  }
};

const main = async () => {
  await connectDB();
  await seedCurrencyData();
  await mongoose.connection.close();
  console.log('\n✅ Database connection closed');
  process.exit(0);
};

main();
