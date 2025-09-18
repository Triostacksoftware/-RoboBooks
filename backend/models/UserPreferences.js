import mongoose from 'mongoose';

const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  module: {
    type: String,
    required: true,
    enum: [
      'general', 'sales', 'purchases', 'organization', 'users', 'reports', 
      'payments', 'setup', 'customization', 'expenses', 'bills', 'payments-made', 
      'purchase-orders', 'vendor-credits', 'vendors', 'recurring-bills', 
      'recurring-expenses', 'recurring-invoices', 'invoices', 'estimates',
      'quotes', 'sales-orders', 'delivery-challans', 'credit-notes',
      'debit-notes', 'banking', 'accountant', 'time-tracking', 'documents'
    ]
  },
  preferences: {
    // General display preferences
    defaultSortBy: { type: String, default: 'createdAt' },
    defaultSortOrder: { type: String, enum: ['asc', 'desc'], default: 'desc' },
    itemsPerPage: { type: Number, default: 25 },
    showFilters: { type: Boolean, default: true },
    showEmptyStates: { type: Boolean, default: true },
    
    // Column management
    showColumns: { type: Map, of: Boolean },
    columnWidths: { type: Map, of: Number },
    columnOrder: [{ type: String }],
    
    // Auto refresh settings
    autoRefresh: { type: Boolean, default: false },
    refreshInterval: { type: Number, default: 5 }, // in minutes
    
    // Filter preferences
    defaultFilters: [{ type: mongoose.Schema.Types.Mixed }],
    savedFilters: [{ 
      name: String, 
      filters: mongoose.Schema.Types.Mixed,
      isDefault: { type: Boolean, default: false }
    }],
    
    // UI preferences
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'light' },
    compactMode: { type: Boolean, default: false },
    showTooltips: { type: Boolean, default: true },
    
    // Module-specific preferences
    moduleSettings: { type: Map, of: mongoose.Schema.Types.Mixed },
    
    // Notification preferences
    notifications: {
      email: { type: Boolean, default: true },
      browser: { type: Boolean, default: true },
      sound: { type: Boolean, default: false },
      types: [{ type: String }] // ['reminders', 'updates', 'alerts']
    },
    
    // Export/Import preferences
    exportFormat: { type: String, enum: ['excel', 'csv', 'pdf'], default: 'excel' },
    includeHeaders: { type: Boolean, default: true },
    
    // Advanced settings
    advanced: { type: Map, of: mongoose.Schema.Types.Mixed }
  }
}, { timestamps: true });

// Create compound index for efficient queries
userPreferencesSchema.index({ userId: 1, organizationId: 1, module: 1 }, { unique: true });

export default mongoose.model('UserPreferences', userPreferencesSchema);


