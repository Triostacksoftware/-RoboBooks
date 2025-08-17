import mongoose from "mongoose";
import dotenv from "dotenv";
import Account from "../models/Account.js";

dotenv.config();

const testAccounts = async () => {
  try {
    // Connect to MongoDB
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/robobooks";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Get all accounts
    const accounts = await Account.find({ is_active: true }).sort({ code: 1 });

    console.log(`\n📊 Chart of Accounts Summary:`);
    console.log(`Total active accounts: ${accounts.length}`);

    // Group by category
    const byCategory = accounts.reduce((acc, account) => {
      if (!acc[account.category]) {
        acc[account.category] = [];
      }
      acc[account.category].push(account);
      return acc;
    }, {});

    console.log("\n📋 Accounts by Category:");
    Object.keys(byCategory).forEach((category) => {
      console.log(
        `\n${category.toUpperCase()} (${byCategory[category].length} accounts):`
      );
      byCategory[category].forEach((account) => {
        console.log(
          `  ${account.code} - ${account.name} (₹${account.balance.toFixed(2)})`
        );
      });
    });

    // Test specific accounts
    console.log("\n🔍 Testing specific accounts:");

    const cashAccount = await Account.findOne({ code: "1001" });
    if (cashAccount) {
      console.log(
        `✅ Cash account found: ${cashAccount.name} (Balance: ₹${cashAccount.balance})`
      );
    } else {
      console.log("❌ Cash account not found");
    }

    const salesAccount = await Account.findOne({ code: "4000" });
    if (salesAccount) {
      console.log(
        `✅ Sales Revenue account found: ${salesAccount.name} (Balance: ₹${salesAccount.balance})`
      );
    } else {
      console.log("❌ Sales Revenue account not found");
    }

    // Test account statistics
    const stats = await Account.aggregate([
      { $match: { is_active: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalBalance: { $sum: "$balance" },
        },
      },
    ]);

    console.log("\n📈 Account Statistics:");
    stats.forEach((stat) => {
      console.log(
        `${stat._id}: ${
          stat.count
        } accounts, Total Balance: ₹${stat.totalBalance.toFixed(2)}`
      );
    });

    console.log("\n🎉 Chart of Accounts test completed successfully!");
  } catch (error) {
    console.error("❌ Error during test:", error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
    process.exit(0);
  }
};

// Run the test
testAccounts();
