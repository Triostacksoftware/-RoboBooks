import { api } from '../lib/api';

export interface DashboardStats {
  customers: {
    total: number;
    active: number;
    business: number;
    individual: number;
  };
  items: {
    total: number;
    goods: number;
    services: number;
    lowStock: number;
  };
  banking: {
    totalAccounts: number;
    totalBalance: number;
    pendingTransactions: number;
  };
  sales: {
    totalInvoices: number;
    paidInvoices: number;
    pendingInvoices: number;
    totalRevenue: number;
  };
  purchases: {
    totalBills: number;
    paidBills: number;
    pendingBills: number;
    totalExpenses: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    totalHours: number;
  };
  reports: {
    totalGenerated: number;
    totalRevenue: number;
  };
  orders: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
}

class DashboardService {
  private baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  private eventSource: EventSource | null = null;
  private listeners: ((stats: DashboardStats) => void)[] = [];

  // Fetch all dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      console.log('📊 Fetching dashboard statistics...');
      
      // Try to use the unified dashboard endpoint first
      try {
        const response = await api('/api/dashboard/stats');
        if (response.success && response.data) {
          console.log('📊 Dashboard statistics loaded from unified endpoint:', response.data);
          return response.data;
        }
      } catch (unifiedError) {
        console.warn('⚠️ Unified dashboard endpoint failed, falling back to individual calls:', unifiedError);
      }

