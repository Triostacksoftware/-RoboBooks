import mongoose from "mongoose";
import dotenv from "dotenv";
import Account from "../models/Account.js";

dotenv.config();

const defaultAccounts = [
  {
    code: "1001",
    name: "Cash",
    category: "asset",
    subtype: "cash",
    parent: null,
    opening_balance: 0,
    balance: 0,
    currency: "INR",
    is_active: true,
    gst_treatment: "taxable",
    gst_rate: 0,
    description: "Cash on hand and in bank accounts",
  },
  {
    code: "1002",
    name: "Bank Account",
    category: "asset",
    subtype: "bank",
    parent: null,
    opening_balance: 0,
    balance: 0,
    currency: "INR",
    is_active: true,
    gst_treatment: "taxable",
    gst_rate: 0,
    description: "Main bank account",
  },
  {
    code: "1100",
    name: "Accounts Receivable",
    category: "asset",
    subtype: "accounts_receivable",
    parent: null,
    opening_balance: 0,
    balance: 0,
    currency: "INR",
    is_active: true,
    gst_treatment: "taxable",
    gst_rate: 0,
    description: "Money owed by customers",
  },
  {
    code: "1200",
    name: "Inventory",
    category: "asset",
    subtype: "inventory",
    parent: null,
    opening_balance: 0,
    balance: 0,
    currency: "INR",
    is_active: true,
    gst_treatment: "taxable",
    gst_rate: 0,
    description: "Stock and inventory items",
  },
  {
    code: "1500",
    name: "Fixed Assets",
    category: "asset",
    subtype: "fixed_asset",
    parent: null,
    opening_balance: 0,
    balance: 0,
    currency: "INR",
    is_active: true,
    gst_treatment: "taxable",
    gst_rate: 0,
    description: "Equipment, furniture, and other fixed assets",
  },
  {
    code: "2000",
    name: "Accounts Payable",
    category: "liability",
    subtype: "accounts_payable",
    parent: null,
    opening_balance: 0,
    balance: 0,
    currency: "INR",
    is_active: true,
    gst_treatment: "taxable",
    gst_rate: 0,
    description: "Money owed to suppliers and vendors",
  },
  {
    code: "2100",
    name: "Credit Card",
    category: "liability",
    subtype: "credit_card",
    parent: null,
    opening_balance: 0,
    balance: 0,
    currency: "INR",
    is_active: true,
    gst_treatment: "taxable",
    gst_rate: 0,
    description: "Credit card balances",
  },
  {
    code: "2200",
    name: "Tax Payable",
    category: "liability",
    subtype: "current_liability",
    parent: null,
    opening_balance: 0,
    balance: 0,
    currency: "INR",
    is_active: true,
    gst_treatment: "taxable",
    gst_rate: 0,
    description: "Taxes owed to government",
  },
  {
    code: "3000",
    name: "Owner's Equity",
    category: "equity",
    subtype: "owner_equity",
    parent: null,
    opening_balance: 0,
    balance: 0,
    currency: "INR",
    is_active: true,
    gst_treatment: "taxable",
    gst_rate: 0,
    description: "Owner's investment in the business",
  },
  {
    code: "3100",
    name: "Retained Earnings",
    category: "equity",
    subtype: "retained_earnings",
    parent: null,
    opening_balance: 0,
    balance: 0,
    currency: "INR",
    is_active: true,
    gst_treatment: "taxable",
    gst_rate: 0,
    description: "Accumulated profits",
  },
  {
    code: "4000",
    name: "Sales Revenue",
    category: "income",
    subtype: "sales",
    parent: null,
    opening_balance: 0,
    balance: 0,
    currency: "INR",
    is_active: true,
    gst_treatment: "taxable",
    gst_rate: 0,
    description: "Revenue from sales of goods and services",
  },
  {
    code: "4100",
    name: "Interest Income",
    category: "income",
    subtype: "other_income",
    parent: null,
    opening_balance: 0,
    balance: 0,
    currency: "INR",
    is_active: true,
    gst_treatment: "taxable",
    gst_rate: 0,
    description: "Interest earned on investments and bank accounts",
  },
  {
    code: "5000",
    name: "Cost of Goods Sold",
    category: "expense",
    subtype: "cost_of_goods_sold",
    parent: null,
    opening_balance: 0,
    balance: 0,
    currency: "INR",
    is_active: true,
    gst_treatment: "taxable",
    gst_rate: 0,
    description: "Direct costs of producing goods sold",
  },
  {
    code: "6000",
    name: "Rent Expense",
    category: "expense",
    subtype: "operating_expense",
    parent: null,
    opening_balance: 0,
    balance: 0,
    currency: "INR",
    is_active: true,
    gst_treatment: "taxable",
    gst_rate: 0,
    description: "Office and facility rent",
  },
  {
    code: "6100",
    name: "Utilities",
    category: "expense",
    subtype: "operating_expense",
    parent: null,
    opening_balance: 0,
    balance: 0,
    currency: "INR",
    is_active: true,
    gst_treatment: "taxable",
    gst_rate: 0,
    description: "Electricity, water, internet, and other utilities",
  },
  {
    code: "6200",
    name: "Salaries and Wages",
    category: "expense",
    subtype: "operating_expense",
    parent: null,
    opening_balance: 0,
    balance: 0,
    currency: "INR",
    is_active: true,
    gst_treatment: "taxable",
    gst_rate: 0,
    description: "Employee salaries and wages",
  },
  {
    code: "6300",
    name: "Office Supplies",
    category: "expense",
    subtype: "operating_expense",
    parent: null,
    opening_balance: 0,
    balance: 0,
    currency: "INR",
    is_active: true,
    gst_treatment: "taxable",
    gst_rate: 0,
    description: "Office supplies and stationery",
  },
  {
    code: "6400",
    name: "Travel Expense",
    category: "expense",
    subtype: "operating_expense",
    parent: null,
    opening_balance: 0,
    balance: 0,
    currency: "INR",
    is_active: true,
    gst_treatment: "taxable",
    gst_rate: 0,
    description: "Business travel expenses",
  },
  {
    code: "6500",
    name: "Advertising",
    category: "expense",
    subtype: "operating_expense",
    parent: null,
    opening_balance: 0,
    balance: 0,
    currency: "INR",
    is_active: true,
    gst_treatment: "taxable",
    gst_rate: 0,
    description: "Marketing and advertising expenses",
  },
  {
    code: "6600",
    name: "Depreciation",
    category: "expense",
    subtype: "operating_expense",
    parent: null,
    opening_balance: 0,
    balance: 0,
    currency: "INR",
    is_active: true,
    gst_treatment: "taxable",
    gst_rate: 0,
    description: "Depreciation of fixed assets",
  },
];

