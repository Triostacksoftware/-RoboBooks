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
 * e.g. “Bank”, “Accounts Receivable”, “Fixed Asset”, etc.
 * You can extend / localize this list anytime.
 */
export const ACCOUNT_SUBTYPES = [
  // Assets
  'bank', 'cash', 'accounts_receivable', 'fixed_asset', 'inventory', 'other_asset',
  // Liabilities
  'accounts_payable', 'credit_card', 'current_liability', 'long_term_liability',
  // Equity
  'owner_equity', 'retained_earnings',
  // Income
  'sales', 'other_income',
  // Expenses
  'cost_of_goods_sold', 'operating_expense', 'other_expense',
];

const accountSchema = new Schema(
  {
    /**
     * Short code / number shown in COA (e.g. “1001”).
     * Make unique among leaf nodes for easier look-ups.
     */
    code: { type: String, trim: true },

    /** Human-readable name (“Cash”, “Sales Revenue”, …) */
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
     * Enables “Cash” inside “Current Assets” for example.
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

/* ── Helpers ──────────────────────────────────────────────── */

// Whether this account has children (i.e. is a group header)
accountSchema.virtual('is_group').get(function () {
  return this.subtype === undefined && this.opening_balance === 0 && this.balance === 0;
});

/* ── Pre-save ─────────────────────────────────────────────── */

// If creating the account, initialise running balance = opening_balance
accountSchema.pre('save', function (next) {
  if (this.isNew) {
    this.balance = this.opening_balance;
  }
  next();
});

export default mongoose.model('Account', accountSchema);
