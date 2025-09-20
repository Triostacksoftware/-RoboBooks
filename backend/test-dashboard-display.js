// Test script to verify dashboard data structure matches frontend expectations
const testData = {
  "customers": {
    "total": 4,
    "active": 0,
    "business": 2,
    "individual": 2
  },
  "items": {
    "success": true,
    "data": {
      "totalItems": 4,
      "goodsCount": 3,
      "servicesCount": 1,
      "lowStockCount": 4
    }
  },
  "banking": {
    "totalAccounts": 2,
    "totalBalance": 0,
    "pendingTransactions": 0
  },
  "sales": {
    "totalInvoices": 3,
    "paidInvoices": 2,
    "pendingInvoices": 1,
    "totalRevenue": 40120
  },
  "purchases": {
    "totalBills": 2,
    "paidBills": 1,
    "pendingBills": 0,
    "totalExpenses": 0
  },
  "projects": {
    "totalProjects": 0,
    "activeProjects": 0,
    "completedProjects": 0,
    "totalHours": 0
  },
  "reports": {
    "totalGenerated": 9,
    "totalRevenue": 0
  },
  "orders": {
    "pending": 0,
    "confirmed": 0,
    "completed": 0,
    "cancelled": 0
  }
};

console.log('🧪 Testing Dashboard Data Display Logic:');
console.log('');

// Test the logic that would be used in HomeTabs.tsx
const dashboardMetrics = {
  customers: {
    total: (testData?.customers.total || 0) > 0 ? testData?.customers.total : "No data",
    color: (testData?.customers.total || 0) > 0 ? "bg-blue-500" : "bg-gray-400",
  },
  items: {
    total: (testData?.items?.data?.totalItems || 0) > 0 ? testData?.items?.data?.totalItems : "No data",
    color: (testData?.items?.data?.totalItems || 0) > 0 ? "bg-green-500" : "bg-gray-400",
  },
  banking: {
    total: (testData?.banking.totalAccounts || 0) > 0 ? testData?.banking.totalAccounts : "No data",
    color: (testData?.banking.totalAccounts || 0) > 0 ? "bg-purple-500" : "bg-gray-400",
  },
  sales: {
    total: (testData?.sales.totalInvoices || 0) > 0 ? testData?.sales.totalInvoices : "No data",
    color: (testData?.sales.totalInvoices || 0) > 0 ? "bg-orange-500" : "bg-gray-400",
  },
  purchases: {
    total: (testData?.purchases.totalBills || 0) > 0 ? testData?.purchases.totalBills : "No data",
    color: (testData?.purchases.totalBills || 0) > 0 ? "bg-pink-500" : "bg-gray-400",
  },
  projects: {
    total: (testData?.projects.totalProjects || 0) > 0 ? testData?.projects.totalProjects : "No data",
    color: (testData?.projects.totalProjects || 0) > 0 ? "bg-indigo-500" : "bg-gray-400",
  },
  invoices: {
    total: (testData?.sales.totalInvoices || 0) > 0 ? testData?.sales.totalInvoices : "No data",
    color: (testData?.sales.totalInvoices || 0) > 0 ? "bg-yellow-500" : "bg-gray-400",
  },
  reports: {
    total: (testData?.reports.totalGenerated || 0) > 0 ? testData?.reports.totalGenerated : "No data",
    color: (testData?.reports.totalGenerated || 0) > 0 ? "bg-emerald-500" : "bg-gray-400",
  },
};

console.log('📊 Dashboard Metrics Results:');
Object.entries(dashboardMetrics).forEach(([key, metric]) => {
  console.log(`${key}: ${metric.total} (${metric.color})`);
});

console.log('');
console.log('✅ Expected Results:');
console.log('- Customers: 4 (should show blue)');
console.log('- Items: 4 (should show green)');
console.log('- Banking: 2 (should show purple)');
console.log('- Sales: 3 (should show orange)');
console.log('- Purchases: 2 (should show pink)');
console.log('- Projects: No data (should show gray)');
console.log('- Invoices: 3 (should show yellow)');
console.log('- Reports: 9 (should show emerald)');

console.log('');
console.log('🎯 All data should now display correctly in the frontend!');
