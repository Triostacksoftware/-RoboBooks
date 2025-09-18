import mongoose from "mongoose";

const budgetItemSchema = new mongoose.Schema({
  account: {
    type: String,
    required: true,
    trim: true
  },
  budgetedAmount: {
    type: Number,
    required: true,
    min: 0
  },
  actualAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  variance: {
    type: Number,
    default: 0
  },
  variancePercentage: {
    type: Number,
    default: 0
  }
});

const budgetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  fiscalYear: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  budgetType: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  items: [budgetItemSchema],
  totalBudgeted: {
    type: Number,
    required: true,
    min: 0
  },
  totalActual: {
    type: Number,
    default: 0,
    min: 0
  },
  totalVariance: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  createdBy: {
    type: String,
    required: true
  },
  approvedBy: {
    type: String
  },
  approvedAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
budgetSchema.index({ name: 1 });
budgetSchema.index({ fiscalYear: 1 });
budgetSchema.index({ status: 1 });
budgetSchema.index({ createdBy: 1 });

// Pre-save middleware to calculate totals
budgetSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalBudgeted = this.items.reduce((sum, item) => sum + (item.budgetedAmount || 0), 0);
    this.totalActual = this.items.reduce((sum, item) => sum + (item.actualAmount || 0), 0);
    this.totalVariance = this.totalBudgeted - this.totalActual;
    
    // Calculate variance percentages
    this.items.forEach(item => {
      item.variance = (item.budgetedAmount || 0) - (item.actualAmount || 0);
      item.variancePercentage = item.budgetedAmount > 0 ? 
        ((item.variance / item.budgetedAmount) * 100) : 0;
    });
  }
  next();
});

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;


