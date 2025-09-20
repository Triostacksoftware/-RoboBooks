import mongoose from 'mongoose';
import SalesOrder from './models/salesOrderModel.js';

// Test the sales order model with empty additionalTaxId
async function testSalesOrderFix() {
  try {
    console.log('🧪 Testing Sales Order additionalTaxId fix...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/robobooks');
    console.log('✅ Connected to MongoDB');
    
    // Test data with empty additionalTaxId (this should work now)
    const testData = {
      customerId: new mongoose.Types.ObjectId(),
      customerName: 'Test Customer',
      salesOrderNumber: 'SO-TEST-001',
      orderDate: new Date(),
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      items: [{
        details: 'Test Item',
        quantity: 1,
        rate: 100,
        amount: 100
      }],
      subTotal: 100,
      total: 100,
      additionalTaxId: "", // Empty string - this should be converted to null
      additionalTaxType: null
    };
    
    console.log('📝 Test data with empty additionalTaxId:', testData.additionalTaxId);
    
    // Try to create the sales order
    const salesOrder = await SalesOrder.create(testData);
    console.log('✅ Sales order created successfully!');
    console.log('📊 Created sales order additionalTaxId:', salesOrder.additionalTaxId);
    
    // Clean up
    await SalesOrder.findByIdAndDelete(salesOrder._id);
    console.log('🧹 Test data cleaned up');
    
    console.log('🎯 Fix is working! Empty additionalTaxId is now properly handled.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testSalesOrderFix();
