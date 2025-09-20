// Report service for dashboard statistics
import Report from '../models/Report.js';

export const getReportStats = async () => {
  try {
    // Get basic report statistics
    const totalGenerated = await Report.countDocuments();
    
    // Calculate total revenue from reports (if reports have revenue data)
    const revenueStats = await Report.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $ifNull: ["$totalRevenue", 0] } }
        }
      }
    ]);

    return {
      totalGenerated,
      totalRevenue: revenueStats[0]?.totalRevenue || 0
    };
  } catch (error) {
    console.error('Error getting report stats:', error);
    return {
      totalGenerated: 0,
      totalRevenue: 0
    };
  }
};

export default {
  getReportStats
};


