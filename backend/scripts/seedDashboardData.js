import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Customer from '../models/Customer.js';
import Item from '../models/Item.js';
import Account from '../models/Account.js';
import Invoice from '../models/invoicemodel.js';
import Bill from '../models/Bill.js';
import Project from '../models/projectmodel.js';
import Report from '../models/Report.js';
import SalesOrder from '../models/salesOrderModel.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/robobooks');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedDashboardData = async () => {
  try {
    console.log('🌱 Seeding dashboard data...');

    // Clear existing data first
    await Customer.deleteMany({});
    await Item.deleteMany({});
    await Account.deleteMany({});
    await Invoice.deleteMany({});
    await Bill.deleteMany({});
    await Project.deleteMany({});
    await Report.deleteMany({});
    await SalesOrder.deleteMany({});

    // Create sample customers
    const customers = await Customer.insertMany([
      {
        firstName: 'ABC',
        lastName: 'Corporation',
        displayName: 'ABC Corporation',
        companyName: 'ABC Corporation',
        email: 'contact@abccorp.com',
        workPhone: '+91-9876543210',
        customerType: 'Business',
        status: 'active',
        billingAddress: {
          street: '123 Business Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        }
      },
      {
        firstName: 'John',
        lastName: 'Doe',
        displayName: 'John Doe',
        email: 'john.doe@email.com',
        mobile: '+91-9876543211',
        customerType: 'Individual',
        status: 'active',
        billingAddress: {
          street: '456 Residential Avenue',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
          country: 'India'
        }
      },
      {
        firstName: 'XYZ',
        lastName: 'Ltd',
        displayName: 'XYZ Ltd',
        companyName: 'XYZ Ltd',
        email: 'info@xyzltd.com',
        workPhone: '+91-9876543212',
        customerType: 'Business',
        status: 'active',
        billingAddress: {
          street: '789 Corporate Plaza',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India'
        }
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        displayName: 'Jane Smith',
        email: 'jane.smith@email.com',
        mobile: '+91-9876543213',
        customerType: 'Individual',
        status: 'active',
        billingAddress: {
          street: '321 Personal Lane',
          city: 'Chennai',
          state: 'Tamil Nadu',
          zipCode: '600001',
          country: 'India'
        }
      }
    ]);

    console.log(`✅ Created ${customers.length} customers`);

    // Create sample items
    const items = await Item.insertMany([
      {
        name: 'Office Supplies',
        description: 'General office supplies and stationery',
        type: 'Goods',
        sellingPrice: 500,
        purchasePrice: 400,
        quantity: 100,
        lowStockThreshold: 20,
        category: 'Office',
        status: 'active'
      },
      {
        name: 'Consulting Services',
        description: 'Business consulting and advisory services',
        type: 'Service',
        sellingPrice: 5000,
        purchasePrice: 0,
        quantity: 0,
        lowStockThreshold: 0,
        category: 'Services',
        status: 'active'
      },
      {
        name: 'Software License',
        description: 'Annual software license subscription',
        type: 'Goods',
        sellingPrice: 12000,
        purchasePrice: 10000,
        quantity: 50,
        lowStockThreshold: 10,
        category: 'Software',
        status: 'active'
      }
    ]);

    console.log(`✅ Created ${items.length} items`);

    // Create sample bank accounts
    const accounts = await Account.insertMany([
      {
        code: '20000001',
        name: 'Main Business Account',
        accountHead: 'asset',
        accountGroup: 'Bank',
        balanceType: 'debit',
        openingBalance: 250000,
        currentBalance: 250000,
        userId: new mongoose.Types.ObjectId(), // Dummy user ID
        status: 'active'
      },
      {
        code: '20000002',
        name: 'Operating Account',
        accountHead: 'asset',
        accountGroup: 'Bank',
        balanceType: 'debit',
        openingBalance: 150000,
        currentBalance: 150000,
        userId: new mongoose.Types.ObjectId(), // Dummy user ID
        status: 'active'
      }
    ]);

    console.log(`✅ Created ${accounts.length} bank accounts`);

    // Create sample invoices
    const invoices = await Invoice.insertMany([
      {
        invoiceNumber: 'INV-001',
        customerId: customers[0]._id,
        customerName: customers[0].displayName,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items: [
          {
            itemId: items[0]._id.toString(),
            details: items[0].name,
            description: items[0].description,
            quantity: 10,
            rate: items[0].sellingPrice,
            amount: items[0].sellingPrice * 10
          }
        ],
        subTotal: 5000,
        taxAmount: 900,
        total: 5900,
        status: 'Paid',
        amountPaid: 5900,
        balanceDue: 0
      },
      {
        invoiceNumber: 'INV-002',
        customerId: customers[1]._id,
        customerName: customers[1].displayName,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        items: [
          {
            itemId: items[1]._id.toString(),
            details: items[1].name,
            description: items[1].description,
            quantity: 1,
            rate: items[1].sellingPrice,
            amount: items[1].sellingPrice
          }
        ],
        subTotal: 5000,
        taxAmount: 900,
        total: 5900,
        status: 'Unpaid',
        amountPaid: 0,
        balanceDue: 5900
      },
      {
        invoiceNumber: 'INV-003',
        customerId: customers[2]._id,
        customerName: customers[2].displayName,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        items: [
          {
            itemId: items[2]._id.toString(),
            details: items[2].name,
            description: items[2].description,
            quantity: 2,
            rate: items[2].sellingPrice,
            amount: items[2].sellingPrice * 2
          }
        ],
        subTotal: 24000,
        taxAmount: 4320,
        total: 28320,
        status: 'Paid',
        amountPaid: 28320,
        balanceDue: 0
      }
    ]);

    console.log(`✅ Created ${invoices.length} invoices`);

    // Create sample bills
    const bills = await Bill.insertMany([
      {
        billNumber: 'BILL-001',
        vendorId: new mongoose.Types.ObjectId(), // Dummy vendor ID
        vendorName: 'Office Supply Co.',
        vendorEmail: 'contact@officesupply.com',
        vendorAddress: '123 Supply Street, Mumbai',
        billDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'paid',
        items: [
          {
            itemId: items[0]._id.toString(),
            itemName: 'Office Supplies',
            description: 'General office supplies',
            quantity: 20,
            unitPrice: 450,
            totalPrice: 9000
          }
        ],
        subtotal: 9000,
        taxAmount: 1620,
        totalAmount: 10620,
        createdBy: new mongoose.Types.ObjectId(), // Dummy user ID
        organizationId: new mongoose.Types.ObjectId(), // Dummy org ID
        paidAt: new Date()
      },
      {
        billNumber: 'BILL-002',
        vendorId: new mongoose.Types.ObjectId(), // Dummy vendor ID
        vendorName: 'Software Solutions Inc.',
        vendorEmail: 'billing@softwareinc.com',
        vendorAddress: '456 Tech Avenue, Bangalore',
        billDate: new Date(),
        dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'draft',
        items: [
          {
            itemId: items[2]._id.toString(),
            itemName: 'Software License',
            description: 'Annual software license',
            quantity: 1,
            unitPrice: 10000,
            totalPrice: 10000
          }
        ],
        subtotal: 10000,
        taxAmount: 1800,
        totalAmount: 11800,
        createdBy: new mongoose.Types.ObjectId(), // Dummy user ID
        organizationId: new mongoose.Types.ObjectId() // Dummy org ID
      }
    ]);

    console.log(`✅ Created ${bills.length} bills`);

    // Create sample projects
    const projects = await Project.insertMany([
      {
        name: 'Website Development',
        description: 'Client website development project',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        start_date: new Date(),
        end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        budget: 100000,
        spent: 25000,
        client: customers[0].displayName,
        customer_id: customers[0]._id,
        user_id: new mongoose.Types.ObjectId().toString()
      },
      {
        name: 'Mobile App Development',
        description: 'Cross-platform mobile application',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        start_date: new Date(),
        end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        budget: 150000,
        spent: 40000,
        client: customers[2].displayName,
        customer_id: customers[2]._id,
        user_id: new mongoose.Types.ObjectId().toString()
      },
      {
        name: 'Consulting Project',
        description: 'Business process optimization consulting',
        status: 'completed',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        end_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        budget: 50000,
        spent: 50000,
        client: customers[1].displayName,
        customer_id: customers[1]._id,
        user_id: new mongoose.Types.ObjectId().toString()
      }
    ]);

    console.log(`✅ Created ${projects.length} projects`);

    // Create sample reports
    const reports = await Report.insertMany([
      {
        name: 'Monthly Financial Summary',
        description: 'Comprehensive financial overview for the month',
        type: 'system',
        category: 'business_overview',
        subCategory: 'monthly_summary',
        createdBy: new mongoose.Types.ObjectId().toString(),
        lastRun: new Date(),
        parameters: {
          totalRevenue: 40120,
          totalExpenses: 22420,
          netProfit: 17700
        }
      },
      {
        name: 'Customer Analysis Report',
        description: 'Detailed analysis of customer data and trends',
        type: 'system',
        category: 'sales',
        subCategory: 'customer_analysis',
        createdBy: new mongoose.Types.ObjectId().toString(),
        lastRun: new Date(),
        parameters: {
          totalCustomers: 4,
          activeCustomers: 4,
          totalRevenue: 40120
        }
      }
    ]);

    console.log(`✅ Created ${reports.length} reports`);

    // Create sample sales orders
    const salesOrders = await SalesOrder.insertMany([
      {
        salesOrderNumber: 'SO-001',
        customerId: customers[0]._id,
        customerName: customers[0].displayName,
        orderDate: new Date(),
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'Draft',
        items: [
          {
            itemId: items[0]._id.toString(),
            details: items[0].name,
            description: items[0].description,
            quantity: 15,
            rate: 500,
            amount: 7500
          }
        ],
        subTotal: 7500,
        taxAmount: 1350,
        total: 8850
      },
      {
        salesOrderNumber: 'SO-002',
        customerId: customers[2]._id,
        customerName: customers[2].displayName,
        orderDate: new Date(),
        deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'Confirmed',
        confirmedAt: new Date(),
        items: [
          {
            itemId: items[2]._id.toString(),
            details: items[2].name,
            description: items[2].description,
            quantity: 1,
            rate: 12000,
            amount: 12000
          }
        ],
        subTotal: 12000,
        taxAmount: 2160,
        total: 14160
      }
    ]);

    console.log(`✅ Created ${salesOrders.length} sales orders`);

    console.log('🎉 Dashboard data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Customers: ${customers.length}`);
    console.log(`- Items: ${items.length}`);
    console.log(`- Bank Accounts: ${accounts.length}`);
    console.log(`- Invoices: ${invoices.length}`);
    console.log(`- Bills: ${bills.length}`);
    console.log(`- Projects: ${projects.length}`);
    console.log(`- Reports: ${reports.length}`);
    console.log(`- Sales Orders: ${salesOrders.length}`);

  } catch (error) {
    console.error('❌ Error seeding dashboard data:', error);
  }
};

const main = async () => {
  await connectDB();
  await seedDashboardData();
  process.exit(0);
};

main();
