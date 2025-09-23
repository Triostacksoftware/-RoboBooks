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
          
          // Debug each section
          console.log('🔍 Items from unified endpoint:', response.data.items);
          console.log('🔍 Customers from unified endpoint:', response.data.customers);
          console.log('🔍 Banking from unified endpoint:', response.data.banking);
          
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

      // Debug individual service results
      console.log('🔍 Individual service results:');
      console.log('👥 Customers stats:', customersStats);
      console.log('📦 Items stats:', itemsStats);
      console.log('🏦 Banking stats:', bankingStats);
      console.log('💰 Sales stats:', salesStats);
      console.log('📋 Purchases stats:', purchasesStats);
      console.log('📁 Projects stats:', projectsStats);
      console.log('📈 Reports stats:', reportsStats);
      console.log('📦 Orders stats:', ordersStats);

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
          } else if (data.type === 'heartbeat') {
            console.log('💓 Dashboard heartbeat received');
          } else if (data.type === 'error') {
            console.error('❌ Dashboard SSE error:', data.message);
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

  // Refresh specific module stats
  async refreshModuleStats(module: keyof DashboardStats): Promise<any> {
    try {
      console.log(`🔄 Refreshing ${module} stats...`);
      
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
      console.error(`❌ Error refreshing ${module} stats:`, error);
      throw error;
    }
  }

  // Customer statistics
  private async getCustomerStats() {
    try {
      console.log('👥 Fetching customer stats...');
      const response = await api('/api/customers/stats');
      console.log('👥 Customer stats response:', response);
      
      // The backend returns the data directly
      const customerData = response.data || response;
      console.log('👥 Processed customer data:', customerData);
      
      return {
        total: customerData?.total || 0,
        active: customerData?.active || 0,
        business: customerData?.business || 0,
        individual: customerData?.individual || 0
      };
    } catch (error) {
      console.warn('⚠️ Customer stats not available:', error);
      return { total: 0, active: 0, business: 0, individual: 0 };
    }
  }

  // Item statistics
  private async getItemStats() {
    try {
      console.log('📦 Fetching item stats...');
      const response = await api('/api/items/stats');
      console.log('📦 Item stats response:', response);
      
      // The backend now returns the data directly, not wrapped in a data object
      const itemData = response.data || response;
      console.log('📦 Processed item data:', itemData);
      
      return {
        total: itemData?.total || 0,
        goods: itemData?.goods || 0,
        services: itemData?.services || 0,
        lowStock: itemData?.lowStock || 0
      };
    } catch (error) {
      console.warn('⚠️ Item stats not available:', error);
      return { total: 0, goods: 0, services: 0, lowStock: 0 };
    }
  }

  // Banking statistics
  private async getBankingStats() {
    try {
      console.log('🏦 Fetching banking stats...');
      const response = await api('/api/banking/overview');
      console.log('🏦 Banking stats response:', response);
      
      // The backend returns the data directly
      const bankingData = response.data || response;
      console.log('🏦 Processed banking data:', bankingData);
      
      return {
        totalAccounts: bankingData?.totalAccounts || 0,
        totalBalance: bankingData?.totalBalance || 0,
        pendingTransactions: bankingData?.pendingTransactions || 0
      };
    } catch (error) {
      console.warn('⚠️ Banking stats not available:', error);
      return { totalAccounts: 0, totalBalance: 0, pendingTransactions: 0 };
    }
  }

  // Sales statistics
  private async getSalesStats() {
    try {
      console.log('💰 Fetching sales stats...');
      const response = await api('/api/invoices/stats');
      console.log('💰 Sales stats response:', response);
      
      // The backend returns the data directly
      const salesData = response.data || response;
      console.log('💰 Processed sales data:', salesData);
      
      return {
        totalInvoices: salesData?.totalInvoices || 0,
        paidInvoices: salesData?.paidInvoices || 0,
        pendingInvoices: salesData?.pendingInvoices || 0,
        totalRevenue: salesData?.totalRevenue || 0
      };
    } catch (error) {
      console.warn('⚠️ Sales stats not available:', error);
      return { totalInvoices: 0, paidInvoices: 0, pendingInvoices: 0, totalRevenue: 0 };
    }
  }

  // Purchases statistics
  private async getPurchasesStats() {
    try {
      console.log('📋 Fetching purchases stats...');
      const response = await api('/api/bills/stats');
      console.log('📋 Purchases stats response:', response);
      
      // The backend returns the data directly
      const purchaseData = response.data || response;
      console.log('📋 Processed purchase data:', purchaseData);
      
      return {
        totalBills: purchaseData?.totalBills || 0,
        paidBills: purchaseData?.paidBills || 0,
        pendingBills: purchaseData?.pendingBills || 0,
        totalExpenses: purchaseData?.totalExpenses || 0
      };
    } catch (error) {
      console.warn('⚠️ Purchases stats not available:', error);
      return { totalBills: 0, paidBills: 0, pendingBills: 0, totalExpenses: 0 };
    }
  }

  // Projects statistics
  private async getProjectsStats() {
    try {
      console.log('📁 Fetching projects stats...');
      const response = await api('/api/projects/stats');
      console.log('📁 Projects stats response:', response);
      
      // The backend returns the data directly
      const projectData = response.data || response;
      console.log('📁 Processed project data:', projectData);
      
      return {
        total: projectData?.total || 0,
        active: projectData?.active || 0,
        completed: projectData?.completed || 0,
        totalHours: projectData?.totalHours || 0
      };
    } catch (error) {
      console.warn('⚠️ Projects stats not available:', error);
      return { total: 0, active: 0, completed: 0, totalHours: 0 };
    }
  }

  // Reports statistics
  private async getReportsStats() {
    try {
      console.log('📈 Fetching reports stats...');
      const response = await api('/api/reports/stats');
      console.log('📈 Reports stats response:', response);
      
      // The backend returns the data directly
      const reportData = response.data || response;
      console.log('📈 Processed report data:', reportData);
      
      return {
        totalGenerated: reportData?.totalGenerated || 0,
        totalRevenue: reportData?.totalRevenue || 0
      };
    } catch (error) {
      console.warn('⚠️ Reports stats not available:', error);
      return { totalGenerated: 0, totalRevenue: 0 };
    }
  }

  // Orders statistics (combining various order types)
  private async getOrdersStats() {
    try {
      console.log('📦 Fetching orders stats...');
      const [salesOrders, purchaseOrders] = await Promise.all([
        api('/api/sales-orders/stats').catch(() => ({ data: {} })),
        api('/api/purchase-orders/stats').catch(() => ({ data: {} }))
      ]);

      console.log('📦 Sales orders response:', salesOrders);
      console.log('📦 Purchase orders response:', purchaseOrders);

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
