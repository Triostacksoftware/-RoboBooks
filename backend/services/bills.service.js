import Bill from '../models/bill.model.js';

export const createBill    = (data) => Bill.create(data);
export const getBillById   = (id)   => Bill.findById(id);

// Get bill statistics
export const getBillStats = async (filters = {}) => {
  try {
    const { startDate, endDate, vendorId, status } = filters;
    
    // Build filter object
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (vendorId) filter.vendor_id = vendorId;
    if (status) filter.status = status;

    // Get basic counts
    const [
      totalBills,
      paidBills,
      pendingBills,
      overdueBills
    ] = await Promise.all([
      Bill.countDocuments(filter),
      Bill.countDocuments({ ...filter, status: "paid" }),
      Bill.countDocuments({ ...filter, status: "pending" }),
      Bill.countDocuments({ ...filter, status: "overdue" })
    ]);

    // Get expense statistics
    const expenseStats = await Bill.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: "$total" },
          paidExpenses: { $sum: { $cond: [{ $eq: ["$status", "paid"] }, "$total", 0] } },
          pendingExpenses: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, "$total", 0] } },
          overdueExpenses: { $sum: { $cond: [{ $eq: ["$status", "overdue"] }, "$total", 0] } }
        }
      }
    ]);

    const stats = expenseStats[0] || {
      totalExpenses: 0,
      paidExpenses: 0,
      pendingExpenses: 0,
      overdueExpenses: 0
    };

    return {
      totalBills,
      paidBills,
      pendingBills,
      overdueBills,
      totalExpenses: stats.totalExpenses,
      paidExpenses: stats.paidExpenses,
      pendingExpenses: stats.pendingExpenses,
      overdueExpenses: stats.overdueExpenses
    };
  } catch (error) {
    throw new Error(`Failed to get bill statistics: ${error.message}`);
  }
};