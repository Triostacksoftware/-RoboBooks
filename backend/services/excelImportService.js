import XLSX from "xlsx";
import Account from "../models/Account.js";

export class ExcelImportService {
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

    // Required fields only
    if (!accountData.name?.trim()) {
      errors.push(`Row ${rowNumber}: Account name is required`);
    }

    if (!accountData.accountType?.trim()) {
      errors.push(`Row ${rowNumber}: Account type is required`);
    }

    if (!accountData.accountGroup?.trim()) {
      errors.push(`Row ${rowNumber}: Account group is required`);
    }

    // Validate balance is a number (if provided)
    if (
      accountData.balance !== undefined &&
      isNaN(parseFloat(accountData.balance))
    ) {
      errors.push(`Row ${rowNumber}: Balance must be a valid number`);
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

        return {
          name: row[0]?.toString().trim() || "",
          accountType: row[1]?.toString().trim() || "",
          accountGroup: row[2]?.toString().trim() || "",
          balance: parseFloat(row[3]) || 0,
          balanceType: row[4]?.toString().toLowerCase() || "",
          rowNumber,
        };
      })
      .filter((row) => row.name || row.accountType || row.accountGroup); // Remove empty rows
  }

  /**
   * Create parent accounts for each account type and group
   */
  static async createParentAccounts(accounts) {
    const hierarchy = {};

    for (const account of accounts) {
      if (!hierarchy[account.accountType]) {
        hierarchy[account.accountType] = {};
      }

      if (!hierarchy[account.accountType][account.accountGroup]) {
        // Check if parent account already exists
        let parentAccount = await Account.findOne({
          name: account.accountGroup,
          category: account.accountType.toLowerCase(),
          parent: null,
        });

        if (!parentAccount) {
          // Create parent account for this group using Excel data only
          parentAccount = new Account({
            name: account.accountGroup,
            category: account.accountType.toLowerCase(),
            subtype: account.accountGroup.toLowerCase().replace(/\s+/g, "_"),
            opening_balance: 0,
            balance: 0,
            is_active: true,
            description: `Parent account for ${account.accountGroup}`,
          });

          await parentAccount.save();
        }

        hierarchy[account.accountType][account.accountGroup] =
          parentAccount._id;
      }
    }

    return hierarchy;
  }

  /**
   * Map account group to subtype - removed fallback mapping
   * Now uses exact Excel data only
   */
  static mapAccountGroupToSubtype(accountGroup) {
    // Use exact Excel data, no fallback mapping
    return accountGroup.toLowerCase().replace(/\s+/g, "_");
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
          hierarchy[accountData.accountType]?.[accountData.accountGroup];

        // Check if account exists by name and parent
        const existingAccount = await Account.findOne({
          name: accountData.name,
          parent: parentId,
        });

        // Parse balance from Excel - use exact value from Excel, no fallbacks
        const excelBalance = parseFloat(accountData.balance);
        const balanceType = accountData.balanceType?.toLowerCase() || "debit";

        // Create account document using ONLY Excel data, no fallbacks
        const accountDoc = {
          name: accountData.name,
          category: accountData.accountType.toLowerCase(),
          subtype: accountData.accountGroup.toLowerCase().replace(/\s+/g, "_"),
          parent: parentId,
          opening_balance: excelBalance,
          balance: excelBalance,
          is_active: true,
          description: `Imported from Excel - ${accountData.accountType} / ${accountData.accountGroup}`,
        };

        if (existingAccount) {
          // Update existing account with Excel data only
          await Account.findByIdAndUpdate(existingAccount._id, accountDoc, {
            new: true,
            runValidators: true,
          });
          results.updated++;
        } else {
          // Create new account with Excel data only
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
   * Build complete account hierarchy from Excel data
   */
  static async buildAccountHierarchy(rows, options = {}) {
    const { createHierarchy = true, overwriteExisting = false } = options;

    try {
      // Step 1: Parse and validate rows
      const accounts = this.parseRows(rows);

      // Step 2: Validate all accounts
      const allErrors = [];
      for (const account of accounts) {
        const errors = this.validateAccountData(account, account.rowNumber);
        allErrors.push(...errors);
      }

      if (allErrors.length > 0) {
        throw new Error(`Validation errors:\n${allErrors.join("\n")}`);
      }

      // Step 3: Create parent accounts
      const hierarchy = await this.createParentAccounts(accounts);

      // Step 4: Create individual accounts
      const results = await this.createAccounts(accounts, hierarchy);

      return {
        success: true,
        data: results,
        hierarchy,
        totalProcessed: accounts.length,
      };
    } catch (error) {
      throw new Error(`Failed to build account hierarchy: ${error.message}`);
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
        const accountGroup = parent ? parent.name : account.subtype || "Other";

        exportData.push([
          account.name,
          account.category.charAt(0).toUpperCase() + account.category.slice(1),
          accountGroup,
          account.balance || 0,
          account.balance >= 0 ? "debit" : "credit",
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
}
