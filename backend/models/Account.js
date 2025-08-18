// backend/models/Account.js
import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * Zoho Books-style account categories
 * (top-level buckets in the chart of accounts)
 */
export const ACCOUNT_CATEGORIES = [
  'asset',
  'liability',
  'equity',
  'income',
  'expense',
];

/**
 * Optional detailed sub-types (used in Zoho Books UI):
 * e.g. "Bank", "Accounts Receivable", "Fixed Asset", etc.
 * You can extend / localize this list anytime.
 */
export const ACCOUNT_SUBTYPES = [
  'bank',
  'cash',
  'accounts_receivable',
  'fixed_asset',
  'inventory',
  'other_asset',
  'current_asset',
  'investment',
  'accounts_payable',
  'credit_card',
  'current_liability',
  'long_term_liability',
  'provisions',
  'owner_equity',
  'retained_earnings',
  'sales',
  'other_income',
  'direct_income',
  'indirect_income',
  'cost_of_goods_sold',
  'operating_expense',
  'other_expense',
  'direct_expense',
  'indirect_expense',
];

const accountSchema = new Schema(
  {
    /**
     * Short code / number shown in COA (e.g. "1001").
     * Make unique among leaf nodes for easier look-ups.
     */
    code: { type: String, trim: true },

    /** Human-readable name ("Cash", "Sales Revenue", …) */
    name: { type: String, required: true, trim: true },

    /** Top-level category (asset, liability, …) */
    category: {
      type: String,
      enum: ACCOUNT_CATEGORIES,
      required: true,
    },

    /** Optional sub-type (bank, AR, sales, etc.) */
    subtype: { type: String, enum: ACCOUNT_SUBTYPES },

    /**
     * Hierarchical parent; null for top-level accounts.
     * Enables "Cash" inside "Current Assets" for example.
     */
    parent: { type: Schema.Types.ObjectId, ref: 'Account', default: null },

    /** Opening balance when the book was created */
    opening_balance: { type: Number, default: 0 },

    /** Current running balance (updated by journals / bank txns) */
    balance: { type: Number, default: 0 },

    /** ISO currency code (Zoho lets multi-currency ledgers) */
    currency: { type: String, default: 'INR' },

    /** Active flag – archived accounts stay for history but disappear from dropdowns */
    is_active: { type: Boolean, default: true },

    /** GST / tax helper fields (India-specific) */
    gst_treatment: {
      type: String,
      enum: ['taxable', 'exempt', 'nil_rated', 'non_gst'],
      default: 'taxable',
    },
    gst_rate: { type: Number, default: 0 }, // e.g. 0, 5, 12, 18, 28

    /** Free-text notes / description */
    description: { type: String },
  },
  { timestamps: true },
);

/* ── Indexes ──────────────────────────────────────────────── */
// Unique name scoped to sibling accounts (parent + name)
accountSchema.index({ parent: 1, name: 1 }, { unique: true });
// Optionally ensure code is unique across the tenant
accountSchema.index({ code: 1 }, { unique: true, sparse: true });

/* ── Virtuals ──────────────────────────────────────────────── */
// Virtual for account type display
accountSchema.virtual('accountType').get(function() {
  return this.category.charAt(0).toUpperCase() + this.category.slice(1);
});

// Virtual for account group (parent name or subtype)
accountSchema.virtual('accountGroup').get(function() {
  return this.parent ? this.parent.name : (this.subtype || 'Other');
});

// Virtual for balance type (credit/debit)
accountSchema.virtual('balanceType').get(function() {
  return this.balance >= 0 ? 'debit' : 'credit';
});

// Virtual for sub-account count
accountSchema.virtual('subAccountCount').get(async function() {
  const count = await this.constructor.countDocuments({ parent: this._id, is_active: true });
  return count;
});

/* ── Methods ──────────────────────────────────────────────── */
// Method to get full account path
accountSchema.methods.getFullPath = async function() {
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
  
  return path.join(' > ');
};

// Method to check if account can be deleted
accountSchema.methods.canDelete = async function() {
  // Check if has children
  const hasChildren = await this.constructor.exists({ parent: this._id, is_active: true });
  if (hasChildren) return false;
  
  // Check if has balance
  if (this.balance !== 0) return false;
  
  return true;
};

/* ── Statics ──────────────────────────────────────────────── */
// Static method to get accounts by category
accountSchema.statics.getByCategory = function(category) {
  return this.find({ category, is_active: true }).sort({ name: 1 });
};

// Static method to get account hierarchy
accountSchema.statics.getHierarchy = function() {
  return this.find({ is_active: true })
    .populate('parent', 'name')
    .sort({ category: 1, name: 1 });
};

// Static method to get parent accounts
accountSchema.statics.getParentAccounts = function() {
  return this.find({ parent: null, is_active: true }).sort({ name: 1 });
};

// Static method to get sub-accounts
accountSchema.statics.getSubAccounts = function(parentId) {
  return this.find({ parent: parentId, is_active: true }).sort({ name: 1 });
};

export default mongoose.model('Account', accountSchema);
