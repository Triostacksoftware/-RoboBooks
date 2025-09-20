import mongoose from 'mongoose';

const rateAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fromCurrency: {
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
  toCurrency: {
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
  targetRate: {
    type: Number,
    required: true,
    min: 0
  },
  condition: {
    type: String,
    required: true,
    enum: ['above', 'below', 'equals']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isTriggered: {
    type: Boolean,
    default: false
  },
  triggeredAt: {
    type: Date
  },
  currentRate: {
    type: Number
  },
  notificationSettings: {
    email: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    },
    inApp: {
      type: Boolean,
      default: true
    }
  },
  description: {
    type: String,
    maxlength: 200
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Index for efficient queries
rateAlertSchema.index({ userId: 1, isActive: 1 });
rateAlertSchema.index({ fromCurrency: 1, toCurrency: 1, isActive: 1 });

const RateAlert = mongoose.model('RateAlert', rateAlertSchema);

export default RateAlert;
