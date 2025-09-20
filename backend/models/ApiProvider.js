import mongoose from 'mongoose';

const apiProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String,
    required: true
  },
  baseUrl: {
    type: String,
    required: true
  },
  apiKey: {
    type: String,
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  rateLimit: {
    requestsPerMinute: {
      type: Number,
      default: 60
    },
    requestsPerHour: {
      type: Number,
      default: 1000
    },
    requestsPerDay: {
      type: Number,
      default: 10000
    }
  },
  supportedCurrencies: [{
    type: String,
    uppercase: true,
    enum: [
      'USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY',
      'NZD', 'KRW', 'SGD', 'HKD', 'BRL', 'MXN', 'RUB', 'ZAR', 'TRY',
      'SEK', 'NOK', 'DKK', 'AED', 'THB', 'MYR', 'IDR', 'PHP', 'VND',
      'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'HRK', 'RSD', 'UAH', 'KZT'
    ]
  }],
  endpoints: {
    latest: {
      type: String,
      required: true
    },
    historical: {
      type: String,
      required: false
    },
    convert: {
      type: String,
      required: false
    }
  },
  responseFormat: {
    type: String,
    enum: ['json', 'xml'],
    default: 'json'
  },
  dataMapping: {
    rateField: {
      type: String,
      default: 'rate'
    },
    timestampField: {
      type: String,
      default: 'timestamp'
    },
    currencyField: {
      type: String,
      default: 'currency'
    }
  },
  headers: {
    type: Map,
    of: String
  },
  timeout: {
    type: Number,
    default: 10000 // 10 seconds
  },
  retryAttempts: {
    type: Number,
    default: 3
  },
  lastUsed: {
    type: Date
  },
  lastError: {
    message: String,
    timestamp: Date,
    errorCode: String
  },
  successRate: {
    type: Number,
    default: 100,
    min: 0,
    max: 100
  },
  totalRequests: {
    type: Number,
    default: 0
  },
  successfulRequests: {
    type: Number,
    default: 0
  },
  failedRequests: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    maxlength: 500
  },
  website: {
    type: String
  },
  documentation: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
apiProviderSchema.index({ isActive: 1, priority: 1 });
apiProviderSchema.index({ name: 1 });

// Method to update usage statistics
apiProviderSchema.methods.updateUsage = function(success = true) {
  this.totalRequests += 1;
  if (success) {
    this.successfulRequests += 1;
  } else {
    this.failedRequests += 1;
  }
  // Calculate success rate, handle division by zero
  this.successRate = this.totalRequests > 0 ? (this.successfulRequests / this.totalRequests) * 100 : 100;
  this.lastUsed = new Date();
  return this.save();
};

// Method to record error
apiProviderSchema.methods.recordError = function(error) {
  this.lastError = {
    message: error.message,
    timestamp: new Date(),
    errorCode: error.code || 'UNKNOWN'
  };
  this.failedRequests += 1;
  // Calculate success rate, handle division by zero
  this.successRate = this.totalRequests > 0 ? (this.successfulRequests / this.totalRequests) * 100 : 100;
  return this.save();
};

// Static method to get active providers ordered by priority
apiProviderSchema.statics.getActiveProviders = function() {
  return this.find({ isActive: true }).sort({ priority: 1, successRate: -1 });
};

const ApiProvider = mongoose.model('ApiProvider', apiProviderSchema);

export default ApiProvider;
