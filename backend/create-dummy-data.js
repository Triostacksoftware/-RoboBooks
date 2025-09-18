import mongoose from 'mongoose';
import Customer from './models/Customer.js';
import Invoice from './models/invoicemodel.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Dummy customers data
const dummyCustomers = [
  {
    customerType: 'Business',
    salutation: 'Mr.',
    firstName: 'John',
    lastName: 'Smith',
    companyName: 'Tech Solutions Inc.',
    displayName: 'Tech Solutions Inc.',
    email: 'john.smith@techsolutions.com',
    workPhone: '+1-555-0101',
    mobile: '+1-555-0102',
    pan: 'ABCDE1234F',
    gstin: '22AAAAA0000A1Z5',
    address: '123 Tech Street, Silicon Valley, CA 94025',
    city: 'Silicon Valley',
    state: 'California',
    country: 'USA',
    postalCode: '94025',
    status: 'Active'
  },
  {
    customerType: 'Business',
    salutation: 'Ms.',
    firstName: 'Sarah',
    lastName: 'Johnson',
    companyName: 'Digital Marketing Pro',
    displayName: 'Digital Marketing Pro',
    email: 'sarah.johnson@digitalmarketingpro.com',
    workPhone: '+1-555-0201',
    mobile: '+1-555-0202',
    pan: 'BCDEF2345G',
    gstin: '33BBBBB0000B2Z6',
    address: '456 Marketing Avenue, New York, NY 10001',
    city: 'New York',
    state: 'New York',
    country: 'USA',
    postalCode: '10001',
    status: 'Active'
  },
  {
    customerType: 'Individual',
    salutation: 'Dr.',
    firstName: 'Michael',
    lastName: 'Brown',
    companyName: '',
    displayName: 'Dr. Michael Brown',
    email: 'michael.brown@email.com',
    workPhone: '+1-555-0301',
    mobile: '+1-555-0302',
    pan: 'CDEFG3456H',
    gstin: '',
    address: '789 Medical Center Drive, Boston, MA 02108',
    city: 'Boston',
    state: 'Massachusetts',
    country: 'USA',
    postalCode: '02108',
    status: 'Active'
  },
  {
    customerType: 'Business',
    salutation: 'Mrs.',
    firstName: 'Emily',
    lastName: 'Davis',
    companyName: 'Creative Design Studio',
    displayName: 'Creative Design Studio',
    email: 'emily.davis@creativedesignstudio.com',
    workPhone: '+1-555-0401',
    mobile: '+1-555-0402',
    pan: 'DEFGH4567I',
    gstin: '44CCCCC0000C3Z7',
    address: '321 Design Boulevard, Los Angeles, CA 90210',
    city: 'Los Angeles',
    state: 'California',
    country: 'USA',
    postalCode: '90210',
    status: 'Active'
  },
  {
    customerType: 'Individual',
    salutation: 'Mr.',
    firstName: 'David',
    lastName: 'Wilson',
    companyName: '',
    displayName: 'David Wilson',
    email: 'david.wilson@email.com',
    workPhone: '+1-555-0501',
    mobile: '+1-555-0502',
    pan: 'EFGHI5678J',
    gstin: '',
    address: '654 Consultant Lane, Chicago, IL 60601',
    city: 'Chicago',
    state: 'Illinois',
    country: 'USA',
    postalCode: '60601',
    status: 'Active'
  }
];

