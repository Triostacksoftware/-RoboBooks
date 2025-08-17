import Account from "../models/Account.js";
import { ACCOUNT_CATEGORIES, ACCOUNT_SUBTYPES } from "../models/Account.js";

/**
 * GET /api/chart-of-accounts
 * Get all accounts with filtering and pagination
 */
export const getAllAccounts = async (req, res) => {
  try {
    const {
      category,
      subtype,
      search,
      is_active,
      page = 1,
      limit = 50,
      sortBy = "code",
      sortOrder = "asc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (category) filter.category = category;
    if (subtype) filter.subtype = subtype;
    if (is_active !== undefined) filter.is_active = is_active === "true";

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
      data: accounts,
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
 * POST /api/chart-of-accounts
 * Create a new account
 */
export const createAccount = async (req, res) => {
  try {
    const {
      name,
      code,
      category,
      subtype,
      parent,
      opening_balance = 0,
      currency = "INR",
      gst_treatment = "taxable",
      gst_rate = 0,
      description,
    } = req.body;

    // Validate required fields
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Name and category are required",
      });
    }

    // Check if account with same name already exists
    const existingAccount = await Account.findOne({ name });
    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: "Account with this name already exists",
      });
    }

    // Check if code is unique (if provided)
    if (code) {
      const existingCode = await Account.findOne({ code });
      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: "Account with this code already exists",
        });
      }
    }

    // Create the account
    const account = new Account({
      name,
      code,
      category,
      subtype,
      parent: parent || null,
      opening_balance,
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
      code,
      category,
      subtype,
      parent,
      opening_balance,
      currency,
      gst_treatment,
      gst_rate,
      description,
      is_active,
    } = req.body;

    const account = await Account.findById(req.params.id);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    // Check if name is being changed and if it conflicts
    if (name && name !== account.name) {
      const existingAccount = await Account.findOne({
        name,
        _id: { $ne: req.params.id },
      });
      if (existingAccount) {
        return res.status(400).json({
          success: false,
          message: "Account with this name already exists",
        });
      }
    }

    // Check if code is being changed and if it conflicts
    if (code && code !== account.code) {
      const existingCode = await Account.findOne({
        code,
        _id: { $ne: req.params.id },
      });
      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: "Account with this code already exists",
        });
      }
    }

    // Update the account
    const updatedAccount = await Account.findByIdAndUpdate(
      req.params.id,
      {
        name,
        code,
        category,
        subtype,
        parent: parent || null,
        opening_balance,
        currency,
        gst_treatment,
        gst_rate,
        description,
        is_active,
      },
      { new: true, runValidators: true }
    ).populate("parent", "name code");

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
 * Delete an account (soft delete by setting is_active to false)
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
    const hasChildren = await Account.findOne({ parent: req.params.id });
    if (hasChildren) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete account with child accounts",
      });
    }

    // Check if account has balance
    if (account.balance !== 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete account with non-zero balance",
      });
    }

    // Soft delete by setting is_active to false
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
      .sort({ code: 1 })
      .populate("parent", "name code");

    // Build hierarchy
    const buildHierarchy = (accounts, parentId = null) => {
      return accounts
        .filter((account) =>
          parentId === null
            ? !account.parent
            : account.parent && account.parent._id.toString() === parentId
        )
        .map((account) => ({
          ...account.toObject(),
          children: buildHierarchy(accounts, account._id.toString()),
        }));
    };

    const hierarchy = buildHierarchy(accounts);

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
