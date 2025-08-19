import XLSX from "xlsx";
import Account, {
  ACCOUNT_HEADS,
  ACCOUNT_GROUPS,
  BALANCE_TYPE_RULES,
} from "../models/Account.js";

export class ExcelImportService {
  /**
   * Generate unique 8-digit account code
   */
  static async generateUniqueCode() {
    const min = 10000000; // 8 digits starting with 1
    const max = 99999999;

    let code;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      code = Math.floor(Math.random() * (max - min + 1)) + min;
      attempts++;

      if (attempts > maxAttempts) {
        throw new Error("Unable to generate unique account code");
      }
    } while (await Account.exists({ code: code.toString() }));

    return code.toString();
  }

  /**
   * Parse Excel file buffer and return JSON data
   */
  static async parseExcelFile(buffer) {
    try {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      return jsonData;
    } catch (error) {
      throw new Error(`Failed to parse Excel file: ${error.message}`);
    }
  }

  /**
   * Validate account data from Excel
   */
  static validateAccountData(accountData, rowNumber) {
    const errors = [];

    if (!accountData.name?.trim()) {
      errors.push(`Row ${rowNumber}: Account name is required`);
    }

    if (!accountData.accountHead?.trim()) {
      errors.push(`Row ${rowNumber}: Account Head is required`);
    }

    if (!accountData.accountGroup?.trim()) {
      errors.push(`Row ${rowNumber}: Account Group is required`);
    }

    // Validate account head - be more flexible with case
    if (accountData.accountHead) {
      const normalizedHead = accountData.accountHead.toLowerCase().trim();
      if (!ACCOUNT_HEADS.includes(normalizedHead)) {
        errors.push(
          `Row ${rowNumber}: Invalid Account Head "${
            accountData.accountHead
          }". Must be one of: ${ACCOUNT_HEADS.join(", ")}`
        );
      }
    }

    // Validate account group - accept any group name, just log warnings
    if (accountData.accountHead && accountData.accountGroup) {
      const normalizedHead = accountData.accountHead.toLowerCase().trim();
      const validGroups = ACCOUNT_GROUPS[normalizedHead] || [];
      // Don't reject unknown groups - they might be custom groups
      if (
        validGroups.length > 0 &&
        !validGroups.includes(accountData.accountGroup)
      ) {
        console.log(
          `Info: Row ${rowNumber}: Custom Account Group "${accountData.accountGroup}" for Account Head "${accountData.accountHead}". This will be accepted.`
        );
      }
    }

    // Validate balance is a number - be more flexible
    const balance = parseFloat(accountData.balance);
    if (isNaN(balance)) {
      errors.push(
        `Row ${rowNumber}: Balance must be a valid number, got: "${accountData.balance}"`
      );
    }

    // Validate balance type - be more flexible with case and empty values
    if (accountData.balanceType && accountData.balanceType.trim()) {
      const normalizedType = accountData.balanceType.toLowerCase().trim();
      if (!["credit", "debit"].includes(normalizedType)) {
        errors.push(
          `Row ${rowNumber}: Balance Type must be either "credit" or "debit", got: "${accountData.balanceType}"`
        );
      }
    }

    return errors;
  }

  /**
   * Parse rows from Excel data
   */
  static parseRows(rows) {
    // Skip header row
    const dataRows = rows.slice(1);

    return dataRows
      .map((row, index) => {
        const rowNumber = index + 2; // +2 because we skip header and arrays are 0-indexed

        // Ensure row is an array and has enough elements
        if (!Array.isArray(row) || row.length < 3) {
          console.log(
            `Warning: Row ${rowNumber} has insufficient data, skipping`
          );
          return null;
        }

        // Map Excel columns to our data structure
        // Column A: Account Name, Column B: Account Head, Column C: Account Group, Column D: Balance, Column E: Balance Type
        const parsedRow = {
          name: row[0]?.toString().trim() || "",
          accountHead: row[1]?.toString().trim().toLowerCase() || "",
          accountGroup: row[2]?.toString().trim() || "", // Keep original case for account groups
          balance: parseFloat(row[3]) || 0,
          balanceType: row[4]?.toString().toLowerCase().trim() || "",
          rowNumber,
        };

        // Only include rows with essential data
        if (parsedRow.name && parsedRow.accountHead && parsedRow.accountGroup) {
          return parsedRow;
        } else {
          console.log(
            `Warning: Row ${rowNumber} missing essential data, skipping`
          );
          return null;
        }
      })
      .filter((row) => row !== null); // Remove null rows
  }

  /**
   * Create parent accounts for each account group
   */
  static async createParentAccounts(accountGroups) {
    const createdParents = [];

    for (const [accountHead, groups] of Object.entries(accountGroups)) {
      for (const groupName of groups) {
        try {
          // Check if parent account already exists
          const existingParent = await Account.findOne({
            name: groupName,
            accountHead: accountHead.toLowerCase(),
            accountGroup: groupName,
            isParent: true,
          });

          if (!existingParent) {
            // Generate unique 8-digit code
            const code = await this.generateUniqueCode();

            // Determine balance type based on account head
            const balanceType =
              BALANCE_TYPE_RULES[accountHead.toLowerCase()] || "debit";

            const parentAccount = new Account({
              name: groupName,
              code,
              accountHead: accountHead.toLowerCase(),
              accountGroup: groupName,
              balance: 0,
              balanceType,
              isParent: true,
              isActive: true,
              description: `Parent account for ${groupName} group`,
            });

            await parentAccount.save();
            createdParents.push(parentAccount);
            console.log(
              `Created parent account: ${groupName} (${accountHead})`
            );
          } else {
            console.log(
              `Parent account already exists: ${groupName} (${accountHead})`
            );
          }
        } catch (error) {
          console.error(`Error creating parent account ${groupName}:`, error);
        }
      }
    }

    return createdParents;
  }

  /**
   * Create individual accounts
   */
  static async createAccounts(accounts, hierarchy) {
    const results = {
      created: 0,
      updated: 0,
      errors: [],
    };

    for (const accountData of accounts) {
      try {
        // Get parent account ID
        const parentId =
          hierarchy[accountData.accountHead]?.[accountData.accountGroup];

        // Check if account exists by name and parent
        const existingAccount = await Account.findOne({
          name: accountData.name,
          parent: parentId,
        });

        // Parse balance from Excel
        const excelBalance = parseFloat(accountData.balance);
        const balanceType =
          accountData.balanceType ||
          BALANCE_TYPE_RULES[accountData.accountHead];

        // Create account document
        const accountDoc = {
          name: accountData.name,
          accountHead: accountData.accountHead,
          accountGroup: accountData.accountGroup,
          parent: parentId,
          openingBalance: excelBalance,
          balance: excelBalance,
          balanceType: balanceType,
          isActive: true,
          description: `Imported from Excel - ${accountData.accountHead} / ${accountData.accountGroup}`,
        };

        if (existingAccount) {
          // Update existing account
          await Account.findByIdAndUpdate(existingAccount._id, accountDoc, {
            new: true,
            runValidators: true,
          });
          results.updated++;
        } else {
          // Create new account
          const newAccount = new Account(accountDoc);
          await newAccount.save();
          results.created++;
        }
      } catch (error) {
        results.errors.push(
          `${accountData.name} (Row ${accountData.rowNumber}): ${error.message}`
        );
      }
    }

    return results;
  }

  /**
   * Build account hierarchy from Excel data
   */
  static async buildAccountHierarchy(rows, options = {}) {
    const { createHierarchy = true, overwriteExisting = false } = options;

    try {
      // Parse rows from Excel
      const parsedRows = this.parseRows(rows);
      console.log(`Parsed ${parsedRows.length} rows from Excel`);

      if (parsedRows.length === 0) {
        return {
          success: false,
          message: "No valid data found in Excel file",
          data: { created: 0, updated: 0, errors: [] },
          totalProcessed: 0,
        };
      }

      // Validate all rows
      const validationErrors = [];
      for (const row of parsedRows) {
        try {
          const errors = this.validateAccountData(row, row.rowNumber);
          validationErrors.push(...errors);
        } catch (error) {
          validationErrors.push(
            `Row ${row.rowNumber}: Validation error - ${error.message}`
          );
        }
      }

      if (validationErrors.length > 0) {
        console.log(`Validation errors found: ${validationErrors.length}`);
        // Don't fail completely, just log the errors and continue
        console.log("First 5 validation errors:", validationErrors.slice(0, 5));
      }

      // Group accounts by account head and group
      const accountGroups = {};
      for (const row of parsedRows) {
        const accountHead = row.accountHead.toLowerCase();
        if (!accountGroups[accountHead]) {
          accountGroups[accountHead] = new Set();
        }
        accountGroups[accountHead].add(row.accountGroup);
      }

      // Convert Sets to Arrays
      const accountGroupsArray = {};
      for (const [accountHead, groups] of Object.entries(accountGroups)) {
        accountGroupsArray[accountHead] = Array.from(groups);
      }

      // Create parent accounts if hierarchy is enabled
      if (createHierarchy) {
        console.log("Creating parent accounts for hierarchy...");
        try {
          await this.createParentAccounts(accountGroupsArray);
        } catch (error) {
          console.error("Error creating parent accounts:", error);
          // Continue with account creation even if parent creation fails
        }
      }

      // Process each account
      let created = 0;
      let updated = 0;
      const errors = [];

      for (const row of parsedRows) {
        try {
          // Check if account already exists
          const existingAccount = await Account.findOne({
            name: row.name,
            accountHead: row.accountHead.toLowerCase(),
          });

          if (existingAccount && !overwriteExisting) {
            console.log(`Account already exists: ${row.name}`);
            continue;
          }

          // Find parent account if hierarchy is enabled
          let parentId = null;
          if (createHierarchy) {
            try {
              const parentAccount = await Account.findOne({
                name: row.accountGroup,
                accountHead: row.accountHead.toLowerCase(),
                isParent: true,
              });
              parentId = parentAccount?._id || null;
            } catch (error) {
              console.log(
                `Could not find parent for ${row.name}: ${error.message}`
              );
            }
          }

          // Generate unique code
          let code;
          try {
            code = await this.generateUniqueCode();
          } catch (error) {
            errors.push(
              `Row ${row.rowNumber}: Failed to generate unique code - ${error.message}`
            );
            continue;
          }

          // Determine balance type based on account head
          const balanceType =
            BALANCE_TYPE_RULES[row.accountHead.toLowerCase()] || "debit";

          const accountData = {
            name: row.name,
            code,
            accountHead: row.accountHead.toLowerCase(),
            accountGroup: row.accountGroup,
            balance: row.balance || 0,
            balanceType: row.balanceType || balanceType,
            parent: parentId,
            isActive: true,
            description: `Imported from Excel - ${row.name}`,
          };

          if (existingAccount && overwriteExisting) {
            // Update existing account
            await Account.findByIdAndUpdate(existingAccount._id, accountData);
            updated++;
            console.log(`Updated account: ${row.name}`);
          } else {
            // Create new account
            const newAccount = new Account(accountData);
            await newAccount.save();
            created++;
            console.log(`Created account: ${row.name}`);
          }
        } catch (error) {
          console.error(`Error processing account ${row.name}:`, error);
          errors.push(`Row ${row.rowNumber}: ${error.message}`);
        }
      }

      console.log(
        `Import completed: ${created} created, ${updated} updated, ${errors.length} errors`
      );

      return {
        success: true,
        data: { created, updated, errors },
        totalProcessed: parsedRows.length,
      };
    } catch (error) {
      console.error("Error building account hierarchy:", error);
      return {
        success: false,
        message: error.message,
        data: { created: 0, updated: 0, errors: [error.message] },
        totalProcessed: 0,
      };
    }
  }

  /**
   * Export accounts to Excel format
   */
  static async exportAccountsToExcel(accounts) {
    try {
      // Prepare data for export
      const exportData = [
        [
          "Account Name",
          "Account Head",
          "Account Group",
          "Balance",
          "Balance Type",
        ],
      ];

      for (const account of accounts) {
        const parent = account.parent
          ? await Account.findById(account.parent)
          : null;
        const accountGroup = parent
          ? parent.name
          : account.accountGroup || "Other";

        exportData.push([
          account.name,
          account.accountHead.charAt(0).toUpperCase() +
            account.accountHead.slice(1),
          accountGroup,
          account.balance || 0,
          account.balanceType || "debit",
        ]);
      }

      // Create workbook
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet(exportData);

      // Set column widths
      worksheet["!cols"] = [
        { width: 30 }, // Account Name
        { width: 15 }, // Account Head
        { width: 20 }, // Account Group
        { width: 15 }, // Balance
        { width: 15 }, // Balance Type
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, "Chart of Accounts");

      // Generate buffer
      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

      return buffer;
    } catch (error) {
      throw new Error(`Failed to export accounts: ${error.message}`);
    }
  }

  /**
   * Create default Chart of Accounts structure
   */
  static async createDefaultAccounts() {
    const defaultAccounts = [
      // Asset Accounts
      {
        name: "Cash In Hand",
        accountHead: "asset",
        accountGroup: "Current Asset",
        balance: 0,
      },
      {
        name: "Bank Accounts",
        accountHead: "asset",
        accountGroup: "Current Asset",
        balance: 0,
      },
      {
        name: "Accounts Receivable",
        accountHead: "asset",
        accountGroup: "Current Asset",
        balance: 0,
      },
      {
        name: "Inventory",
        accountHead: "asset",
        accountGroup: "Current Asset",
        balance: 0,
      },
      {
        name: "Fixed Assets",
        accountHead: "asset",
        accountGroup: "Non-Current Asset",
        balance: 0,
      },

      // Liability Accounts
      {
        name: "Accounts Payable",
        accountHead: "liability",
        accountGroup: "Current Liability",
        balance: 0,
      },
      {
        name: "Loans Payable",
        accountHead: "liability",
        accountGroup: "Loans",
        balance: 0,
      },
      {
        name: "Provisions",
        accountHead: "liability",
        accountGroup: "Provisions",
        balance: 0,
      },

      // Income Accounts
      {
        name: "Sales Revenue",
        accountHead: "income",
        accountGroup: "Direct Income",
        balance: 0,
      },
      {
        name: "Service Revenue",
        accountHead: "income",
        accountGroup: "Direct Income",
        balance: 0,
      },
      {
        name: "Interest Income",
        accountHead: "income",
        accountGroup: "Indirect Income",
        balance: 0,
      },

      // Expense Accounts
      {
        name: "Cost of Goods Sold",
        accountHead: "expense",
        accountGroup: "Direct Expense",
        balance: 0,
      },
      {
        name: "Operating Expenses",
        accountHead: "expense",
        accountGroup: "Indirect Expense",
        balance: 0,
      },
      {
        name: "Salary Expenses",
        accountHead: "expense",
        accountGroup: "Indirect Expense",
        balance: 0,
      },

      // Equity Accounts
      {
        name: "Owner's Capital",
        accountHead: "equity",
        accountGroup: "Capital Account",
        balance: 0,
      },
      {
        name: "Retained Earnings",
        accountHead: "equity",
        accountGroup: "Capital Account",
        balance: 0,
      },
    ];

    const results = {
      created: 0,
      updated: 0,
      errors: [],
    };

    for (const accountData of defaultAccounts) {
      try {
        // Check if account exists
        const existingAccount = await Account.findOne({
          name: accountData.name,
          accountHead: accountData.accountHead,
          accountGroup: accountData.accountGroup,
        });

        if (!existingAccount) {
          const newAccount = new Account({
            name: accountData.name,
            accountHead: accountData.accountHead,
            accountGroup: accountData.accountGroup,
            openingBalance: accountData.balance,
            balance: accountData.balance,
            balanceType: BALANCE_TYPE_RULES[accountData.accountHead],
            isActive: true,
            description: `Default account - ${accountData.accountHead} / ${accountData.accountGroup}`,
          });

          await newAccount.save();
          results.created++;
        }
      } catch (error) {
        results.errors.push(`${accountData.name}: ${error.message}`);
      }
    }

    return results;
  }
}
