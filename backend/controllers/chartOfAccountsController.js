import Account, {
  ACCOUNT_HEADS,
  ACCOUNT_GROUPS,
  BALANCE_TYPE_RULES,
} from "../models/Account.js";
import { ExcelImportService } from "../services/excelImportService.js";

/**
 * GET /api/chart-of-accounts
 * Get all accounts with filtering and pagination
 */
export const getAllAccounts = async (req, res) => {
  try {
    console.log("🔍 getAllAccounts - Query params:", req.query);
    const {
      accountHead,
      accountGroup,
      search,
      isActive,
      page = 1,
      limit = 1000,
      sortBy = "code",
      sortOrder = "asc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (accountHead) filter.accountHead = accountHead;
    if (accountGroup) filter.accountGroup = accountGroup;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    console.log("🔍 getAllAccounts - Built filter:", filter);

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query - Only show parent accounts (accounts with no parent) on main page
    const accounts = await Account.find({ ...filter, parent: null })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("parent", "name code");

    // Add isParent field and subAccountCount to each account
    const accountsWithParentInfo = await Promise.all(
      accounts.map(async (account) => {
        const accountObj = account.toObject();
        accountObj.isParent = true; // All accounts on main page are parent accounts

        // Count sub-accounts for each parent
        const subAccountCount = await Account.countDocuments({
          parent: account._id,
          isActive: true,
        });
        accountObj.subAccountCount = subAccountCount;

        return accountObj;
      })
    );

    // Get total count for pagination
    const total = await Account.countDocuments(filter);

    // Get account statistics
    const stats = await Account.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$accountHead",
          count: { $sum: 1 },
          totalBalance: { $sum: "$balance" },
        },
      },
    ]);

    res.json({
      success: true,
      data: accountsWithParentInfo,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      stats: stats.reduce((acc, stat) => {
        acc[stat._id] = { count: stat.count, totalBalance: stat.totalBalance };
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error("Error fetching accounts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching accounts",
      error: error.message,
    });
  }
};

/**
 * GET /api/chart-of-accounts/:id
 * Get a specific account by ID
 */
export const getAccountById = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id).populate(
      "parent",
      "name code"
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    res.json({
      success: true,
      data: account,
    });
  } catch (error) {
    console.error("Error fetching account:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching account",
      error: error.message,
    });
  }
};

/**
 * GET /api/chart-of-accounts/:id/sub-accounts
 * Get sub-accounts of a specific account
 */