// Dummy invoices data
const createDummyInvoices = (customers) => {
  return [
    {
      customerId: customers[0]._id,
      customerName: customers[0].displayName,
      customerEmail: customers[0].email,
      customerPhone: customers[0].workPhone,
      customerAddress: customers[0].address,
      buyerName: customers[0].displayName,
      buyerEmail: customers[0].email,
      buyerPhone: customers[0].workPhone,
      buyerGstin: customers[0].gstin,
      buyerAddress: customers[0].address,
      sellerName: 'RoboBooks Company',
      sellerEmail: 'sales@robobooks.com',
      sellerPhone: '+1-555-0000',
      sellerGstin: '11ROBOB0000R1Z1',
      sellerAddress: '100 Business Street, Tech City, TC 12345',
      invoiceNumber: 'INV-2025-001',
      orderNumber: 'ORD-2025-001',
      invoiceDate: new Date('2025-08-01'),
      terms: 'Net 30',
      dueDate: new Date('2025-09-01'),
      salesperson: 'Sales Team',
      subject: 'Software Development Services',
      project: 'Web Application Development',
      items: [
        {
          details: 'Frontend Development',
          description: 'React.js application development',
          quantity: 80,
          unit: 'hours',
          rate: 75,
          amount: 6000,
          taxRate: 10,
          taxAmount: 600
        },
        {
          details: 'Backend Development',
          description: 'Node.js API development',
          quantity: 60,
          unit: 'hours',
          rate: 80,
          amount: 4800,
          taxRate: 10,
          taxAmount: 480
        }
      ],
      subtotal: 10800,
      taxAmount: 1080,
      total: 11880,
      status: 'Unpaid'
    },
    {
      customerId: customers[1]._id,
      customerName: customers[1].displayName,
      customerEmail: customers[1].email,
      customerPhone: customers[1].workPhone,
      customerAddress: customers[1].address,
      buyerName: customers[1].displayName,
      buyerEmail: customers[1].email,
      buyerPhone: customers[1].workPhone,
      buyerGstin: customers[1].gstin,
      buyerAddress: customers[1].address,
      sellerName: 'RoboBooks Company',
      sellerEmail: 'sales@robobooks.com',
      sellerPhone: '+1-555-0000',
      sellerGstin: '11ROBOB0000R1Z1',
      sellerAddress: '100 Business Street, Tech City, TC 12345',
      invoiceNumber: 'INV-2025-002',
      orderNumber: 'ORD-2025-002',
      invoiceDate: new Date('2025-08-05'),
      terms: 'Net 15',
      dueDate: new Date('2025-08-20'),
      salesperson: 'Sales Team',
      subject: 'Digital Marketing Services',
      project: 'SEO Campaign',
      items: [
        {
          details: 'SEO Optimization',
          description: 'Search engine optimization services',
          quantity: 40,
          unit: 'hours',
          rate: 65,
          amount: 2600,
          taxRate: 10,
          taxAmount: 260
        },
        {
          details: 'Content Creation',
          description: 'Blog posts and social media content',
          quantity: 20,
          unit: 'hours',
          rate: 45,
          amount: 900,
          taxRate: 10,
          taxAmount: 90
        }
      ],
      subtotal: 3500,
      taxAmount: 350,
      total: 3850,
      status: 'Unpaid'
    },
    {
      customerId: customers[2]._id,
      customerName: customers[2].displayName,
      customerEmail: customers[2].email,
      customerPhone: customers[2].workPhone,
      customerAddress: customers[2].address,
      buyerName: customers[2].displayName,
      buyerEmail: customers[2].email,
      buyerPhone: customers[2].workPhone,
      buyerGstin: customers[2].gstin,
      buyerAddress: customers[2].address,
      sellerName: 'RoboBooks Company',
      sellerEmail: 'sales@robobooks.com',
      sellerPhone: '+1-555-0000',
      sellerGstin: '11ROBOB0000R1Z1',
      sellerAddress: '100 Business Street, Tech City, TC 12345',
      invoiceNumber: 'INV-2025-003',
      orderNumber: 'ORD-2025-003',
      invoiceDate: new Date('2025-08-10'),
      terms: 'Due on Receipt',
      dueDate: new Date('2025-08-10'),
      salesperson: 'Sales Team',
      subject: 'Consulting Services',
      project: 'Business Strategy',
      items: [
        {
          details: 'Business Analysis',
          description: 'Strategic business analysis and recommendations',
          quantity: 16,
          unit: 'hours',
          rate: 120,
          amount: 1920,
          taxRate: 10,
          taxAmount: 192
        }
      ],
      subtotal: 1920,
      taxAmount: 192,
      total: 2112,
      status: 'Unpaid'
    },
    {
      customerId: customers[3]._id,
      customerName: customers[3].displayName,
      customerEmail: customers[3].email,
      customerPhone: customers[3].workPhone,
      customerAddress: customers[3].address,
      buyerName: customers[3].displayName,
      buyerEmail: customers[3].email,
      buyerPhone: customers[3].workPhone,
      buyerGstin: customers[3].gstin,
      buyerAddress: customers[3].address,
      sellerName: 'RoboBooks Company',
      sellerEmail: 'sales@robobooks.com',
      sellerPhone: '+1-555-0000',
      sellerGstin: '11ROBOB0000R1Z1',
      sellerAddress: '100 Business Street, Tech City, TC 12345',
      invoiceNumber: 'INV-2025-004',
      orderNumber: 'ORD-2025-004',
      invoiceDate: new Date('2025-08-15'),
      terms: 'Net 30',
      dueDate: new Date('2025-09-15'),
      salesperson: 'Sales Team',
      subject: 'Design Services',
      project: 'Brand Identity Design',
      items: [
        {
          details: 'Logo Design',
          description: 'Company logo and brand identity design',
          quantity: 1,
          unit: 'project',
          rate: 800,
          amount: 800,
          taxRate: 10,
          taxAmount: 80
        },
        {
          details: 'Brand Guidelines',
          description: 'Complete brand style guide and guidelines',
          quantity: 1,
          unit: 'document',
          rate: 400,
          amount: 400,
          taxRate: 10,
          taxAmount: 40
        }
      ],
      subtotal: 1200,
      taxAmount: 120,
      total: 1320,
      status: 'Unpaid'
    },
    {
      customerId: customers[4]._id,
      customerName: customers[4].displayName,
      customerEmail: customers[4].email,
      customerPhone: customers[4].workPhone,
      customerAddress: customers[4].address,
      buyerName: customers[4].displayName,
      buyerEmail: customers[4].email,
      buyerPhone: customers[4].workPhone,
      buyerGstin: customers[4].gstin,
      buyerAddress: customers[4].address,
      sellerName: 'RoboBooks Company',
      sellerEmail: 'sales@robobooks.com',
      sellerPhone: '+1-555-0000',
      sellerGstin: '11ROBOB0000R1Z1',
      sellerAddress: '100 Business Street, Tech City, TC 12345',
      invoiceNumber: 'INV-2025-005',
      orderNumber: 'ORD-2025-005',
      invoiceDate: new Date('2025-08-20'),
      terms: 'Net 15',
      dueDate: new Date('2025-09-05'),
      salesperson: 'Sales Team',
      subject: 'Consulting Services',
      project: 'Process Optimization',
      items: [
        {
          details: 'Process Analysis',
          description: 'Business process analysis and optimization',
          quantity: 24,
          unit: 'hours',
          rate: 95,
          amount: 2280,
          taxRate: 10,
          taxAmount: 228
        },
        {
          details: 'Implementation Support',
          description: 'Process implementation and training support',
          quantity: 12,
          unit: 'hours',
          rate: 75,
          amount: 900,
          taxRate: 10,
          taxAmount: 90
        }
      ],
      subtotal: 3180,
      taxAmount: 318,
      total: 3498,
      status: 'Unpaid'
    }
  ];
};

