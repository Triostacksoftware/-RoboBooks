import Account from "../models/Account.js";
import mongoose from "mongoose";

/**
 * Get next available account code
 */
export const getNextAccountCode = async (category) => {
  try {
    // Get the highest code for the category
    const lastAccount = await Account.findOne({ 
      category,
      code: { $regex: `^${getCategoryPrefix(category)}` }
    }).sort({ code: -1 });

    if (!lastAccount || !lastAccount.code) {
      // Return first code for category
      return `${getCategoryPrefix(category)}1001`;
    }

    // Extract number from code and increment
    const codeNumber = parseInt(lastAccount.code.replace(getCategoryPrefix(category), ""));
    const nextNumber = codeNumber + 1;
    
    return `${getCategoryPrefix(category)}${nextNumber.toString().padStart(4, "0")}`;
  } catch (error) {
    throw new Error(`Failed to generate account code: ${error.message}`);
  }
};

/**
 * Get category prefix for account codes
 */
const getCategoryPrefix = (category) => {
  const prefixes = {
    asset: "1",
    liability: "2", 
    equity: "3",
    income: "4",
    expense: "5"
  };
  return prefixes[category] || "9";
};

/**
 * Update account balance
 */
export const updateAccountBalance = async (accountId, amount, session = null) => {
  try {
    const updateOptions = session ? { session } : {};
    
    const account = await Account.findByIdAndUpdate(
      accountId,
      { $inc: { balance: amount } },
      { new: true, ...updateOptions }
    );

    if (!account) {
      throw new Error("Account not found");
    }

    return account;
  } catch (error) {
    throw new Error(`Failed to update account balance: ${error.message}`);
  }
};

/**
 * Get account balance as of a specific date
 */
export const getAccountBalanceAsOf = async (accountId, asOfDate) => {
  try {
    // This would require a transaction history table
    // For now, return current balance
    const account = await Account.findById(accountId);
    return account ? account.balance : 0;
  } catch (error) {
    throw new Error(`Failed to get account balance: ${error.message}`);
  }
};

/**
 * Validate account hierarchy
 */
export const validateAccountHierarchy = async (accountId, parentId) => {
  try {
    if (!parentId) return true; // Root level account

    // Check if parent exists
    const parent = await Account.findById(parentId);
    if (!parent) {
      throw new Error("Parent account not found");
    }

    // Check for circular references
    if (accountId === parentId) {
      throw new Error("Account cannot be its own parent");
    }

    // Check if the new parent would create a circular reference
    const checkCircular = async (currentId, targetId) => {
      if (currentId === targetId) return true;
      
      const current = await Account.findById(currentId);
      if (!current || !current.parent) return false;
      
      return await checkCircular(current.parent, targetId);
    };

    const hasCircular = await checkCircular(parentId, accountId);
    if (hasCircular) {
      throw new Error("This would create a circular reference in account hierarchy");
    }

    return true;
  } catch (error) {
    throw new Error(`Account hierarchy validation failed: ${error.message}`);
  }
};

/**
 * Get account statistics
 */
export const getAccountStatistics = async () => {
  try {
    const stats = await Account.aggregate([
      { $match: { is_active: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalBalance: { $sum: "$balance" },
          avgBalance: { $avg: "$balance" }
        }
      }
    ]);

    const totalAccounts = await Account.countDocuments({ is_active: true });
    const totalBalance = await Account.aggregate([
      { $match: { is_active: true } },
      { $group: { _id: null, total: { $sum: "$balance" } } }
    ]);

    return {
      byCategory: stats.reduce((acc, stat) => {
        acc[stat._id] = {
          count: stat.count,
          totalBalance: stat.totalBalance,
          avgBalance: stat.avgBalance
        };
        return acc;
      }, {}),
      total: {
        accounts: totalAccounts,
        balance: totalBalance[0]?.total || 0
      }
    };
  } catch (error) {
    throw new Error(`Failed to get account statistics: ${error.message}`);
  }
};

/**
 * Export accounts to CSV
 */
export const exportAccountsToCSV = async (filters = {}) => {
  try {
    const accounts = await Account.find({ ...filters, is_active: true })
      .populate("parent", "name code")
      .sort({ code: 1 });

    const csvHeaders = [
      "Code",
      "Name", 
      "Category",
      "Subtype",
      "Parent",
      "Opening Balance",
      "Current Balance",
      "Currency",
      "GST Treatment",
      "GST Rate",
      "Description",
      "Active"
    ];

    const csvRows = accounts.map(account => [
      account.code || "",
      account.name,
      account.category,
      account.subtype || "",
      account.parent ? account.parent.name : "",
      account.opening_balance,
      account.balance,
      account.currency,
      account.gst_treatment,
      account.gst_rate,
      account.description || "",
      account.is_active ? "Yes" : "No"
    ]);

    return {
      headers: csvHeaders,
      rows: csvRows
    };
  } catch (error) {
    throw new Error(`Failed to export accounts: ${error.message}`);
  }
};

/**
 * Import accounts from CSV
 */
export const importAccountsFromCSV = async (csvData, session = null) => {
  try {
    const results = {
      created: 0,
      updated: 0,
      errors: []
    };

    for (let i = 1; i < csvData.length; i++) { // Skip header row
      const row = csvData[i];
      try {
        const accountData = {
          code: row[0] || undefined,
          name: row[1],
          category: row[2],
          subtype: row[3] || undefined,
          parent: row[4] || null,
          opening_balance: parseFloat(row[5]) || 0,
          balance: parseFloat(row[6]) || 0,
          currency: row[7] || "INR",
          gst_treatment: row[8] || "taxable",
          gst_rate: parseFloat(row[9]) || 0,
          description: row[10] || "",
          is_active: row[11] === "Yes"
        };

        // Check if account exists by code or name
        const existingAccount = await Account.findOne({
          $or: [
            { code: accountData.code },
            { name: accountData.name }
          ]
        });

        if (existingAccount) {
          // Update existing account
          await Account.findByIdAndUpdate(
            existingAccount._id,
            accountData,
            { session }
          );
          results.updated++;
        } else {
          // Create new account
          const newAccount = new Account(accountData);
          await newAccount.save({ session });
          results.created++;
        }
      } catch (error) {
        results.errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    return results;
  } catch (error) {
    throw new Error(`Failed to import accounts: ${error.message}`);
  }
};
