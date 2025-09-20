import mongoose from 'mongoose';

const userPreferencesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  baseCurrency: {
    type: String,
    required: true,
    default: 'USD',
    uppercase: true,
    enum: [
      'USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY',
      'NZD', 'KRW', 'SGD', 'HKD', 'BRL', 'MXN', 'RUB', 'ZAR', 'TRY',
      'SEK', 'NOK', 'DKK', 'AED', 'THB', 'MYR', 'IDR', 'PHP', 'VND',
      'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'HRK', 'RSD', 'UAH', 'KZT'
    ]
  },
  currencySettings: {
    autoRefresh: {
      type: Boolean,
      default: true
    },
    refreshInterval: {
      type: Number,
      default: 10, // minutes
      min: 1,
      max: 60
    },
    notifications: {
      rateAlerts: {
        type: Boolean,
        default: true
      },
      email: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    displaySettings: {
      dateFormat: {
        type: String,
        default: 'MM/DD/YYYY',
        enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']
      },
      numberFormat: {
        type: String,
        default: 'US',
        enum: ['US', 'EU', 'IN']
      },
      timezone: {
        type: String,
        default: 'UTC'
      }
    }
  },
  dashboardSettings: {
    defaultView: {
      type: String,
      default: 'rates',
      enum: ['rates', 'adjustments', 'analytics']
    },
    widgets: [{
      type: {
        type: String,
        enum: ['performance', 'exposure', 'alerts', 'recent_rates']
      },
      position: {
        x: Number,
        y: Number
      },
      size: {
        width: Number,
        height: Number
      },
      enabled: {
        type: Boolean,
        default: true
      }
    }]
  }
}, {
  timestamps: true
});

// Index for faster queries
userPreferencesSchema.index({ userId: 1 });

const UserPreferences = mongoose.model('UserPreferences', userPreferencesSchema);

export default UserPreferences;