export const getSubAccounts = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 1000,
      sortBy = "name",
      sortOrder = "asc",
    } = req.query;

    // Verify parent account exists
    const parentAccount = await Account.findById(id);
    if (!parentAccount) {
      return res.status(404).json({
        success: false,
        message: "Parent account not found",
      });
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get sub-accounts with pagination
    const subAccounts = await Account.find({ parent: id, isActive: true })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("parent", "name code");

    // Add isParent field and subAccountCount to each account
    const subAccountsWithParentInfo = await Promise.all(
      subAccounts.map(async (account) => {
        const accountObj = account.toObject();
        accountObj.isParent = account.parent === null;

        // Count sub-accounts for each account
        const subAccountCount = await Account.countDocuments({
          parent: account._id,
          isActive: true,
        });
        accountObj.subAccountCount = subAccountCount;

        return accountObj;
      })
    );

    // Get total count for pagination
    const total = await Account.countDocuments({ parent: id, isActive: true });

    // Get sub-account statistics
    const stats = await Account.aggregate([
      { $match: { parent: id, isActive: true } },
      {
        $group: {
          _id: "$accountHead",
          count: { $sum: 1 },
          totalBalance: { $sum: "$balance" },
        },
      },
    ]);

    res.json({
      success: true,
      data: subAccountsWithParentInfo,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      stats: stats.reduce((acc, stat) => {
        acc[stat._id] = { count: stat.count, totalBalance: stat.totalBalance };
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error("Error fetching sub-accounts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sub-accounts",
      error: error.message,
    });
  }
};

/**
 * POST /api/chart-of-accounts
 * Create a new account
 */
export const createAccount = async (req, res) => {
  try {
    const {
      name,
      accountHead,
      accountGroup,
      parent,
      code,
      openingBalance = 0,
      currency = "INR",
      description,
      isSubAccount = false,
    } = req.body;

    // Validate required fields
    if (!name || !accountHead) {
      return res.status(400).json({
        success: false,
        message: "Name and account head are required",
      });
    }

    // Validate account head
    if (!ACCOUNT_HEADS.includes(accountHead)) {
      return res.status(400).json({
        success: false,
        message: `Invalid account head. Must be one of: ${ACCOUNT_HEADS.join(
          ", "
        )}`,
      });
    }

    // Validate account group
    const validGroups = ACCOUNT_GROUPS[accountHead] || [];
    if (!validGroups.includes(accountGroup)) {
      return res.status(400).json({
        success: false,
        message: `Invalid account group for ${accountHead}. Must be one of: ${validGroups.join(
          ", "
        )}`,
      });
    }

    // Check if account with same name and parent already exists
    const existingAccount = await Account.findOne({
      name,
      parent: parent || null,
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: "An account with this name already exists at this level",
      });
    }

    // Create new account
    const account = new Account({
      name,
      accountHead,
      accountGroup,
      parent,
      code,
      openingBalance,
      balance: openingBalance,
      balanceType: req.body.balanceType || BALANCE_TYPE_RULES[accountHead],
      currency,
      description,
      isActive: req.body.isActive !== undefined ? req.body.isActive : true,
    });

    await account.save();

    res.status(201).json({
      success: true,
      data: account,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Error creating account:", error);
    res.status(500).json({
      success: false,
      message: "Error creating account",
      error: error.message,
    });
  }
};

/**
 * PUT /api/chart-of-accounts/:id
 * Update an existing account
 */
export const updateAccount = async (req, res) => {
  try {
    const {
      name,
      accountHead,
      accountGroup,
      parent,
      code,
      currency,
      description,
      isActive,
      balanceType,
    } = req.body;

    // Check if account exists
    const existingAccount = await Account.findById(req.params.id);
    if (!existingAccount) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    // For PATCH requests (partial updates), only allow specific fields to be updated
    const updateData = {};

    // Always allow these fields to be updated
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (currency !== undefined) updateData.currency = currency;

    // Only allow accountHead, accountGroup, parent, and balanceType updates for full PUT requests
    // For PATCH requests, these fields are read-only
    if (req.method === "PUT") {
      if (accountHead !== undefined) {
        // Validate account head if provided
        if (accountHead && !ACCOUNT_HEADS.includes(accountHead)) {
          return res.status(400).json({
            success: false,
            message: `Invalid account head. Must be one of: ${ACCOUNT_HEADS.join(
              ", "
            )}`,
          });
        }
        updateData.accountHead = accountHead;
      }

      if (accountGroup !== undefined) {
        // Validate account group if provided
        const accountHeadToUse = accountHead || existingAccount.accountHead;
        const validGroups = ACCOUNT_GROUPS[accountHeadToUse] || [];

        if (accountGroup && !validGroups.includes(accountGroup)) {
          return res.status(400).json({
            success: false,
            message: `Invalid account group for ${accountHeadToUse}. Must be one of: ${validGroups.join(
              ", "
            )}`,
          });
        }
        updateData.accountGroup = accountGroup;
      }

      if (parent !== undefined) updateData.parent = parent;
      if (balanceType !== undefined) updateData.balanceType = balanceType;
    }

    // Check for name conflicts if name is being changed
    if (name && name !== existingAccount.name) {
      const nameConflict = await Account.findOne({
        name,
        parent: parent || existingAccount.parent,
        _id: { $ne: req.params.id },
      });

      if (nameConflict) {
        return res.status(400).json({
          success: false,
          message: "An account with this name already exists at this level",
        });
      }
    }

    // Update account
    const updatedAccount = await Account.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedAccount,
      message: "Account updated successfully",
    });
  } catch (error) {
    console.error("Error updating account:", error);
    res.status(500).json({
      success: false,
      message: "Error updating account",
      error: error.message,
    });
  }
};

/**
 * DELETE /api/chart-of-accounts/:id
 * Delete an account (soft delete)
 */
export const deleteAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    // Check if account has children
    const hasChildren = await Account.exists({ parent: req.params.id });
    if (hasChildren) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete account with sub-accounts. Please delete sub-accounts first.",
      });
    }

    // Check if account has balance
    if (account.balance !== 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete account with non-zero balance",
      });
    }

    // Soft delete
    await Account.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting account",
      error: error.message,
    });
  }
};

/**
 * GET /api/chart-of-accounts/categories
 * Get available account heads and groups
 */
