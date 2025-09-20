import { getCustomerStats } from '../services/customerService.js';
import { getItemStats } from '../services/itemService.js';
import bankingService from '../services/bankingService.js';
import { getInvoiceStats } from '../services/invoiceservice.js';
import { getBillStats } from '../services/bills.service.js';
import { getAllProjectStats } from '../services/projectservice.js';
import { getReportStats } from '../services/reportService.js';
import { getOrderStats } from '../services/salesOrderService.js';

// Get comprehensive dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    console.log('Fetching dashboard stats...');
    
    // Fetch all statistics in parallel
    const [
      customersStats,
      itemsStats,
      bankingStats,
      salesStats,
      purchasesStats,
      projectsStats,
      reportsStats,
      ordersStats
    ] = await Promise.allSettled([
      getCustomerStats(),
      getItemStats(),
      bankingService.getBankingStats(),
      getInvoiceStats(),
      getBillStats(),
      getAllProjectStats(req.user?.uid),
      getReportStats(),
      getOrderStats()
    ]);

    const dashboardStats = {
      customers: customersStats.status === 'fulfilled' ? customersStats.value : { total: 0, active: 0, business: 0, individual: 0 },
      items: itemsStats.status === 'fulfilled' ? itemsStats.value : { total: 0, goods: 0, services: 0, lowStock: 0 },
      banking: bankingStats.status === 'fulfilled' ? bankingStats.value : { totalAccounts: 0, totalBalance: 0, pendingTransactions: 0 },
      sales: salesStats.status === 'fulfilled' ? salesStats.value : { totalInvoices: 0, paidInvoices: 0, pendingInvoices: 0, totalRevenue: 0 },
      purchases: purchasesStats.status === 'fulfilled' ? purchasesStats.value : { totalBills: 0, paidBills: 0, pendingBills: 0, totalExpenses: 0 },
      projects: projectsStats.status === 'fulfilled' ? projectsStats.value : { total: 0, active: 0, completed: 0, totalHours: 0 },
      reports: reportsStats.status === 'fulfilled' ? reportsStats.value : { totalGenerated: 0, totalRevenue: 0 },
      orders: ordersStats.status === 'fulfilled' ? ordersStats.value : { pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
    };

    console.log('Dashboard stats compiled:', dashboardStats);

    res.status(200).json({
      success: true,
      data: dashboardStats,
      message: "Dashboard statistics retrieved successfully"
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to fetch dashboard statistics"
    });
  }
};

// Get dashboard stats data without response object (for SSE)
const getDashboardStatsData = async (req) => {
  try {
    console.log('Fetching dashboard stats data...');
    
    // Fetch all statistics in parallel
    const [
      customersStats,
      itemsStats,
      bankingStats,
      salesStats,
      purchasesStats,
      projectsStats,
      reportsStats,
      ordersStats
    ] = await Promise.allSettled([
      getCustomerStats(),
      getItemStats(),
      bankingService.getBankingStats(),
      getInvoiceStats(),
      getBillStats(),
      getAllProjectStats(req.user?.uid),
      getReportStats(),
      getOrderStats()
    ]);

    const dashboardStats = {
      customers: customersStats.status === 'fulfilled' ? customersStats.value : { total: 0, active: 0, business: 0, individual: 0 },
      items: itemsStats.status === 'fulfilled' ? itemsStats.value : { total: 0, goods: 0, services: 0, lowStock: 0 },
      banking: bankingStats.status === 'fulfilled' ? bankingStats.value : { totalAccounts: 0, totalBalance: 0, pendingTransactions: 0 },
      sales: salesStats.status === 'fulfilled' ? salesStats.value : { totalInvoices: 0, paidInvoices: 0, pendingInvoices: 0, totalRevenue: 0 },
      purchases: purchasesStats.status === 'fulfilled' ? purchasesStats.value : { totalBills: 0, paidBills: 0, pendingBills: 0, totalExpenses: 0 },
      projects: projectsStats.status === 'fulfilled' ? projectsStats.value : { total: 0, active: 0, completed: 0, totalHours: 0 },
      reports: reportsStats.status === 'fulfilled' ? reportsStats.value : { totalGenerated: 0, totalRevenue: 0 },
      orders: ordersStats.status === 'fulfilled' ? ordersStats.value : { pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
    };

    console.log('Dashboard stats data compiled:', dashboardStats);
    return dashboardStats;
  } catch (error) {
    console.error('Error fetching dashboard stats data:', error);
    return {
      customers: { total: 0, active: 0, business: 0, individual: 0 },
      items: { total: 0, goods: 0, services: 0, lowStock: 0 },
      banking: { totalAccounts: 0, totalBalance: 0, pendingTransactions: 0 },
      sales: { totalInvoices: 0, paidInvoices: 0, pendingInvoices: 0, totalRevenue: 0 },
      purchases: { totalBills: 0, paidBills: 0, pendingBills: 0, totalExpenses: 0 },
      projects: { total: 0, active: 0, completed: 0, totalHours: 0 },
      reports: { totalGenerated: 0, totalRevenue: 0 },
      orders: { pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
    };
  }
};

export default {
  getDashboardStats,
  getDashboardStatsData
};


