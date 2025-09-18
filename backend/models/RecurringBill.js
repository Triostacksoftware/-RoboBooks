import mongoose from 'mongoose';

const recurringBillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  vendorName: {
    type: String,
    required: true
  },
  vendorEmail: {
    type: String
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  nextDueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'paused'],
    default: 'active'
  },
  description: {
    type: String
  },
  category: {
    type: String
  },
  autoCreate: {
    type: Boolean,
    default: false
  },
  lastCreated: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

// Indexes for efficient queries
recurringBillSchema.index({ organizationId: 1, status: 1 });
recurringBillSchema.index({ organizationId: 1, vendorId: 1 });
recurringBillSchema.index({ organizationId: 1, nextDueDate: 1 });
recurringBillSchema.index({ organizationId: 1, frequency: 1 });

// Method to calculate next due date based on frequency
recurringBillSchema.methods.calculateNextDueDate = function() {
  const now = new Date();
  let nextDate = new Date(this.nextDueDate);
  
  while (nextDate <= now) {
    switch (this.frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }
  }
  
  return nextDate;
};

// Method to create a bill from this recurring bill
recurringBillSchema.methods.createBill = function() {
  const Bill = mongoose.model('Bill');
  
  const billData = {
    billNumber: `BILL-${Date.now()}`,
    vendorId: this.vendorId,
    vendorName: this.vendorName,
    vendorEmail: this.vendorEmail,
    billDate: new Date(),
    dueDate: this.nextDueDate,
    status: 'draft',
    subtotal: this.amount,
    taxAmount: 0,
    totalAmount: this.amount,
    currency: this.currency,
    notes: this.description,
    items: [{
      itemId: `item-${Date.now()}`,
      itemName: this.name,
      description: this.description,
      quantity: 1,
      unitPrice: this.amount,
      totalPrice: this.amount,
      taxRate: 0,
      taxAmount: 0
    }],
    createdBy: this.createdBy,
    organizationId: this.organizationId
  };
  
  return new Bill(billData);
};

export default mongoose.models.RecurringBill || mongoose.model('RecurringBill', recurringBillSchema);


