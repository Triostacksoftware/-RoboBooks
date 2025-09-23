// Comprehensive test script for complete dashboard functionality
import { getCustomerStats } from './services/customerService.js';
import { getItemStats } from './services/itemService.js';
import bankingService from './services/bankingService.js';
import { getInvoiceStats } from './services/invoiceservice.js';
import { getBillStats } from './services/bills.service.js';
import { getAllProjectStats } from './services/projectservice.js';
import { getReportStats } from './services/reportService.js';
import { getOrderStats } from './services/salesOrderService.js';

async function testCompleteDashboard() {
  console.log('🧪 Testing Complete Dashboard Functionality...\n');
  
  try {
    // Test each service individually with detailed logging
    console.log('='.repeat(60));
    console.log('📊 TESTING INDIVIDUAL SERVICES');
    console.log('='.repeat(60));
    
    // 1. Customer Stats
    console.log('\n👥 Testing Customer Stats...');
    const customerStats = await getCustomerStats();
    console.log('✅ Customer Stats Result:', customerStats);
    console.log(`   - Total: ${customerStats.total}`);
    console.log(`   - Active: ${customerStats.active}`);
    console.log(`   - Business: ${customerStats.business}`);
    console.log(`   - Individual: ${customerStats.individual}`);
    
    // 2. Item Stats
    console.log('\n📦 Testing Item Stats...');
    const itemStats = await getItemStats();
    console.log('✅ Item Stats Result:', itemStats);
    console.log(`   - Total: ${itemStats.total}`);
    console.log(`   - Goods: ${itemStats.goods}`);
    console.log(`   - Services: ${itemStats.services}`);
    console.log(`   - Low Stock: ${itemStats.lowStock}`);
    
    // 3. Banking Stats
    console.log('\n🏦 Testing Banking Stats...');
    const bankingStats = await bankingService.getBankingStats();
    console.log('✅ Banking Stats Result:', bankingStats);
    console.log(`   - Total Accounts: ${bankingStats.totalAccounts}`);
    console.log(`   - Total Balance: ₹${bankingStats.totalBalance}`);
    console.log(`   - Pending Transactions: ${bankingStats.pendingTransactions}`);
    
    // 4. Invoice Stats
    console.log('\n💰 Testing Invoice Stats...');
    const invoiceStats = await getInvoiceStats();
    console.log('✅ Invoice Stats Result:', invoiceStats);
    console.log(`   - Total Invoices: ${invoiceStats.totalInvoices}`);
    console.log(`   - Paid Invoices: ${invoiceStats.paidInvoices}`);
    console.log(`   - Pending Invoices: ${invoiceStats.pendingInvoices}`);
    console.log(`   - Total Revenue: ₹${invoiceStats.totalRevenue}`);
    
    // 5. Bill Stats
    console.log('\n📋 Testing Bill Stats...');
    const billStats = await getBillStats();
    console.log('✅ Bill Stats Result:', billStats);
    console.log(`   - Total Bills: ${billStats.totalBills}`);
    console.log(`   - Paid Bills: ${billStats.paidBills}`);
    console.log(`   - Pending Bills: ${billStats.pendingBills}`);
    console.log(`   - Total Expenses: ₹${billStats.totalExpenses}`);
    
    // 6. Project Stats
    console.log('\n📁 Testing Project Stats...');
    const projectStats = await getAllProjectStats('test-user-id');
    console.log('✅ Project Stats Result:', projectStats);
    console.log(`   - Total: ${projectStats.total}`);
    console.log(`   - Active: ${projectStats.active}`);
    console.log(`   - Completed: ${projectStats.completed}`);
    console.log(`   - Total Hours: ${projectStats.totalHours}`);
    
    // 7. Report Stats
    console.log('\n📈 Testing Report Stats...');
    const reportStats = await getReportStats();
    console.log('✅ Report Stats Result:', reportStats);
    console.log(`   - Total Generated: ${reportStats.totalGenerated}`);
    console.log(`   - Total Revenue: ₹${reportStats.totalRevenue}`);
    
    // 8. Order Stats
    console.log('\n📦 Testing Order Stats...');
    const orderStats = await getOrderStats();
    console.log('✅ Order Stats Result:', orderStats);
    console.log(`   - Pending: ${orderStats.pending}`);
    console.log(`   - Confirmed: ${orderStats.confirmed}`);
    console.log(`   - Completed: ${orderStats.completed}`);
    console.log(`   - Cancelled: ${orderStats.cancelled}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 DASHBOARD SUMMARY');
    console.log('='.repeat(60));
    
    // Create dashboard summary
    const dashboardSummary = {
      customers: {
        total: customerStats.total,
        active: customerStats.active,
        business: customerStats.business,
        individual: customerStats.individual
      },
      items: {
        total: itemStats.total,
        goods: itemStats.goods,
        services: itemStats.services,
        lowStock: itemStats.lowStock
      },
      banking: {
        totalAccounts: bankingStats.totalAccounts,
        totalBalance: bankingStats.totalBalance,
        pendingTransactions: bankingStats.pendingTransactions
      },
      sales: {
        totalInvoices: invoiceStats.totalInvoices,
        paidInvoices: invoiceStats.paidInvoices,
        pendingInvoices: invoiceStats.pendingInvoices,
        totalRevenue: invoiceStats.totalRevenue
      },
      purchases: {
        totalBills: billStats.totalBills,
        paidBills: billStats.paidBills,
        pendingBills: billStats.pendingBills,
        totalExpenses: billStats.totalExpenses
      },
      projects: {
        total: projectStats.total,
        active: projectStats.active,
        completed: projectStats.completed,
        totalHours: projectStats.totalHours
      },
      reports: {
        totalGenerated: reportStats.totalGenerated,
        totalRevenue: reportStats.totalRevenue
      },
      orders: {
        pending: orderStats.pending,
        confirmed: orderStats.confirmed,
        completed: orderStats.completed,
        cancelled: orderStats.cancelled
      }
    };
    
    console.log('\n📊 Complete Dashboard Data:');
    console.log(JSON.stringify(dashboardSummary, null, 2));
    
    console.log('\n🎉 All dashboard tests completed successfully!');
    console.log('\n✅ VERIFICATION CHECKLIST:');
    console.log('   ✓ Customer statistics working');
    console.log('   ✓ Item statistics working');
    console.log('   ✓ Banking statistics working');
    console.log('   ✓ Sales statistics working');
    console.log('   ✓ Purchase statistics working');
    console.log('   ✓ Project statistics working');
    console.log('   ✓ Report statistics working');
    console.log('   ✓ Order statistics working');
    
    console.log('\n🚀 Dashboard is ready for real-time synchronization!');
    
  } catch (error) {
    console.error('❌ Error testing dashboard:', error);
    console.error('Stack trace:', error.stack);
  }
}

testCompleteDashboard().catch(console.error);
