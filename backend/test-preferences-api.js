import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';

// Test data
const testUserId = '507f1f77bcf86cd799439011'; // Replace with actual user ID
const testOrganizationId = '507f1f77bcf86cd799439012'; // Replace with actual org ID
const testToken = 'your-test-token-here'; // Replace with actual token

const testPreferences = {
  defaultSortBy: 'createdAt',
  defaultSortOrder: 'desc',
  itemsPerPage: 25,
  showFilters: true,
  showEmptyStates: true,
  autoRefresh: false,
  refreshInterval: 5,
  theme: 'light',
  compactMode: false,
  showTooltips: true,
  notifications: {
    email: true,
    browser: true,
    sound: false,
    types: ['reminders', 'updates', 'alerts']
  },
  exportFormat: 'excel',
  includeHeaders: true,
  showColumns: {
    billNumber: true,
    vendorName: true,
    billDate: true,
    dueDate: true,
    status: true,
    totalAmount: true,
    currency: true,
    notes: false,
    createdAt: true
  },
  columnWidths: {
    billNumber: 120,
    vendorName: 200,
    billDate: 120,
    dueDate: 120,
    status: 100,
    totalAmount: 120,
    currency: 80,
    notes: 200,
    createdAt: 120
  }
};

async function testPreferencesAPI() {
  console.log('🧪 Testing Preferences API...\n');

  try {
    // Test 1: Get preferences for bills module
    console.log('1. Testing GET /api/preferences/bills');
    const getResponse = await fetch(`${API_BASE_URL}/preferences/bills`, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('✅ GET preferences successful:', getData);
    } else {
      console.log('❌ GET preferences failed:', getResponse.status, await getResponse.text());
    }

    // Test 2: Update preferences for bills module
    console.log('\n2. Testing PUT /api/preferences/bills');
    const updateResponse = await fetch(`${API_BASE_URL}/preferences/bills`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPreferences)
    });
    
    if (updateResponse.ok) {
      const updateData = await updateResponse.json();
      console.log('✅ PUT preferences successful:', updateData);
    } else {
      console.log('❌ PUT preferences failed:', updateResponse.status, await updateResponse.text());
    }

    // Test 3: Get all preferences
    console.log('\n3. Testing GET /api/preferences');
    const getAllResponse = await fetch(`${API_BASE_URL}/preferences`, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (getAllResponse.ok) {
      const getAllData = await getAllResponse.json();
      console.log('✅ GET all preferences successful:', getAllData);
    } else {
      console.log('❌ GET all preferences failed:', getAllResponse.status, await getAllResponse.text());
    }

    // Test 4: Reset preferences
    console.log('\n4. Testing DELETE /api/preferences/bills (reset)');
    const resetResponse = await fetch(`${API_BASE_URL}/preferences/bills`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (resetResponse.ok) {
      const resetData = await resetResponse.json();
      console.log('✅ DELETE preferences (reset) successful:', resetData);
    } else {
      console.log('❌ DELETE preferences (reset) failed:', resetResponse.status, await resetResponse.text());
    }

    // Test 5: Bulk update preferences
    console.log('\n5. Testing PUT /api/preferences (bulk update)');
    const bulkUpdateData = {
      updates: {
        bills: testPreferences,
        expenses: {
          ...testPreferences,
          defaultSortBy: 'expenseDate'
        }
      }
    };

    const bulkUpdateResponse = await fetch(`${API_BASE_URL}/preferences`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bulkUpdateData)
    });
    
    if (bulkUpdateResponse.ok) {
      const bulkUpdateResult = await bulkUpdateResponse.json();
      console.log('✅ PUT bulk update successful:', bulkUpdateResult);
    } else {
      console.log('❌ PUT bulk update failed:', bulkUpdateResponse.status, await bulkUpdateResponse.text());
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the tests
testPreferencesAPI();