export const getCategories = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        accountHeads: ACCOUNT_HEADS,
        accountGroups: ACCOUNT_GROUPS,
        balanceTypeRules: BALANCE_TYPE_RULES,
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
};

/**
 * GET /api/chart-of-accounts/hierarchy
 * Get accounts organized in hierarchy
 */
export const getAccountHierarchy = async (req, res) => {
  try {
    const accounts = await Account.find({ isActive: true })
      .populate("parent", "name")
      .sort({ accountHead: 1, name: 1 });

    // Group accounts by account head and parent
    const hierarchy = {};

    for (const accountHead of ACCOUNT_HEADS) {
      hierarchy[accountHead] = {
        name: accountHead.charAt(0).toUpperCase() + accountHead.slice(1),
        accounts: [],
      };
    }

    for (const account of accounts) {
      const accountHead = account.accountHead;
      if (!hierarchy[accountHead]) {
        hierarchy[accountHead] = { name: accountHead, accounts: [] };
      }

      hierarchy[accountHead].accounts.push(account);
    }

    res.json({
      success: true,
      data: hierarchy,
    });
  } catch (error) {
    console.error("Error fetching account hierarchy:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching account hierarchy",
      error: error.message,
    });
  }
};

/**
 * GET /api/chart-of-accounts/groups/:accountHead
 * Get account groups for a specific account head
 */
export const getAccountGroups = async (req, res) => {
  try {
    const { accountHead } = req.params;

    if (!ACCOUNT_HEADS.includes(accountHead)) {
      return res.status(400).json({
        success: false,
        message: `Invalid account head: ${accountHead}`,
      });
    }

    const groups = ACCOUNT_GROUPS[accountHead] || [];

    res.json({
      success: true,
      data: groups,
    });
  } catch (error) {
    console.error("Error fetching account groups:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching account groups",
      error: error.message,
    });
  }
};

/**
 * GET /api/chart-of-accounts/parent-accounts/:accountGroup
 * Get parent accounts for a specific account group
 */
export const getParentAccounts = async (req, res) => {
  try {
    const { accountGroup } = req.params;

    const parentAccounts = await Account.find({
      accountGroup,
      parent: null,
      isActive: true,
    }).sort({ name: 1 });

    res.json({
      success: true,
      data: parentAccounts,
    });
  } catch (error) {
    console.error("Error fetching parent accounts:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching parent accounts",
      error: error.message,
    });
  }
};

/**
 * POST /api/chart-of-accounts/bulk-update
 * Bulk update multiple accounts
 */
export const bulkUpdateAccounts = async (req, res) => {
  try {
    const { accounts } = req.body;

    if (!Array.isArray(accounts)) {
      return res.status(400).json({
        success: false,
        message: "Accounts must be an array",
      });
    }

    const updatePromises = accounts.map(async (accountUpdate) => {
      const { id, ...updateData } = accountUpdate;
      return Account.findByIdAndUpdate(id, updateData, { new: true });
    });

    const updatedAccounts = await Promise.all(updatePromises);

    res.json({
      success: true,
      data: updatedAccounts,
      message: `${updatedAccounts.length} accounts updated successfully`,
    });
  } catch (error) {
    console.error("Error bulk updating accounts:", error);
    res.status(500).json({
      success: false,
      message: "Error bulk updating accounts",
      error: error.message,
    });
  }
};

/**
 * POST /api/chart-of-accounts/bulk-import
 * Bulk import multiple accounts
 */
export const bulkImportAccounts = async (req, res) => {
  try {
    const { accounts } = req.body;

    if (!Array.isArray(accounts)) {
      return res.status(400).json({
        success: false,
        message: "Accounts must be an array",
      });
    }

    const results = {
      created: 0,
      updated: 0,
      errors: [],
    };

    for (const accountData of accounts) {
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
        } else {
          // Create new account
          const newAccount = new Account(accountData);
          await newAccount.save();
          results.created++;
        }
      } catch (error) {
        results.errors.push(
          `${accountData.name || accountData.code}: ${error.message}`
        );
      }
    }

    res.json({
      success: true,
      data: results,
      message: `Import completed: ${results.created} created, ${results.updated} updated, ${results.errors.length} errors`,
    });
  } catch (error) {
    console.error("Error bulk importing accounts:", error);
    res.status(500).json({
      success: false,
      message: "Error bulk importing accounts",
      error: error.message,
    });
  }
};

/**
 * POST /api/chart-of-accounts/upload-excel
 * Upload Excel file and import accounts
 */
