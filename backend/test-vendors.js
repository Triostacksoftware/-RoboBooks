import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testVendor = {
  name: "Test Vendor Company",
  gstin: "22AAAAA0000A1Z5",
  companyName: "Test Vendor Company Ltd",
  displayName: "Test Vendor",
  email: "test@vendor.com",
  phone: "9876543210",
  workPhone: "9876543210",
  mobile: "9876543210",
  address: "123 Test Street, Test City, Test State, India 123456",
  contactInfo: "test@vendor.com | 9876543210",
  type: "business",
  salutation: "Mr.",
  firstName: "Test",
  lastName: "Vendor",
  pan: "ABCDE1234F",
  msmeRegistered: false,
  currency: "INR- Indian Rupee",
  openingBalance: 0,
  paymentTerms: "Due on Receipt",
  tds: "",
  enablePortal: false,
  portalLanguage: "English",
  status: "active",
  contactPersons: [{
    name: "John Doe",
    email: "john@vendor.com",
    phone: "9876543211",
    designation: "Manager"
  }],
  billingAddress: {
    street: "123 Test Street",
    city: "Test City",
    state: "Test State",
    country: "India",
    zipCode: "123456"
  },
  shippingAddress: {
    street: "123 Test Street",
    city: "Test City",
    state: "Test State",
    country: "India",
    zipCode: "123456"
  }
};

async function testVendorsAPI() {
  console.log('🧪 Testing Vendors API...\n');

  try {
    // Test 1: Create a vendor
    console.log('1. Creating a vendor...');
    const createResponse = await fetch(`${BASE_URL}/vendors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testVendor),
    });

    if (createResponse.ok) {
      const createdVendor = await createResponse.json();
      console.log('✅ Vendor created successfully:', createdVendor.data.name);
      
      const vendorId = createdVendor.data._id;

      // Test 2: Get all vendors
      console.log('\n2. Fetching all vendors...');
      const listResponse = await fetch(`${BASE_URL}/vendors`);
      if (listResponse.ok) {
        const vendors = await listResponse.json();
        console.log(`✅ Found ${vendors.data.length} vendors`);
      }

      // Test 3: Get vendor by ID
      console.log('\n3. Fetching vendor by ID...');
      const getResponse = await fetch(`${BASE_URL}/vendors/${vendorId}`);
      if (getResponse.ok) {
        const vendor = await getResponse.json();
        console.log('✅ Vendor retrieved:', vendor.data.name);
      }

      // Test 4: Update vendor
      console.log('\n4. Updating vendor...');
      const updateData = {
        ...testVendor,
        name: "Updated Test Vendor Company",
        displayName: "Updated Test Vendor"
      };
      
      const updateResponse = await fetch(`${BASE_URL}/vendors/${vendorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (updateResponse.ok) {
        const updatedVendor = await updateResponse.json();
        console.log('✅ Vendor updated:', updatedVendor.data.name);
      }

      // Test 5: Search vendors
      console.log('\n5. Searching vendors...');
      const searchResponse = await fetch(`${BASE_URL}/vendors/search?query=Test`);
      if (searchResponse.ok) {
        const searchResults = await searchResponse.json();
        console.log(`✅ Search found ${searchResults.data.length} vendors`);
      }

      // Test 6: Delete vendor
      console.log('\n6. Deleting vendor...');
      const deleteResponse = await fetch(`${BASE_URL}/vendors/${vendorId}`, {
        method: 'DELETE',
      });

      if (deleteResponse.ok) {
        console.log('✅ Vendor deleted successfully');
      }

    } else {
      const error = await createResponse.json();
      console.log('❌ Failed to create vendor:', error.message);
    }

  } catch (error) {
    console.error('❌ Error testing vendors API:', error.message);
  }

  console.log('\n🏁 Vendors API testing completed!');
}

// Run the test
testVendorsAPI();
