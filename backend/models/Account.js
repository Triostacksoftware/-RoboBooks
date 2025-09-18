// backend/models/Account.js
import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * 5 Fixed Account Heads (as taught)
 */
export const ACCOUNT_HEADS = [
  "asset",
  "liability",
  "equity",
  "income",
  "expense",
];

/**
 * Account Groups for each Account Head (as specified)
 */
export const ACCOUNT_GROUPS = {
  asset: [
    "Current Asset",
    "Non-Current Asset",
    "Fixed Asset",
    "Investment",
    "Bank",
    "Cash",
    "Accounts Receivable",
    "Inventory",
    "Prepaid Expenses",
    "Other Current Asset",
    "Other Asset",
  ],
  liability: [
    "Current Liability",
    "Non-Current Liability",
    "Provisions",
    "Loans",
    "Accounts Payable",
    "Credit Card",
    "Long Term Borrowings",
    "Bonds Payable",
    "Other Current Liability",
    "Other Liability",
  ],
  equity: [
    "Capital Account",
    "Owner Equity",
    "Retained Earnings",
    "Capital",
    "Drawings",
    "Partner's Capital",
    "Proprietor's Capital",
  ],
  income: [
    "Direct Income",
    "Indirect Income",
    "Sales",
    "Service Revenue",
    "Other Income",
    "Interest Income",
    "Commission Income",
  ],
  expense: [
    "Direct Expense",
    "Indirect Expense",
    "Cost of Goods Sold",
    "Operating Expense",
    "Other Expense",
    "Salary Expense",
    "Rent Expense",
    "Utilities Expense",
    "Advertising Expense",
    "Depreciation Expense",
    "Interest Expense",
    "Tax Expense",
  ],
};

/**
 * Balance Type Rules (as taught)
 */
export const BALANCE_TYPE_RULES = {
  asset: "debit",
  expense: "debit",
  liability: "credit",
  equity: "credit",
  income: "credit",
};

const accountSchema = new Schema(
  {
    /**
     * 8-digit unique account code (as required)
     */
    code: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{8}$/.test(v); // Exactly 8 digits
        },
        message: "Account code must be exactly 8 digits",
      },
    },

    /** Account Name */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    /** Account Head (5 fixed categories) */
    accountHead: {
      type: String,
      enum: ACCOUNT_HEADS,
      required: true,
    },

    /** Account Group */
    accountGroup: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          // Be more flexible - accept any account group name
          // The predefined groups are suggestions, but custom groups should be allowed
          return true; // Accept all account group names
        },
        message: "Account group is required",
      },
    },

    /** Parent account for hierarchy */
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Account",
      default: null,
    },

    /** Opening balance */
    openingBalance: {
      type: Number,
      default: 0,
    },

    /** Current balance */
    balance: {
      type: Number,
      default: 0,
    },

    /** Balance Type (inherited from account head) */
    balanceType: {
      type: String,
      enum: ["debit", "credit"],
      required: true,
    },

    /** Currency */
    currency: {
      type: String,
      default: "INR",
    },

    /** Active status */
    isActive: {
      type: Boolean,
      default: true,
    },

    /** Description */
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

/* ── Indexes ──────────────────────────────────────────────── */
accountSchema.index({ code: 1 }, { unique: true });
accountSchema.index({ parent: 1, name: 1 }, { unique: true });
accountSchema.index({ accountHead: 1, accountGroup: 1 });
accountSchema.index({ isActive: 1 });

/* ── Pre-save middleware ──────────────────────────────────────────────── */
accountSchema.pre("save", function (next) {
  // Auto-set balance type based on account head
  if (!this.balanceType) {
    this.balanceType = BALANCE_TYPE_RULES[this.accountHead];
  }

  // Generate 8-digit code if not provided
  if (!this.code) {
    this.code = this.generateAccountCode();
  }

  next();
});

/* ── Methods ──────────────────────────────────────────────── */
// Generate unique 8-digit account code
accountSchema.methods.generateAccountCode = async function () {
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
  } while (await this.constructor.exists({ code: code.toString() }));

  return code.toString();
};

// Get full account path
accountSchema.methods.getFullPath = async function () {
  const path = [this.name];
  let current = this;

  while (current.parent) {
    current = await this.constructor.findById(current.parent);
    if (current) {
      path.unshift(current.name);
    } else {
      break;
    }
  }

  return path.join(" > ");
};

// Check if account can be deleted
accountSchema.methods.canDelete = async function () {
  // Check if has children
  const hasChildren = await this.constructor.exists({
    parent: this._id,
    isActive: true,
  });
  if (hasChildren) return false;

  // Check if has balance
  if (this.balance !== 0) return false;

  return true;
};

/* ── Statics ──────────────────────────────────────────────── */
// Get accounts by account head
accountSchema.statics.getByAccountHead = function (accountHead) {
  return this.find({ accountHead, isActive: true }).sort({ name: 1 });
};

// Get accounts by account group
accountSchema.statics.getByAccountGroup = function (accountGroup) {
  return this.find({ accountGroup, isActive: true }).sort({ name: 1 });
};

// Get parent accounts
accountSchema.statics.getParentAccounts = function () {
  return this.find({ parent: null, isActive: true }).sort({ name: 1 });
};

// Get sub-accounts
accountSchema.statics.getSubAccounts = function (parentId) {
  return this.find({ parent: parentId, isActive: true }).sort({ name: 1 });
};

// Get account hierarchy
accountSchema.statics.getHierarchy = function () {
  return this.find({ isActive: true })
    .populate("parent", "name code")
    .sort({ accountHead: 1, name: 1 });
};

export default mongoose.model("Account", accountSchema);


