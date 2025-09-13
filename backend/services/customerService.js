// Customer service for dashboard statistics
const Customer = require('../models/Customer');

const getCustomerStats = async () => {
  try {
    const [
      total,
      active,
      business,
      individual
    ] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ status: 'active' }),
      Customer.countDocuments({ customerType: 'business' }),
      Customer.countDocuments({ customerType: 'individual' })
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

module.exports = {
  getCustomerStats
};
