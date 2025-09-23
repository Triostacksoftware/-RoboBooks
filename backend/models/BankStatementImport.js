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
    deposits: String,
    category: String,
    status: String
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
    date: { type: Date },
    description: { type: String, default: '' },
    payee: { type: String, default: '' },
    referenceNumber: { type: String, default: '' },
    withdrawals: { type: Number, default: 0 },
    deposits: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    type: { type: String, default: 'unknown' },
    category: { type: String, default: '' },
    status: { type: String, default: 'ready' },
    errors: { type: [String], default: [] }
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


