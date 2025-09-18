// Test script to debug dashboard data
const fetch = require('node-fetch');

async function testDashboardData() {
  try {
    console.log('Testing dashboard data...');
    
    // Test individual endpoints
    const endpoints = [
      '/api/customers/stats',
      '/api/items/stats', 
      '/api/banking/stats',
      '/api/invoices/stats',
      '/api/bills/stats',
      '/api/projects/stats'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:5000?{endpoint}`);
        const data = await response.json();
        console.log(`\n?{endpoint}:`, data);
      } catch (error) {
        console.error(`Error fetching ?{endpoint}:`, error.message);
      }
    }
    
    // Test dashboard service
    console.log('\n--- Testing Dashboard Service ---');
    const dashboardResponse = await fetch('http://localhost:5000/api/dashboard/stats');
    const dashboardData = await dashboardResponse.json();
    console.log('Dashboard Stats:', JSON.stringify(dashboardData, null, 2));
    
  } catch (error) {
    console.error('Error testing dashboard:', error);
  }
}

testDashboardData();
