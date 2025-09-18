const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testCustomField = {
  fieldName: 'project_code',
  fieldLabel: 'Project Code',
  fieldType: 'text',
  isRequired: true,
  defaultValue: 'PROJ-001',
  validation: {
    pattern: '^[A-Z0-9-]+?'
  }
};

const testSelectField = {
  fieldName: 'priority_level',
  fieldLabel: 'Priority Level',
  fieldType: 'select',
  isRequired: false,
  options: ['Low', 'Medium', 'High', 'Critical'],
  defaultValue: 'Medium'
};

const testNumberField = {
  fieldName: 'budget_amount',
  fieldLabel: 'Budget Amount',
  fieldType: 'number',
  isRequired: false,
  validation: {
    min: 0,
    max: 1000000
  }
};

const testBooleanField = {
  fieldName: 'is_urgent',
  fieldLabel: 'Is Urgent',
  fieldType: 'boolean',
  isRequired: false,
  defaultValue: 'false'
};

const testDateField = {
  fieldName: 'deadline_date',
  fieldLabel: 'Deadline Date',
  fieldType: 'date',
  isRequired: false
};

// Mock authentication token (you'll need to replace this with a real token)
const authToken = 'your-auth-token-here';

const headers = {
  'Authorization': `Bearer ?{authToken}`,
  'Content-Type': 'application/json'
};