const importAccounts = async () => {
  try {
    // Connect to MongoDB
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/robobooks";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Clear existing accounts (optional - comment out if you want to keep existing)
    // await Account.deleteMany({});
    // console.log("🗑️  Cleared existing accounts");

    const results = {
      created: 0,
      updated: 0,
      errors: [],
    };

    console.log("🚀 Starting import of Chart of Accounts...");

    for (const accountData of defaultAccounts) {
      try {
        // Check if account exists by code or name
        const existingAccount = await Account.findOne({
          $or: [{ code: accountData.code }, { name: accountData.name }],
        });

        if (existingAccount) {
          // Update existing account
          await Account.findByIdAndUpdate(existingAccount._id, accountData, {
            new: true,
            runValidators: true,
          });
          results.updated++;
          console.log(`🔄 Updated: ${accountData.name} (${accountData.code})`);
        } else {
          // Create new account
          const newAccount = new Account(accountData);
          await newAccount.save();
          results.created++;
          console.log(`✅ Created: ${accountData.name} (${accountData.code})`);
        }
      } catch (error) {
        results.errors.push(
          `${accountData.name || accountData.code}: ${error.message}`
        );
        console.log(
          `❌ Error: ${accountData.name || accountData.code} - ${error.message}`
        );
      }
    }

    console.log("\n📊 Import Summary:");
    console.log(`✅ Created: ${results.created} accounts`);
    console.log(`🔄 Updated: ${results.updated} accounts`);
    console.log(`❌ Errors: ${results.errors.length} accounts`);

    if (results.errors.length > 0) {
      console.log("\n❌ Errors:");
      results.errors.forEach((error) => console.log(`  - ${error}`));
    }

    // Get total accounts count
    const totalAccounts = await Account.countDocuments({ is_active: true });
    console.log(`\n📈 Total active accounts in database: ${totalAccounts}`);

    console.log("\n🎉 Chart of Accounts import completed!");
  } catch (error) {
    console.error("❌ Error during import:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  }
};

// Run the import
importAccounts();
