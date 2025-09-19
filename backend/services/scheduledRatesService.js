import cron from 'node-cron';
import CurrencyRate from '../models/CurrencyRate.js';
import { fetchRealTimeRate } from './exchangeRateService.js';

// Common currency pairs that should be updated regularly
const COMMON_CURRENCY_PAIRS = [
  { from: 'USD', to: 'INR' },
  { from: 'EUR', to: 'INR' },
  { from: 'GBP', to: 'INR' },
  { from: 'USD', to: 'EUR' },
  { from: 'USD', to: 'GBP' },
  { from: 'EUR', to: 'USD' },
  { from: 'GBP', to: 'USD' },
  { from: 'USD', to: 'JPY' },
  { from: 'USD', to: 'CAD' },
  { from: 'USD', to: 'AUD' }
];

/**
 * Update exchange rates for all users
 */
const updateExchangeRatesForAllUsers = async () => {
  try {
    console.log('🔄 Starting scheduled exchange rate update...');
    
    // Get all unique user IDs from existing rates
    const users = await CurrencyRate.distinct('userId');
    console.log(`📊 Found ${users.length} users to update rates for`);

    let totalUpdated = 0;
    let totalErrors = 0;

    for (const userId of users) {
      console.log(`🔄 Updating rates for user: ${userId}`);
      
      for (const pair of COMMON_CURRENCY_PAIRS) {
        try {
          const result = await fetchRealTimeRate(pair.from, pair.to);
          
          if (result.success) {
            // Check if rate already exists for today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const existingRate = await CurrencyRate.findOne({
              fromCurrency: result.data.fromCurrency,
              toCurrency: result.data.toCurrency,
              userId: userId,
              date: { $gte: today, $lt: tomorrow }
            });

            if (existingRate) {
              // Update existing rate
              await CurrencyRate.findByIdAndUpdate(
                existingRate._id,
                { 
                  rate: result.data.rate,
                  source: 'SCHEDULED_UPDATE',
                  notes: `Auto-updated via scheduled job`,
                  updatedAt: new Date()
                }
              );
              console.log(`✅ Updated existing rate: ${pair.from} → ${pair.to} = ${result.data.rate}`);
            } else {
              // Create new rate
              const rateData = {
                ...result.data,
                userId: userId,
                source: 'SCHEDULED_UPDATE',
                notes: `Auto-created via scheduled job`
              };
              const newRate = new CurrencyRate(rateData);
              await newRate.save();
              console.log(`✅ Created new rate: ${pair.from} → ${pair.to} = ${result.data.rate}`);
            }
            
            totalUpdated++;
          } else {
            console.log(`❌ Failed to fetch rate for ${pair.from} → ${pair.to}: ${result.error}`);
            totalErrors++;
          }
        } catch (error) {
          console.error(`❌ Error updating rate ${pair.from} → ${pair.to} for user ${userId}:`, error.message);
          totalErrors++;
        }
      }
    }

    console.log(`🎉 Scheduled update completed! Updated: ${totalUpdated}, Errors: ${totalErrors}`);
  } catch (error) {
    console.error('❌ Error in scheduled exchange rate update:', error.message);
  }
};

/**
 * Initialize default exchange rates for a new user
 */
export const initializeDefaultRatesForUser = async (userId) => {
  try {
    console.log(`🔄 Initializing default rates for new user: ${userId}`);
    
    for (const pair of COMMON_CURRENCY_PAIRS) {
      try {
        const result = await fetchRealTimeRate(pair.from, pair.to);
        
        if (result.success) {
          // Check if rate already exists for today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const existingRate = await CurrencyRate.findOne({
            fromCurrency: result.data.fromCurrency,
            toCurrency: result.data.toCurrency,
            userId: userId,
            date: { $gte: today, $lt: tomorrow }
          });

          if (!existingRate) {
            // Create new rate
            const rateData = {
              ...result.data,
              userId: userId,
              source: 'INITIAL_SETUP',
              notes: `Initial setup for new user`
            };
            const newRate = new CurrencyRate(rateData);
            await newRate.save();
            console.log(`✅ Created initial rate: ${pair.from} → ${pair.to} = ${result.data.rate}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error creating initial rate ${pair.from} → ${pair.to}:`, error.message);
      }
    }
    
    console.log(`✅ Default rates initialized for user: ${userId}`);
  } catch (error) {
    console.error('❌ Error initializing default rates:', error.message);
  }
};

/**
 * Start the scheduled exchange rate updates
 */
export const startScheduledRateUpdates = () => {
  console.log('🚀 Starting scheduled exchange rate updates...');
  
  // Update rates every 4 hours (4 times per day)
  cron.schedule('0 */4 * * *', () => {
    console.log('⏰ Scheduled exchange rate update triggered');
    updateExchangeRatesForAllUsers();
  }, {
    scheduled: true,
    timezone: "UTC"
  });

  // Also update rates every day at 9 AM UTC
  cron.schedule('0 9 * * *', () => {
    console.log('⏰ Daily exchange rate update triggered');
    updateExchangeRatesForAllUsers();
  }, {
    scheduled: true,
    timezone: "UTC"
  });

  console.log('✅ Scheduled exchange rate updates started');
  console.log('📅 Updates will run every 4 hours and daily at 9 AM UTC');
};

/**
 * Stop the scheduled updates
 */
export const stopScheduledRateUpdates = () => {
  console.log('🛑 Stopping scheduled exchange rate updates...');
  cron.getTasks().forEach(task => {
    task.destroy();
  });
  console.log('✅ Scheduled exchange rate updates stopped');
};

/**
 * Manually trigger an update (for testing or immediate updates)
 */
export const triggerManualUpdate = async () => {
  console.log('🔄 Manual exchange rate update triggered');
  await updateExchangeRatesForAllUsers();
};
