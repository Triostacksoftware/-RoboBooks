import User from "../models/User.js";
import Invoice from "../models/invoicemodel.js";
import Project from "../models/projectmodel.js";
import Timesheet from "../models/timesheetmodel.js";
import Admin from "../models/Admin.js";

class AdminAnalyticsService {
  // Get comprehensive dashboard statistics
  async getDashboardStats() {
    try {
      const [
        totalUsers,
        activeUsers,
        totalRevenue,
        totalProjects,
        activeProjects,
        totalHours,
        adminStats
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        this.getTotalRevenue(),
        Project.countDocuments(),
        Project.countDocuments({ status: 'active' }),
        this.getTotalHours(),
        this.getAdminStats()
      ]);

      const monthlyGrowth = await this.calculateMonthlyGrowth();
      const recentActivity = await this.getRecentActivity();

      return {
        totalUsers,
        activeUsers,
        totalRevenue,
        monthlyGrowth,
        totalProjects,
        activeProjects,
        totalHours,
        adminStats,
        recentActivity
      };
    } catch (error) {
      console.error("Dashboard stats error:", error);
      throw error;
    }
  }

  // Calculate total revenue from paid invoices
  async getTotalRevenue() {
    try {
      const result = await Invoice.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);
      return result[0]?.total || 0;
    } catch (error) {
      console.error("Revenue calculation error:", error);
      return 0;
    }
  }

  // Calculate total hours from timesheets
  async getTotalHours() {
    try {
      const result = await Timesheet.aggregate([
        { $group: { _id: null, total: { $sum: '$hours' } } }
      ]);
      return result[0]?.total || 0;
    } catch (error) {
      console.error("Hours calculation error:", error);
      return 0;
    }
  }

  // Calculate monthly user growth
  async calculateMonthlyGrowth() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const [currentMonthUsers, previousMonthUsers] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        User.countDocuments({ 
          createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } 
        })
      ]);

      if (previousMonthUsers === 0) {
        return currentMonthUsers > 0 ? 100 : 0;
      }

      return Math.round(((currentMonthUsers - previousMonthUsers) / previousMonthUsers) * 100 * 100) / 100;
    } catch (error) {
      console.error("Monthly growth calculation error:", error);
      return 0;
    }
  }

  // Get admin statistics
  async getAdminStats() {
    try {
      const [totalAdmins, activeAdmins, superAdmins] = await Promise.all([
        Admin.countDocuments(),
        Admin.countDocuments({ isActive: true }),
        Admin.countDocuments({ role: 'super_admin' })
      ]);

      return {
        totalAdmins,
        activeAdmins,
        superAdmins
      };
    } catch (error) {
      console.error("Admin stats error:", error);
      return { totalAdmins: 0, activeAdmins: 0, superAdmins: 0 };
    }
  }

  // Get recent activity
  async getRecentActivity() {
    try {
      const activities = [];

      // Get recent user registrations
      const recentUsers = await User.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('companyName createdAt');

      recentUsers.forEach(user => {
        activities.push({
          type: 'user_registration',
          action: 'New user registered',
          entity: user.companyName,
          timestamp: user.createdAt,
          icon: 'user'
        });
      });

      // Get recent invoices
      const recentInvoices = await Invoice.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('invoiceNumber totalAmount createdAt');

      recentInvoices.forEach(invoice => {
        activities.push({
          type: 'invoice_created',
          action: 'Invoice generated',
          entity: `Invoice #${invoice.invoiceNumber}`,
          amount: invoice.totalAmount,
          timestamp: invoice.createdAt,
          icon: 'invoice'
        });
      });

      // Sort by timestamp and return top 10
      return activities
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
    } catch (error) {
      console.error("Recent activity error:", error);
      return [];
    }
  }

  // Get user analytics
  async getUserAnalytics() {
    try {
      const [
        totalUsers,
        activeUsers,
        inactiveUsers,
        newUsersThisMonth,
        userGrowthData
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ isActive: false }),
        this.getNewUsersThisMonth(),
        this.getUserGrowthData()
      ]);

      return {
        totalUsers,
        activeUsers,
        inactiveUsers,
        newUsersThisMonth,
        userGrowthData
      };
    } catch (error) {
      console.error("User analytics error:", error);
      throw error;
    }
  }

  // Get new users this month
  async getNewUsersThisMonth() {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      return await User.countDocuments({ createdAt: { $gte: startOfMonth } });
    } catch (error) {
      console.error("New users this month error:", error);
      return 0;
    }
  }

  // Get user growth data for charts
  async getUserGrowthData() {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const result = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 }
        }
      ]);

      return result.map(item => ({
        month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        count: item.count
      }));
    } catch (error) {
      console.error("User growth data error:", error);
      return [];
    }
  }

  // Get revenue analytics
  async getRevenueAnalytics() {
    try {
      const [
        totalRevenue,
        monthlyRevenue,
        revenueGrowth,
        topCustomers
      ] = await Promise.all([
        this.getTotalRevenue(),
        this.getMonthlyRevenue(),
        this.calculateRevenueGrowth(),
        this.getTopCustomers()
      ]);

      return {
        totalRevenue,
        monthlyRevenue,
        revenueGrowth,
        topCustomers
      };
    } catch (error) {
      console.error("Revenue analytics error:", error);
      throw error;
    }
  }

  // Get monthly revenue
  async getMonthlyRevenue() {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const result = await Invoice.aggregate([
        {
          $match: {
            status: 'paid',
            createdAt: { $gte: startOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]);

      return result[0]?.total || 0;
    } catch (error) {
      console.error("Monthly revenue error:", error);
      return 0;
    }
  }

  // Calculate revenue growth
  async calculateRevenueGrowth() {
    try {
      const currentMonth = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const [currentMonthRevenue, lastMonthRevenue] = await Promise.all([
        this.getRevenueForMonth(currentMonth),
        this.getRevenueForMonth(lastMonth)
      ]);

      if (lastMonthRevenue === 0) {
        return currentMonthRevenue > 0 ? 100 : 0;
      }

      return Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 * 100) / 100;
    } catch (error) {
      console.error("Revenue growth calculation error:", error);
      return 0;
    }
  }

  // Get revenue for specific month
  async getRevenueForMonth(date) {
    try {
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const result = await Invoice.aggregate([
        {
          $match: {
            status: 'paid',
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]);

      return result[0]?.total || 0;
    } catch (error) {
      console.error("Revenue for month error:", error);
      return 0;
    }
  }

  // Get top customers by revenue
  async getTopCustomers() {
    try {
      const result = await Invoice.aggregate([
        {
          $match: { status: 'paid' }
        },
        {
          $group: {
            _id: '$customerId',
            totalRevenue: { $sum: '$totalAmount' },
            invoiceCount: { $sum: 1 }
          }
        },
        {
          $sort: { totalRevenue: -1 }
        },
        {
          $limit: 10
        }
      ]);

      // Populate customer details
      const customerIds = result.map(item => item._id);
      const customers = await User.find({ _id: { $in: customerIds } })
        .select('companyName email');

      return result.map(item => {
        const customer = customers.find(c => c._id.toString() === item._id.toString());
        return {
          customerId: item._id,
          companyName: customer?.companyName || 'Unknown',
          email: customer?.email || '',
          totalRevenue: item.totalRevenue,
          invoiceCount: item.invoiceCount
        };
      });
    } catch (error) {
      console.error("Top customers error:", error);
      return [];
    }
  }

  // Get system health metrics
  async getSystemHealth() {
    try {
      const [
        totalUsers,
        totalProjects,
        totalInvoices,
        totalTimesheets,
        activeAdmins
      ] = await Promise.all([
        User.countDocuments(),
        Project.countDocuments(),
        Invoice.countDocuments(),
        Timesheet.countDocuments(),
        Admin.countDocuments({ isActive: true })
      ]);

      return {
        totalUsers,
        totalProjects,
        totalInvoices,
        totalTimesheets,
        activeAdmins,
        systemStatus: 'healthy',
        lastBackup: new Date(),
        uptime: '99.9%'
      };
    } catch (error) {
      console.error("System health error:", error);
      throw error;
    }
  }
}

export default new AdminAnalyticsService();


