// Customer service for dashboard statistics
import Customer from '../models/Customer.js';

export const getCustomerStats = async () => {
  try {
    const [
      total,
      active,
      business,
      individual
    ] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ status: 'active' }),
      Customer.countDocuments({ customerType: 'Business' }),
      Customer.countDocuments({ customerType: 'Individual' })
    ]);

    return {
      total,
      active,
      business,
      individual
    };
  } catch (error) {
    console.error('Error getting customer stats:', error);
    return {
      total: 0,
      active: 0,
      business: 0,
      individual: 0
    };
  }
};

export default {
  getCustomerStats
};


