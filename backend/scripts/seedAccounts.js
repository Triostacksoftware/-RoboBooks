import mongoose from 'mongoose';
import Account from '../models/Account.js';
import dotenv from 'dotenv';

dotenv.config();

const defaultAccounts = [
  // Assets
  {
    name: "Cash",
    category: "asset",
    subtype: "cash",
    code: "1001",
    opening_balance: 0,
    currency: "INR",
    description: "Cash on hand and in bank accounts"
  },
  {
    name: "Bank Account",
    category: "asset",
    subtype: "bank",
    code: "1002",
    opening_balance: 0,
    currency: "INR",
    description: "Main bank account"
  },
  {
    name: "Accounts Receivable",
    category: "asset",
    subtype: "accounts_receivable",
    code: "1100",
    opening_balance: 0,
    currency: "INR",
    description: "Money owed by customers"
  },
  {
    name: "Inventory",
    category: "asset",
    subtype: "inventory",
    code: "1200",
    opening_balance: 0,
    currency: "INR",
    description: "Stock and inventory items"
  },
  {
    name: "Fixed Assets",
    category: "asset",
    subtype: "fixed_asset",
    code: "1500",
    opening_balance: 0,
    currency: "INR",
    description: "Equipment, furniture, and other fixed assets"
  },

  // Liabilities
  {
    name: "Accounts Payable",
    category: "liability",
    subtype: "accounts_payable",
    code: "2000",
    opening_balance: 0,
    currency: "INR",
    description: "Money owed to suppliers and vendors"
  },
  {
    name: "Credit Card",
    category: "liability",
    subtype: "credit_card",
    code: "2100",
    opening_balance: 0,
    currency: "INR",
    description: "Credit card balances"
  },
  {
    name: "Tax Payable",
    category: "liability",
    subtype: "current_liability",
    code: "2200",
    opening_balance: 0,
    currency: "INR",
    description: "Taxes owed to government"
  },

  // Equity
  {
    name: "Owner's Equity",
    category: "equity",
    subtype: "owner_equity",
    code: "3000",
    opening_balance: 0,
    currency: "INR",
    description: "Owner's investment in the business"
  },
  {
    name: "Retained Earnings",
    category: "equity",
    subtype: "retained_earnings",
    code: "3100",
    opening_balance: 0,
    currency: "INR",
    description: "Accumulated profits"
  },

  // Income
  {
    name: "Sales Revenue",
    category: "income",
    subtype: "sales",
    code: "4000",
    opening_balance: 0,
    currency: "INR",
    description: "Revenue from sales of goods and services"
  },
  {
    name: "Interest Income",
    category: "income",
    subtype: "other_income",
    code: "4100",
    opening_balance: 0,
    currency: "INR",
    description: "Interest earned on investments and bank accounts"
  },

  // Expenses
  {
    name: "Cost of Goods Sold",
    category: "expense",
    subtype: "cost_of_goods_sold",
    code: "5000",
    opening_balance: 0,
    currency: "INR",
    description: "Direct costs of producing goods sold"
  },
  {
    name: "Rent Expense",
    category: "expense",
    subtype: "operating_expense",
    code: "6000",
    opening_balance: 0,
    currency: "INR",
    description: "Office and facility rent"
  },
  {
    name: "Utilities",
    category: "expense",
    subtype: "operating_expense",
    code: "6100",
    opening_balance: 0,
    currency: "INR",
    description: "Electricity, water, internet, and other utilities"
  },
  {
    name: "Salaries and Wages",
    category: "expense",
    subtype: "operating_expense",
    code: "6200",
    opening_balance: 0,
    currency: "INR",
    description: "Employee salaries and wages"
  },
  {
    name: "Office Supplies",
    category: "expense",
    subtype: "operating_expense",
    code: "6300",
    opening_balance: 0,
    currency: "INR",
    description: "Office supplies and stationery"
  },
  {
    name: "Travel Expense",
    category: "expense",
    subtype: "operating_expense",
    code: "6400",
    opening_balance: 0,
    currency: "INR",
    description: "Business travel expenses"
  },
  {
    name: "Advertising",
    category: "expense",
    subtype: "operating_expense",
    code: "6500",
    opening_balance: 0,
    currency: "INR",
    description: "Marketing and advertising expenses"
  },
  {
    name: "Depreciation",
    category: "expense",
    subtype: "operating_expense",
    code: "6600",
    opening_balance: 0,
    currency: "INR",
    description: "Depreciation of fixed assets"
  }
];

async function seedAccounts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing accounts
    await Account.deleteMany({});
    console.log('Cleared existing accounts');

    // Insert default accounts
    const accounts = await Account.insertMany(defaultAccounts);
    console.log(`Created ${accounts.length} default accounts`);

    // Display created accounts
    console.log('\nCreated accounts:');
    accounts.forEach(account => {
      console.log(`${account.code} - ${account.name} (${account.category})`);
    });

    console.log('\nSeed completed successfully!');
  } catch (error) {
    console.error('Error seeding accounts:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedAccounts();