      // Fallback to individual service calls
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
        this.getCustomerStats(),
        this.getItemStats(),
        this.getBankingStats(),
        this.getSalesStats(),
        this.getPurchasesStats(),
        this.getProjectsStats(),
        this.getReportsStats(),
        this.getOrdersStats()
      ]);

      // Log any rejected promises for debugging
      [customersStats, itemsStats, bankingStats, salesStats, purchasesStats, projectsStats, reportsStats, ordersStats]
        .forEach((result, index) => {
          if (result.status === 'rejected') {
            const moduleNames = ['customers', 'items', 'banking', 'sales', 'purchases', 'projects', 'reports', 'orders'];
            console.warn(`⚠️ Failed to fetch ${moduleNames[index]} stats:`, result.reason);
          }
        });

      const stats = {
        customers: customersStats.status === 'fulfilled' ? customersStats.value : { total: 0, active: 0, business: 0, individual: 0 },
        items: itemsStats.status === 'fulfilled' ? itemsStats.value : { total: 0, goods: 0, services: 0, lowStock: 0 },
        banking: bankingStats.status === 'fulfilled' ? bankingStats.value : { totalAccounts: 0, totalBalance: 0, pendingTransactions: 0 },
        sales: salesStats.status === 'fulfilled' ? salesStats.value : { totalInvoices: 0, paidInvoices: 0, pendingInvoices: 0, totalRevenue: 0 },
        purchases: purchasesStats.status === 'fulfilled' ? purchasesStats.value : { totalBills: 0, paidBills: 0, pendingBills: 0, totalExpenses: 0 },
        projects: projectsStats.status === 'fulfilled' ? projectsStats.value : { total: 0, active: 0, completed: 0, totalHours: 0 },
        reports: reportsStats.status === 'fulfilled' ? reportsStats.value : { totalGenerated: 0, totalRevenue: 0 },
        orders: ordersStats.status === 'fulfilled' ? ordersStats.value : { pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
      };

      console.log('📊 Dashboard statistics loaded successfully:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      // Return default stats instead of throwing
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
  }

  // Real-time updates using Server-Sent Events
  connectRealTimeUpdates(onUpdate: (stats: DashboardStats) => void) {
    this.listeners.push(onUpdate);
    
    if (this.eventSource) {
      this.disconnectRealTimeUpdates();
    }

    try {
      // Get token from localStorage for SSE authentication
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (!token) {
        console.error('❌ No token found for SSE connection');
        return;
      }

      // Pass token as query parameter since EventSource doesn't support headers
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      this.eventSource = new EventSource(`${backendUrl}/api/dashboard/events?token=${encodeURIComponent(token)}`);
      
      this.eventSource.onopen = () => {
        console.log('✅ Real-time dashboard connection established');
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'dashboard_update' && data.stats) {
            console.log('📊 Real-time dashboard update received:', data.stats);
            this.listeners.forEach(listener => listener(data.stats));
          }
        } catch (error) {
          console.error('❌ Error parsing real-time update:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('❌ Real-time dashboard connection error:', error);
        
        // Check if it's an authentication error
        if (this.eventSource?.readyState === EventSource.CLOSED) {
          console.log('🔐 SSE connection closed, checking authentication...');
          
          // Try to get a fresh token and reconnect
          const freshToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          if (freshToken) {
            console.log('🔄 Attempting to reconnect with fresh token...');
            setTimeout(() => {
              this.connectRealTimeUpdates(onUpdate);
            }, 5000);
          } else {
            console.error('❌ No token available for reconnection');
          }
        }
      };
    } catch (error) {
      console.error('❌ Failed to establish real-time connection:', error);
    }
  }

  disconnectRealTimeUpdates() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.listeners = [];
  }

  // Customer statistics
  private async getCustomerStats() {
    try {
      const response = await api('/api/customers/stats');
      return {
        total: response.data?.totalCustomers || 0,
        active: response.data?.activeCustomers || 0,
        business: response.data?.businessCustomers || 0,
        individual: response.data?.individualCustomers || 0
      };
    } catch (error) {
      console.warn('⚠️ Customer stats not available:', error);
      return { total: 0, active: 0, business: 0, individual: 0 };
    }
  }

  // Item statistics
  private async getItemStats() {
    try {
      const response = await api('/api/items/stats');
      return {
        total: response.data?.totalItems || 0,
        goods: response.data?.goodsCount || 0,
        services: response.data?.servicesCount || 0,
        lowStock: response.data?.lowStockCount || 0
      };
    } catch (error) {
      console.warn('⚠️ Item stats not available:', error);
      return { total: 0, goods: 0, services: 0, lowStock: 0 };
    }
  }

  // Banking statistics
  private async getBankingStats() {
    try {
      const response = await api('/api/banking/overview');
      return {
        totalAccounts: response.data?.totalAccounts || 0,
        totalBalance: response.data?.totalBalance || 0,
        pendingTransactions: response.data?.pendingTransactions || 0
      };
    } catch (error) {
      console.warn('⚠️ Banking stats not available:', error);
      return { totalAccounts: 0, totalBalance: 0, pendingTransactions: 0 };
    }
  }

  // Sales statistics
  private async getSalesStats() {
    try {
      const response = await api('/api/invoices/stats');
      return {
        totalInvoices: response.data?.totalInvoices || 0,
        paidInvoices: response.data?.paidInvoices || 0,
        pendingInvoices: response.data?.pendingInvoices || 0,
        totalRevenue: response.data?.totalRevenue || 0
      };
    } catch (error) {
      console.warn('⚠️ Sales stats not available:', error);
      return { totalInvoices: 0, paidInvoices: 0, pendingInvoices: 0, totalRevenue: 0 };
    }
  }

  // Purchases statistics
  private async getPurchasesStats() {
    try {
      const response = await api('/api/bills/stats');
      return {
        totalBills: response.data?.totalBills || 0,
        paidBills: response.data?.paidBills || 0,
        pendingBills: response.data?.pendingBills || 0,
        totalExpenses: response.data?.totalExpenses || 0
      };
    } catch (error) {
      console.warn('⚠️ Purchases stats not available:', error);
      return { totalBills: 0, paidBills: 0, pendingBills: 0, totalExpenses: 0 };
    }
  }

  // Projects statistics
  private async getProjectsStats() {
    try {
      const response = await api('/api/projects/stats');
      return {
        total: response.data?.totalProjects || 0,
        active: response.data?.activeProjects || 0,
        completed: response.data?.completedProjects || 0,
        totalHours: response.data?.totalHours || 0
      };
    } catch (error) {
      console.warn('⚠️ Projects stats not available:', error);
      return { total: 0, active: 0, completed: 0, totalHours: 0 };
    }
  }

  // Reports statistics
  private async getReportsStats() {
    try {
      const response = await api('/api/reports/stats');
      return {
        totalGenerated: response.data?.totalReports || 0,
        totalRevenue: response.data?.totalRevenue || 0
      };
    } catch (error) {
      console.warn('⚠️ Reports stats not available:', error);
      return { totalGenerated: 0, totalRevenue: 0 };
    }
  }

  // Orders statistics (combining various order types)
  private async getOrdersStats() {
    try {
      const [salesOrders, purchaseOrders] = await Promise.all([
        api('/api/sales-orders/stats').catch(() => ({ data: {} })),
        api('/api/purchase-orders/stats').catch(() => ({ data: {} }))
      ]);

      return {
        pending: (salesOrders.data?.pending || 0) + (purchaseOrders.data?.pending || 0),
        confirmed: (salesOrders.data?.confirmed || 0) + (purchaseOrders.data?.confirmed || 0),
        completed: (salesOrders.data?.completed || 0) + (purchaseOrders.data?.completed || 0),
        cancelled: (salesOrders.data?.cancelled || 0) + (purchaseOrders.data?.cancelled || 0)
      };
    } catch (error) {
      console.warn('⚠️ Orders stats not available:', error);
      return { pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    }
  }

  // Refresh specific module stats
  async refreshModuleStats(module: keyof DashboardStats) {
    try {
      switch (module) {
        case 'customers':
          return await this.getCustomerStats();
        case 'items':
          return await this.getItemStats();
        case 'banking':
          return await this.getBankingStats();
        case 'sales':
          return await this.getSalesStats();
        case 'purchases':
          return await this.getPurchasesStats();
        case 'projects':
          return await this.getProjectsStats();
        case 'reports':
          return await this.getReportsStats();
        case 'orders':
          return await this.getOrdersStats();
        default:
          throw new Error(`Unknown module: ${module}`);
      }
    } catch (error) {
      console.error(`Error refreshing ${module} stats:`, error);
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
