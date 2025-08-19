import Account from "../models/Account.js";
import { ACCOUNT_CATEGORIES, ACCOUNT_SUBTYPES } from "../models/Account.js";
import { ExcelImportService } from "../services/excelImportService.js";

/**
 * GET /api/chart-of-accounts
 * Get all accounts with filtering and pagination
 */
export const getAllAccounts = async (req, res) => {
  try {
    console.log("🔍 getAllAccounts - Query params:", req.query);
    const {
      category,
      subtype,
      search,
      is_active,
      page = 1,
      limit = 1000, // Increased from 50 to 1000 to return all accounts
      sortBy = "code",
      sortOrder = "asc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (category) filter.category = category;
    if (subtype) filter.subtype = subtype;
    if (is_active !== undefined) filter.is_active = is_active === "true";

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

    // Execute query
    const accounts = await Account.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("parent", "name code");

    // Add isParent field to each account
    const accountsWithParentInfo = accounts.map((account) => {
      const accountObj = account.toObject();
      accountObj.isParent = account.parent === null; // Top-level accounts are parent accounts
      return accountObj;
    });

    // Get total count for pagination
    const total = await Account.countDocuments(filter);

    // Get account statistics
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
    const subAccounts = await Account.find({ parent: id, is_active: true })
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("parent", "name code");

    // Add isParent field to each account
    const subAccountsWithParentInfo = subAccounts.map((account) => {
      const accountObj = account.toObject();
      accountObj.isParent = account.parent === null; // Top-level accounts are parent accounts
      return accountObj;
    });

    // Get total count for pagination
    const total = await Account.countDocuments({ parent: id, is_active: true });

    // Get sub-account statistics
    const stats = await Account.aggregate([
      { $match: { parent: id, is_active: true } },
      {
        $group: {
          _id: "$category",
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
      category,
      subtype,
      parent,
      code,
      opening_balance = 0,
      currency = "INR",
      gst_treatment,
      gst_rate = 0,
      description,
      is_sub_account = false,
    } = req.body;

    // Validate required fields
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Name and category are required",
      });
    }

    // Validate category
    if (!ACCOUNT_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${ACCOUNT_CATEGORIES.join(
          ", "
        )}`,
      });
    }

    // Validate subtype if provided
    if (subtype && !ACCOUNT_SUBTYPES.includes(subtype)) {
      return res.status(400).json({
        success: false,
        message: `Invalid subtype. Must be one of: ${ACCOUNT_SUBTYPES.join(
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
      category,
      subtype,
      parent,
      code,
      opening_balance,
      balance: opening_balance,
      currency,
      gst_treatment,
      gst_rate,
      description,
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
      category,
      subtype,
      parent,
      code,
      currency,
      gst_treatment,
      gst_rate,
      description,
      is_active,
    } = req.body;

    // Validate category if provided
    if (category && !ACCOUNT_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${ACCOUNT_CATEGORIES.join(
          ", "
        )}`,
      });
    }

    // Validate subtype if provided
    if (subtype && !ACCOUNT_SUBTYPES.includes(subtype)) {
      return res.status(400).json({
        success: false,
        message: `Invalid subtype. Must be one of: ${ACCOUNT_SUBTYPES.join(
          ", "
        )}`,
      });
    }

    // Check if account exists
    const existingAccount = await Account.findById(req.params.id);
    if (!existingAccount) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
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
      {
        name,
        category,
        subtype,
        parent,
        code,
        currency,
        gst_treatment,
        gst_rate,
        description,
        is_active,
      },
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
    await Account.findByIdAndUpdate(req.params.id, { is_active: false });

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
 * Get available categories and subtypes
 */
export const getCategories = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        categories: ACCOUNT_CATEGORIES,
        subtypes: ACCOUNT_SUBTYPES,
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
    const accounts = await Account.find({ is_active: true })
      .populate("parent", "name")
      .sort({ category: 1, name: 1 });

    // Group accounts by category and parent
    const hierarchy = {};

    for (const category of ACCOUNT_CATEGORIES) {
      hierarchy[category] = {
        name: category.charAt(0).toUpperCase() + category.slice(1),
        accounts: [],
      };
    }

    for (const account of accounts) {
      const category = account.category;
      if (!hierarchy[category]) {
        hierarchy[category] = { name: category, accounts: [] };
      }

      hierarchy[category].accounts.push(account);
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
 * Upload parsed Excel data and import accounts
 */
export const uploadExcelAccounts = async (req, res) => {
  try {
    const {
      accounts,
      createHierarchy = true,
      overwriteExisting = false,
    } = req.body;

    if (!accounts || !Array.isArray(accounts)) {
      return res.status(400).json({
        success: false,
        message: "No accounts data provided or invalid format",
      });
    }

    console.log(`Processing ${accounts.length} accounts from frontend`);

    // Convert frontend data format to backend format
    const rows = [
      [
        "Account Name",
        "Account Head",
        "Account Group",
        "Balance",
        "Balance Type",
      ], // Header
      ...accounts.map((account) => [
        account.name,
        account.category,
        account.subtype,
        account.balance,
        account.balanceType,
      ]),
    ];

    // Build account hierarchy
    const result = await ExcelImportService.buildAccountHierarchy(rows, {
      createHierarchy,
      overwriteExisting,
    });

    res.json({
      success: true,
      data: {
        created: result.data.created,
        updated: result.data.updated,
        errors: result.data.errors,
        totalProcessed: result.totalProcessed,
      },
      message: `Successfully imported ${result.data.created} accounts, updated ${result.data.updated} accounts`,
    });
  } catch (error) {
    console.error("Error uploading Excel data:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/chart-of-accounts/export-excel
 * Export accounts to Excel file
 */
export const exportAccountsToExcel = async (req, res) => {
  try {
    const { category, search } = req.query;

    // Build filter
    const filter = { is_active: true };
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
      ];
    }

    // Get accounts
    const accounts = await Account.find(filter)
      .populate("parent", "name")
      .sort({ category: 1, name: 1 });

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