// Main function to create dummy data
const createDummyData = async () => {
  try {
    console.log('🚀 Starting to create dummy data...\n');

    // Connect to database
    await connectDB();

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🗑️ Clearing existing customers and invoices...');
    await Customer.deleteMany({});
    await Invoice.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create customers
    console.log('👥 Creating dummy customers...');
    const createdCustomers = await Customer.insertMany(dummyCustomers);
    console.log(`✅ Created ${createdCustomers.length} customers\n`);

    // Create invoices
    console.log('📄 Creating dummy invoices...');
    const dummyInvoices = createDummyInvoices(createdCustomers);
    const createdInvoices = await Invoice.insertMany(dummyInvoices);
    console.log(`✅ Created ${createdInvoices.length} invoices\n`);

    // Display summary
    console.log('📊 Data Creation Summary:');
    console.log(`   Customers: ${createdCustomers.length}`);
    console.log(`   Invoices: ${createdInvoices.length}`);
    console.log('\n🎉 Dummy data created successfully!');
    console.log('\n📋 Customer List:');
    createdCustomers.forEach((customer, index) => {
      console.log(`   ${index + 1}. ${customer.displayName} (${customer.email})`);
    });
    console.log('\n📋 Invoice List:');
    createdInvoices.forEach((invoice, index) => {
      console.log(`   ${index + 1}. ${invoice.invoiceNumber} - ${invoice.customerName} - ?${invoice.total}`);
    });

  } catch (error) {
    console.error('❌ Error creating dummy data:', error.message);
    console.error('Error stack:', error.stack);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
createDummyData();


