// Test script to verify dashboard statistics are correctly synchronized
import { getCustomerStats } from './services/customerService.js';
import { getItemStats } from './services/itemService.js';
import bankingService from './services/bankingService.js';
import { getInvoiceStats } from './services/invoiceservice.js';
import { getBillStats } from './services/bills.service.js';
import { getAllProjectStats } from './services/projectservice.js';
import { getReportStats } from './services/reportService.js';
import { getOrderStats } from './services/salesOrderService.js';

async function testDashboardStats() {
  console.log('🧪 Testing Dashboard Statistics Synchronization...\n');
  
  try {
    // Test each service individually
    console.log('📊 Testing Customer Stats...');
    const customerStats = await getCustomerStats();
    console.log('✅ Customer Stats:', customerStats);
    
    console.log('\n📦 Testing Item Stats...');
    const itemStats = await getItemStats();
    console.log('✅ Item Stats:', itemStats);
    
    console.log('\n🏦 Testing Banking Stats...');
    const bankingStats = await bankingService.getBankingStats();
    console.log('✅ Banking Stats:', bankingStats);
    
    console.log('\n💰 Testing Invoice Stats...');
    const invoiceStats = await getInvoiceStats();
    console.log('✅ Invoice Stats:', invoiceStats);
    
    console.log('\n📋 Testing Bill Stats...');
    const billStats = await getBillStats();
    console.log('✅ Bill Stats:', billStats);
    
    console.log('\n📁 Testing Project Stats...');
    const projectStats = await getAllProjectStats('test-user-id'); // You may need to replace with actual user ID
    console.log('✅ Project Stats:', projectStats);
    
    console.log('\n📈 Testing Report Stats...');
    const reportStats = await getReportStats();
    console.log('✅ Report Stats:', reportStats);
    
    console.log('\n📦 Testing Order Stats...');
    const orderStats = await getOrderStats();
    console.log('✅ Order Stats:', orderStats);
    
    console.log('\n🎉 All dashboard statistics tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Customers: ${customerStats.total} total, ${customerStats.active} active`);
    console.log(`- Items: ${itemStats.total} total, ${itemStats.goods} goods, ${itemStats.services} services`);
    console.log(`- Banking: ${bankingStats.totalAccounts} accounts, ₹${bankingStats.totalBalance} total balance`);
    console.log(`- Sales: ${invoiceStats.totalInvoices} invoices, ₹${invoiceStats.totalRevenue} revenue`);
    console.log(`- Purchases: ${billStats.totalBills} bills, ₹${billStats.totalExpenses} expenses`);
    console.log(`- Projects: ${projectStats.total} total, ${projectStats.active} active`);
    console.log(`- Reports: ${reportStats.totalGenerated} generated`);
    console.log(`- Orders: ${orderStats.pending} pending, ${orderStats.confirmed} confirmed`);
    
  } catch (error) {
    console.error('❌ Error testing dashboard stats:', error);
  }
}

testDashboardStats().catch(console.error);
