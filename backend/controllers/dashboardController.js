import { getCustomerStats } from '../services/customerService.js';
import { getItemStats } from '../services/itemService.js';
import bankingService from '../services/bankingService.js';
import { getInvoiceStats } from '../services/invoiceservice.js';
import { getBillStats } from '../services/bills.service.js';
import { getAllProjectStats } from '../services/projectservice.js';
import { getReportStats } from '../services/reportService.js';
import { getOrderStats } from '../services/salesOrderService.js';
import jwt from 'jsonwebtoken';

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

// Real-time dashboard updates via Server-Sent Events
const getDashboardEvents = async (req, res) => {
  try {
    // Authenticate using token from query parameter
    const token = req.query.token;
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Use the same JWT secret as the auth middleware and JWT utilities
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    console.log('🔐 SSE - Using JWT secret:', jwtSecret ? 'Found' : 'Not found');
    
    // Verify token
    const decoded = jwt.verify(token, jwtSecret);
    console.log('✅ SSE - Token verified, user:', decoded);
    
    // Create consistent user object structure (same as auth middleware)
    req.user = {
      id: decoded.uid || decoded.id,
      uid: decoded.uid || decoded.id,
      role: decoded.role || 'user',
      email: decoded.email,
      organization: decoded.organization,
      iat: decoded.iat,
      exp: decoded.exp
    };

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    console.log('📡 SSE connection established for dashboard updates');

    // Send initial data
    const initialStats = await getDashboardStatsData(req);
    res.write(`data: ${JSON.stringify({
      type: 'dashboard_update',
      stats: initialStats,
      timestamp: new Date().toISOString()
    })}\n\n`);

    // Set up periodic updates (every 30 seconds)
    const updateInterval = setInterval(async () => {
      try {
        const stats = await getDashboardStatsData(req);
        res.write(`data: ${JSON.stringify({
          type: 'dashboard_update',
          stats: stats,
          timestamp: new Date().toISOString()
        })}\n\n`);
      } catch (error) {
        console.error('Error sending periodic update:', error);
        res.write(`data: ${JSON.stringify({
          type: 'error',
          message: 'Failed to fetch dashboard data',
          timestamp: new Date().toISOString()
        })}\n\n`);
      }
    }, 30000);

    // Handle client disconnect
    req.on('close', () => {
      console.log('📡 SSE connection closed for dashboard updates');
      clearInterval(updateInterval);
    });

    // Send heartbeat every 10 seconds to keep connection alive
    const heartbeatInterval = setInterval(() => {
      res.write(`data: ${JSON.stringify({
        type: 'heartbeat',
        timestamp: new Date().toISOString()
      })}\n\n`);
    }, 10000);

    req.on('close', () => {
      clearInterval(heartbeatInterval);
    });

  } catch (error) {
    console.error('❌ Error setting up SSE connection:', error);
    if (error.name === 'JsonWebTokenError') {
      console.error('🔐 JWT Error details:', error.message);
      res.status(401).json({ error: 'Invalid token for real-time connection' });
    } else {
      res.status(500).json({ error: 'Failed to establish real-time connection' });
    }
  }
};

export default {
  getDashboardStats,
  getDashboardStatsData,
  getDashboardEvents
};