export const uploadExcelAccounts = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No Excel file uploaded",
      });
    }

    console.log("📊 Processing Excel file:", req.file.originalname);

    // Parse Excel file
    const rows = await ExcelImportService.parseExcelFile(req.file.buffer);
    console.log("📊 Excel rows parsed:", rows.length);

    if (rows.length < 2) {
      return res.status(400).json({
        success: false,
        message:
          "Excel file must contain at least a header row and one data row",
      });
    }

    // Validate header row
    const headerRow = rows[0];
    const expectedHeaders = [
      "Account Name",
      "Account Head",
      "Account Group",
      "Balance",
      "Balance Type",
    ];

    const isValidHeader = expectedHeaders.every(
      (header, index) =>
        headerRow[index]?.toString().trim().toLowerCase() ===
        header.toLowerCase()
    );

    if (!isValidHeader) {
      return res.status(400).json({
        success: false,
        message: `Invalid Excel format. Expected headers: ${expectedHeaders.join(
          ", "
        )}`,
        receivedHeaders: headerRow
          .map((h) => h?.toString().trim())
          .filter(Boolean),
      });
    }

    // Build account hierarchy from Excel data
    const result = await ExcelImportService.buildAccountHierarchy(rows, {
      createHierarchy: true,
      overwriteExisting: false,
    });

    console.log("📊 Import result:", result);

    res.json({
      success: true,
      data: result.data,
      message: `Successfully imported ${
        result.data.created
      } accounts, updated ${result.data.updated} accounts${
        result.data.errors.length > 0
          ? ` (${result.data.errors.length} errors)`
          : ""
      }`,
      totalProcessed: result.totalProcessed,
      errors: result.data.errors,
    });
  } catch (error) {
    console.error("Error uploading Excel accounts:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading Excel accounts",
      error: error.message,
    });
  }
};

/**
 * GET /api/chart-of-accounts/all-for-dropdown
 * Get all accounts (including sub-accounts) for dropdown selection
 */
export const getAllAccountsForDropdown = async (req, res) => {
  try {
    console.log(
      "🔍 getAllAccountsForDropdown - Getting all accounts for dropdown"
    );

    // Get ALL accounts (including sub-accounts) for dropdown
    const accounts = await Account.find({ isActive: true })
      .populate("parent", "name code")
      .sort({ accountHead: 1, name: 1 });

    // Transform accounts to include parent information
    const accountsWithParentInfo = accounts.map((account) => {
      const accountObj = account.toObject();
      accountObj.isParent = account.parent === null;
      accountObj.parentId = account.parent?._id || null;
      return accountObj;
    });

    console.log(
      `🔍 getAllAccountsForDropdown - Found ${accountsWithParentInfo.length} accounts`
    );

    res.json({
      success: true,
      data: accountsWithParentInfo,
    });
  } catch (error) {
    console.error("Error getting accounts for dropdown:", error);
    res.status(500).json({
      success: false,
      message: "Error getting accounts for dropdown",
      error: error.message,
    });
  }
};

/**
 * GET /api/chart-of-accounts/export-excel
 * Export accounts to Excel file
 */
export const exportAccountsToExcel = async (req, res) => {
  try {
    const { accountHead, search } = req.query;

    // Build filter
    const filter = { isActive: true };
    if (accountHead) filter.accountHead = accountHead;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }

    // Get accounts
    const accounts = await Account.find(filter)
      .populate("parent", "name")
      .sort({ accountHead: 1, name: 1 });

    // Generate Excel file
    const buffer = await ExcelImportService.exportAccountsToExcel(accounts);

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=chart-of-accounts.xlsx"
    );
    res.setHeader("Content-Length", buffer.length);

    res.send(buffer);
  } catch (error) {
    console.error("Error exporting accounts:", error);
    res.status(500).json({
      success: false,
      message: "Error exporting accounts",
      error: error.message,
    });
  }
};

/**
 * POST /api/chart-of-accounts/create-defaults
 * Create default Chart of Accounts structure
 */
export const createDefaultAccounts = async (req, res) => {
  try {
    const results = await ExcelImportService.createDefaultAccounts();

    res.json({
      success: true,
      data: results,
      message: `Default accounts created: ${results.created} accounts, ${results.errors.length} errors`,
    });
  } catch (error) {
    console.error("Error creating default accounts:", error);
    res.status(500).json({
      success: false,
      message: "Error creating default accounts",
      error: error.message,
    });
  }
};


