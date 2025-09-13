// Test script for dashboard service
const { dashboardService } = require('./src/services/dashboardService.ts');

async function testDashboardService() {
  console.log('🧪 Testing Dashboard Service...\n');

  try {
    // Test fetching all dashboard stats
    console.log('📊 Fetching dashboard statistics...');
    const stats = await dashboardService.getDashboardStats();
    
    console.log('✅ Dashboard stats fetched successfully:');
    console.log('📈 Customers:', stats.customers);
    console.log('📦 Items:', stats.items);
    console.log('🏦 Banking:', stats.banking);
    console.log('💰 Sales:', stats.sales);
    console.log('🛒 Purchases:', stats.purchases);
    console.log('📋 Projects:', stats.projects);
    console.log('📊 Reports:', stats.reports);
    console.log('📋 Orders:', stats.orders);

    // Test individual module refresh
    console.log('\n🔄 Testing individual module refresh...');
    const customerStats = await dashboardService.refreshModuleStats('customers');
    console.log('✅ Customer stats refreshed:', customerStats);

  } catch (error) {
    console.error('❌ Error testing dashboard service:', error.message);
  }
}

// Run the test
testDashboardService();
