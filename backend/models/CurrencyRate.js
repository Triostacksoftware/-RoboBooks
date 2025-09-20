import mongoose from 'mongoose';

const currencyRateSchema = new mongoose.Schema({
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
  rate: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  source: {
    type: String,
    required: true,
    enum: ['ExchangeRate-API.com', 'Manual Entry', 'RBI', 'BANK']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Ensure unique combination of fromCurrency, toCurrency, and date
currencyRateSchema.index({ fromCurrency: 1, toCurrency: 1, date: 1 }, { unique: true });

// Index for efficient querying
currencyRateSchema.index({ userId: 1, isActive: 1, date: -1 });

export default mongoose.model('CurrencyRate', currencyRateSchema);
