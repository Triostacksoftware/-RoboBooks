import Customer from '../models/Customer.js';

// Create a new customer
export const createCustomer = async (req, res) => {
  try {
    const {
      customerType,
      salutation,
      firstName,
      lastName,
      companyName,
      displayName,
      email,
      workPhone,
      mobile,
      pan,
      currency,
      openingBalance,
      paymentTerms,
      portalEnabled,
      portalLanguage,
      billingAddress,
      shippingAddress,
      contactPersons
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and email are required'
      });
    }

    // Check if customer with same email already exists
    const existingCustomer = await Customer.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') },
      isActive: true 
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'A customer with this email already exists'
      });
    }

    // Check if customer with same display name already exists
    if (displayName) {
      const existingDisplayName = await Customer.findOne({ 
        displayName: { $regex: new RegExp(`^${displayName}$`, 'i') },
        isActive: true 
      });
      if (existingDisplayName) {
        return res.status(400).json({
          success: false,
          message: 'A customer with this display name already exists'
        });
      }
    }

    const customerData = {
      customerType,
      salutation,
      firstName,
      lastName,
      companyName,
      displayName,
      email,
      workPhone,
      mobile,
      pan,
      currency,
      openingBalance: openingBalance ? parseFloat(openingBalance) : 0,
      paymentTerms,
      portalEnabled,
      portalLanguage,
      billingAddress,
      shippingAddress,
      contactPersons: contactPersons || [],
      createdBy: req.user?.id || null
    };

    const customer = new Customer(customerData);
    await customer.save();

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create customer',
      error: error.message
    });
  }
};

// Get all customers with pagination and filtering
export const getAllCustomers = async (req, res) => {
  try {
    // Check if Customer model is available (database connected)
    if (!Customer || !Customer.find) {
      console.log('⚠️ Database not available, returning mock customers');
      
      // Return mock customer data
      const mockCustomers = [
        {
          _id: 'mock-customer-1',
          customerType: 'individual',
          salutation: 'Mr.',
          firstName: 'John',
          lastName: 'Doe',
          companyName: 'John Doe Enterprises',
          displayName: 'John Doe',
          email: 'john@example.com',
          workPhone: '+1234567890',
          mobile: '+1234567890',
          pan: 'ABCDE1234F',
          currency: 'INR',
          openingBalance: 0,
          paymentTerms: 'Net 30',
          portalEnabled: false,
          portalLanguage: 'en',
          billingAddress: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          shippingAddress: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          },
          contactPersons: [],
          isActive: true,
          createdBy: 'mock-user-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: 'mock-customer-2',
          customerType: 'business',
          salutation: 'Ms.',
          firstName: 'Jane',
          lastName: 'Smith',
          companyName: 'Smith & Co.',
          displayName: 'Jane Smith',
          email: 'jane@example.com',
          workPhone: '+0987654321',
          mobile: '+0987654321',
          pan: 'FGHIJ5678K',
          currency: 'INR',
          openingBalance: 0,
          paymentTerms: 'Net 15',
          portalEnabled: true,
          portalLanguage: 'en',
          billingAddress: {
            street: '456 Business Ave',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90210',
            country: 'USA'
          },
          shippingAddress: {
            street: '456 Business Ave',
            city: 'Los Angeles',
            state: 'CA',
            zipCode: '90210',
            country: 'USA'
          },
          contactPersons: [],
          isActive: true,
          createdBy: 'mock-user-1',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      return res.json({
        success: true,
        data: mockCustomers,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: mockCustomers.length,
          itemsPerPage: mockCustomers.length
        }
      });
    }

    const {
      page = 1,
      limit = 25,
      search,
      status = 'active',
      type,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Filter by status
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Filter by customer type
    if (type) {
      query.customerType = type;
    }

    // Search functionality
    if (search) {
      query.$or = [
        { displayName: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [customers, total] = await Promise.all([
      Customer.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v'),
      Customer.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: customers,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers',
      error: error.message
    });
  }
};

// Get customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id).select('-__v');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer',
      error: error.message
    });
  }
};

// Update customer by ID
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if customer exists
    const existingCustomer = await Customer.findById(id);
    if (!existingCustomer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check for email uniqueness if email is being updated
    if (updateData.email && updateData.email !== existingCustomer.email) {
      const emailExists = await Customer.findOne({
        email: { $regex: new RegExp(`^${updateData.email}$`, 'i') },
        _id: { $ne: id },
        isActive: true
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'A customer with this email already exists'
        });
      }
    }

    // Check for display name uniqueness if display name is being updated
    if (updateData.displayName && updateData.displayName !== existingCustomer.displayName) {
      const displayNameExists = await Customer.findOne({
        displayName: { $regex: new RegExp(`^${updateData.displayName}$`, 'i') },
        _id: { $ne: id },
        isActive: true
      });

      if (displayNameExists) {
        return res.status(400).json({
          success: false,
          message: 'A customer with this display name already exists'
        });
      }
    }

    // Add updated by information
    updateData.updatedBy = req.user?.id || null;

    const customer = await Customer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update customer',
      error: error.message
    });
  }
};

// Delete customer by ID (soft delete)
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Soft delete by setting isActive to false
    customer.isActive = false;
    customer.updatedBy = req.user?.id || null;
    await customer.save();

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete customer',
      error: error.message
    });
  }
};

// Hard delete customer by ID (admin only)
export const hardDeleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      message: 'Customer permanently deleted'
    });
  } catch (error) {
    console.error('Error hard deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete customer',
      error: error.message
    });
  }
};

// Get customers by type
export const getCustomersByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 25 } = req.query;

    const query = { customerType: type, isActive: true };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [customers, total] = await Promise.all([
      Customer.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-__v'),
      Customer.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: customers,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customers by type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers',
      error: error.message
    });
  }
};

// Search customers
export const searchCustomers = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const query = {
      $or: [
        { displayName: { $regex: q, $options: 'i' } },
        { firstName: { $regex: q, $options: 'i' } },
        { lastName: { $regex: q, $options: 'i' } },
        { companyName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ],
      isActive: true
    };

    const customers = await Customer.find(query)
      .sort({ displayName: 1 })
      .limit(parseInt(limit))
      .select('displayName firstName lastName companyName email customerType');

    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    console.error('Error searching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search customers',
      error: error.message
    });
  }
};

// Get customer statistics
export const getCustomerStats = async (req, res) => {
  try {
    const [
      totalCustomers,
      activeCustomers,
      businessCustomers,
      individualCustomers,
      customersWithReceivables
    ] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ isActive: true }),
      Customer.countDocuments({ customerType: 'Business', isActive: true }),
      Customer.countDocuments({ customerType: 'Individual', isActive: true }),
      Customer.countDocuments({ receivables: { $gt: 0 }, isActive: true })
    ]);

    res.json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        businessCustomers,
        individualCustomers,
        customersWithReceivables
      }
    });
  } catch (error) {
    console.error('Error fetching customer stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer statistics',
      error: error.message
    });
  }
}; 