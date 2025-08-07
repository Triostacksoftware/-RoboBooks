import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testProject = {
  name: 'Test Project',
  client: 'Test Client',
  description: 'A test project for API verification',
  status: 'active',
  progress: 25,
  budget: 10000,
  spent: 2500,
  revenue: 12000,
  startDate: '2024-01-01',
  endDate: '2024-06-30',
  teamMembers: ['John Doe', 'Jane Smith']
};

const testTask = {
  name: 'Test Task',
  description: 'A test task',
  status: 'pending',
  assignedTo: 'John Doe',
  estimatedHours: 40,
  actualHours: 0,
  dueDate: '2024-03-01'
};

const testTimeEntry = {
  task: 'Test Task',
  user: 'John Doe',
  date: '2024-01-15',
  hours: 8,
  description: 'Working on test task',
  billable: true
};

const testInvoice = {
  number: 'INV-001',
  date: '2024-01-15',
  amount: 5000,
  status: 'draft',
  dueDate: '2024-02-15'
};

const testExpense = {
  description: 'Test expense',
  amount: 500,
  date: '2024-01-10',
  category: 'equipment',
  status: 'approved'
};

async function testProjectAPI() {
  console.log('🧪 Testing Project API...\n');

  try {
    // Test 1: Create Project
    console.log('1. Creating project...');
    const createResponse = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testProject)
    });
    
    if (!createResponse.ok) {
      throw new Error(`Failed to create project: ${createResponse.statusText}`);
    }
    
    const createdProject = await createResponse.json();
    console.log('✅ Project created:', createdProject._id);
    const projectId = createdProject._id;

    // Test 2: Get Project Details
    console.log('\n2. Getting project details...');
    const getResponse = await fetch(`${BASE_URL}/projects/${projectId}`);
    
    if (!getResponse.ok) {
      throw new Error(`Failed to get project: ${getResponse.statusText}`);
    }
    
    const projectDetails = await getResponse.json();
    console.log('✅ Project details retrieved');

    // Test 3: Create Task
    console.log('\n3. Creating task...');
    const taskResponse = await fetch(`${BASE_URL}/projects/${projectId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testTask)
    });
    
    if (!taskResponse.ok) {
      throw new Error(`Failed to create task: ${taskResponse.statusText}`);
    }
    
    const createdTask = await taskResponse.json();
    console.log('✅ Task created:', createdTask._id);

    // Test 4: Create Time Entry
    console.log('\n4. Creating time entry...');
    const timeEntryResponse = await fetch(`${BASE_URL}/projects/${projectId}/time-entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testTimeEntry)
    });
    
    if (!timeEntryResponse.ok) {
      throw new Error(`Failed to create time entry: ${timeEntryResponse.statusText}`);
    }
    
    const createdTimeEntry = await timeEntryResponse.json();
    console.log('✅ Time entry created:', createdTimeEntry._id);

    // Test 5: Create Invoice
    console.log('\n5. Creating invoice...');
    const invoiceResponse = await fetch(`${BASE_URL}/projects/${projectId}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testInvoice)
    });
    
    if (!invoiceResponse.ok) {
      throw new Error(`Failed to create invoice: ${invoiceResponse.statusText}`);
    }
    
    const createdInvoice = await invoiceResponse.json();
    console.log('✅ Invoice created:', createdInvoice._id);

    // Test 6: Create Expense
    console.log('\n6. Creating expense...');
    const expenseResponse = await fetch(`${BASE_URL}/projects/${projectId}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testExpense)
    });
    
    if (!expenseResponse.ok) {
      throw new Error(`Failed to create expense: ${expenseResponse.statusText}`);
    }
    
    const createdExpense = await expenseResponse.json();
    console.log('✅ Expense created:', createdExpense._id);

    // Test 7: Get Project Stats
    console.log('\n7. Getting project stats...');
    const statsResponse = await fetch(`${BASE_URL}/projects/${projectId}/stats`);
    
    if (!statsResponse.ok) {
      throw new Error(`Failed to get project stats: ${statsResponse.statusText}`);
    }
    
    const projectStats = await statsResponse.json();
    console.log('✅ Project stats retrieved:', projectStats);

    // Test 8: Get Updated Project Details
    console.log('\n8. Getting updated project details...');
    const updatedProjectResponse = await fetch(`${BASE_URL}/projects/${projectId}`);
    
    if (!updatedProjectResponse.ok) {
      throw new Error(`Failed to get updated project: ${updatedProjectResponse.statusText}`);
    }
    
    const updatedProject = await updatedProjectResponse.json();
    console.log('✅ Updated project details retrieved');
    console.log('   - Tasks:', updatedProject.tasks.length);
    console.log('   - Time Entries:', updatedProject.timeEntries.length);
    console.log('   - Invoices:', updatedProject.invoices.length);
    console.log('   - Expenses:', updatedProject.expenses.length);

    console.log('\n🎉 All tests passed! Project API is working correctly.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Make sure the backend server is running on port 5000');
  }
}

// Run the test
testProjectAPI(); 