import mongoose from 'mongoose';

const bankStatementImportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['csv', 'excel', 'pdf', 'ofx', 'qif', 'camt']
  },
  importStatus: {
    type: String,
    enum: ['uploading', 'processing', 'mapping', 'preview', 'imported', 'failed'],
    default: 'uploading'
  },
  totalRows: {
    type: Number,
    default: 0
  },
  importedRows: {
    type: Number,
    default: 0
  },
  errorRows: {
    type: Number,
    default: 0
  },
  fieldMapping: {
    date: String,
    description: String,
    payee: String,
    referenceNumber: String,
    withdrawals: String,
    deposits: String
  },
  dateFormat: {
    type: String,
    default: 'yyyy-MM-dd'
  },
  decimalFormat: {
    type: String,
    default: '1234567.89'
  },
  originalHeaders: [String],
  processedData: [{
    date: Date,
    description: String,
    payee: String,
    referenceNumber: String,
    withdrawals: Number,
    deposits: Number,
    amount: Number,
    type: String,
    status: String,
    errors: [String]
  }],
  errors: [{
    row: Number,
    field: String,
    message: String,
    value: String
  }],
  importBatchId: {
    type: String,
    unique: true
  }
}, {
  timestamps: true
});

// Generate unique import batch ID
bankStatementImportSchema.pre('save', function(next) {
  if (!this.importBatchId) {
    this.importBatchId = `IMPORT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

export default mongoose.model('BankStatementImport', bankStatementImportSchema);
