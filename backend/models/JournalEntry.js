import mongoose from 'mongoose';

const journalEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  entryNumber: {
    type: String,
    required: true,
    unique: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  reference: {
    type: String,
    maxlength: 100
  },
  source: {
    type: String,
    required: true,
    enum: ['currency_adjustment', 'manual', 'system', 'import']
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'sourceModel'
  },
  sourceModel: {
    type: String,
    enum: ['CurrencyAdjustment', 'ManualEntry', 'SystemEntry', 'ImportEntry']
  },
  status: {
    type: String,
    enum: ['draft', 'posted', 'reversed'],
    default: 'draft'
  },
  totalDebit: {
    type: Number,
    required: true,
    min: 0
  },
  totalCredit: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    uppercase: true,
    enum: [
      'USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY',
      'NZD', 'KRW', 'SGD', 'HKD', 'BRL', 'MXN', 'RUB', 'ZAR', 'TRY',
      'SEK', 'NOK', 'DKK', 'AED', 'THB', 'MYR', 'IDR', 'PHP', 'VND',
      'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'HRK', 'RSD', 'UAH', 'KZT'
    ]
  },
  exchangeRate: {
    type: Number,
    min: 0
  },
  lineItems: [{
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true
    },
    accountName: {
      type: String,
      required: true
    },
    description: {
      type: String,
      maxlength: 200
    },
    debit: {
      type: Number,
      default: 0,
      min: 0
    },
    credit: {
      type: Number,
      default: 0,
      min: 0
    },
    currency: {
      type: String,
      required: true,
      uppercase: true
    },
    exchangeRate: {
      type: Number,
      min: 0
    },
    baseAmount: {
      type: Number,
      min: 0
    }
  }],
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: {
    type: String,
    maxlength: 1000
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  reversedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reversedAt: {
    type: Date
  },
  reversalReason: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
journalEntrySchema.index({ userId: 1, date: -1 });
journalEntrySchema.index({ entryNumber: 1 });
journalEntrySchema.index({ source: 1, sourceId: 1 });
journalEntrySchema.index({ status: 1, userId: 1 });

// Pre-save middleware to generate entry number
journalEntrySchema.pre('save', async function(next) {
  if (this.isNew && !this.entryNumber) {
    const count = await this.constructor.countDocuments({ userId: this.userId });
    this.entryNumber = `JE-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtual for balance validation
journalEntrySchema.virtual('isBalanced').get(function() {
  return Math.abs(this.totalDebit - this.totalCredit) < 0.01;
});

// Method to validate journal entry
journalEntrySchema.methods.validateEntry = function() {
  const errors = [];
  
  if (this.lineItems.length < 2) {
    errors.push('Journal entry must have at least 2 line items');
  }
  
  if (!this.isBalanced) {
    errors.push('Journal entry is not balanced (debits must equal credits)');
  }
  
  const hasDebit = this.lineItems.some(item => item.debit > 0);
  const hasCredit = this.lineItems.some(item => item.credit > 0);
  
  if (!hasDebit || !hasCredit) {
    errors.push('Journal entry must have both debit and credit entries');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);

export default JournalEntry;