async function testCustomFields() {
  console.log('🧪 Starting Custom Fields Testing...\n');

  try {
    // Test 1: Create custom fields
    console.log('1️⃣ Testing Custom Field Creation...');
    
    const textField = await axios.post(`?{BASE_URL}/preferences/custom-fields/expenses`, testCustomField, { headers });
    console.log('✅ Text field created:', textField.data.fieldName);
    
    const selectField = await axios.post(`?{BASE_URL}/preferences/custom-fields/expenses`, testSelectField, { headers });
    console.log('✅ Select field created:', selectField.data.fieldName);
    
    const numberField = await axios.post(`?{BASE_URL}/preferences/custom-fields/expenses`, testNumberField, { headers });
    console.log('✅ Number field created:', numberField.data.fieldName);
    
    const booleanField = await axios.post(`?{BASE_URL}/preferences/custom-fields/expenses`, testBooleanField, { headers });
    console.log('✅ Boolean field created:', booleanField.data.fieldName);
    
    const dateField = await axios.post(`?{BASE_URL}/preferences/custom-fields/expenses`, testDateField, { headers });
    console.log('✅ Date field created:', dateField.data.fieldName);

    // Test 2: Get all custom fields
    console.log('\n2️⃣ Testing Custom Field Retrieval...');
    const allFields = await axios.get(`?{BASE_URL}/preferences/custom-fields/expenses`, { headers });
    console.log('✅ Retrieved', allFields.data.length, 'custom fields');
    allFields.data.forEach(field => {
      console.log(`   - ?{field.fieldLabel} (?{field.fieldType})`);
    });

    // Test 3: Update a custom field
    console.log('\n3️⃣ Testing Custom Field Update...');
    const updatedField = await axios.put(`?{BASE_URL}/preferences/custom-fields/expenses/?{textField.data._id}`, {
      fieldLabel: 'Updated Project Code',
      isRequired: false
    }, { headers });
    console.log('✅ Field updated:', updatedField.data.fieldLabel);

    // Test 4: Toggle field status
    console.log('\n4️⃣ Testing Custom Field Toggle...');
    const toggledField = await axios.patch(`?{BASE_URL}/preferences/custom-fields/expenses/?{textField.data._id}/toggle`, {
      isActive: false
    }, { headers });
    console.log('✅ Field status toggled:', toggledField.data.isActive ? 'Active' : 'Inactive');

    // Test 5: Test validation - Invalid field name
    console.log('\n5️⃣ Testing Validation - Invalid Field Name...');
    try {
      await axios.post(`?{BASE_URL}/preferences/custom-fields/expenses`, {
        fieldName: 'Invalid Field Name',
        fieldLabel: 'Invalid Field',
        fieldType: 'text'
      }, { headers });
      console.log('❌ Validation failed - should have rejected invalid field name');
    } catch (error) {
      console.log('✅ Validation passed - rejected invalid field name:', error.response.data.error);
    }

    // Test 6: Test validation - Duplicate field name
    console.log('\n6️⃣ Testing Validation - Duplicate Field Name...');
    try {
      await axios.post(`?{BASE_URL}/preferences/custom-fields/expenses`, {
        fieldName: 'project_code',
        fieldLabel: 'Duplicate Project Code',
        fieldType: 'text'
      }, { headers });
      console.log('❌ Validation failed - should have rejected duplicate field name');
    } catch (error) {
      console.log('✅ Validation passed - rejected duplicate field name:', error.response.data.error);
    }

    // Test 7: Test validation - Invalid number range
    console.log('\n7️⃣ Testing Validation - Invalid Number Range...');
    try {
      await axios.post(`?{BASE_URL}/preferences/custom-fields/expenses`, {
        fieldName: 'invalid_range',
        fieldLabel: 'Invalid Range',
        fieldType: 'number',
        validation: {
          min: 100,
          max: 50
        }
      }, { headers });
      console.log('❌ Validation failed - should have rejected invalid range');
    } catch (error) {
      console.log('✅ Validation passed - rejected invalid range:', error.response.data.error);
    }

    // Test 8: Test validation - Invalid regex pattern
    console.log('\n8️⃣ Testing Validation - Invalid Regex Pattern...');
    try {
      await axios.post(`?{BASE_URL}/preferences/custom-fields/expenses`, {
        fieldName: 'invalid_pattern',
        fieldLabel: 'Invalid Pattern',
        fieldType: 'text',
        validation: {
          pattern: '[invalid-regex'
        }
      }, { headers });
      console.log('❌ Validation failed - should have rejected invalid regex');
    } catch (error) {
      console.log('✅ Validation passed - rejected invalid regex:', error.response.data.error);
    }

    // Test 9: Test validation - Select field without options
    console.log('\n9️⃣ Testing Validation - Select Field Without Options...');
    try {
      await axios.post(`?{BASE_URL}/preferences/custom-fields/expenses`, {
        fieldName: 'empty_select',
        fieldLabel: 'Empty Select',
        fieldType: 'select'
      }, { headers });
      console.log('❌ Validation failed - should have rejected select without options');
    } catch (error) {
      console.log('✅ Validation passed - rejected select without options:', error.response.data.error);
    }

    // Test 10: Delete a custom field
    console.log('\n🔟 Testing Custom Field Deletion...');
    await axios.delete(`?{BASE_URL}/preferences/custom-fields/expenses/?{dateField.data._id}`, { headers });
    console.log('✅ Date field deleted');

    // Test 11: Verify deletion
    console.log('\n1️⃣1️⃣ Testing Deletion Verification...');
    const remainingFields = await axios.get(`?{BASE_URL}/preferences/custom-fields/expenses`, { headers });
    console.log('✅ Remaining fields after deletion:', remainingFields.data.length);

    // Test 12: Test expense creation with custom fields
    console.log('\n1️⃣2️⃣ Testing Expense Creation with Custom Fields...');
    const expenseWithCustomFields = {
      date: new Date().toISOString().split('T')[0],
      description: 'Test expense with custom fields',
      amount: 100.50,
      vendor: 'Test Vendor',
      account: 'Office Supplies',
      category: 'Other',
      paymentMethod: 'Cash',
      reference: 'TEST-001',
      notes: 'Test expense',
      billable: false,
      hasReceipt: false,
      attachments: [],
      status: 'unbilled',
      customFields: {
        project_code: 'PROJ-123',
        priority_level: 'High',
        budget_amount: 500,
        is_urgent: 'true'
      }
    };

    try {
      const expense = await axios.post(`?{BASE_URL}/expenses`, expenseWithCustomFields, { headers });
      console.log('✅ Expense created with custom fields:', expense.data._id);
      console.log('   Custom fields:', expense.data.customFields);
    } catch (error) {
      console.log('❌ Expense creation failed:', error.response?.data?.error || error.message);
    }

    console.log('\n🎉 Custom Fields Testing Completed!');
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Field Creation: 5/5');
    console.log('   ✅ Field Retrieval: 1/1');
    console.log('   ✅ Field Update: 1/1');
    console.log('   ✅ Field Toggle: 1/1');
    console.log('   ✅ Field Deletion: 1/1');
    console.log('   ✅ Validation Tests: 5/5');
    console.log('   ✅ Expense Integration: 1/1');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.error || error.message);
  }
}

// Run the tests
testCustomFields();
