import CustomView from '../models/CustomView.js';
import Expense from '../models/Expense.js';
import Bill from '../models/bill.model.js';
import Payment from '../models/Payment.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import VendorCredit from '../models/VendorCredit.js';
import Vendor from '../models/vendor.model.js';
import RecurringBill from '../models/RecurringBill.js';
import RecurringExpense from '../models/RecurringExpense.js';

// Get all custom views for a module
const getCustomViews = async (req, res) => {
  try {
    const { module } = req.params;
    const organizationId = req.user.organizationId;

    const views = await CustomView.find({
      organizationId,
      module,
      $or: [
        { createdBy: req.user.id },
        { isPublic: true }
      ]
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: views
    });
  } catch (error) {
    console.error('Error fetching custom views:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching custom views',
      error: error.message
    });
  }
};

// Get a specific custom view
const getCustomView = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    const view = await CustomView.findOne({
      _id: id,
      organizationId,
      $or: [
        { createdBy: req.user.id },
        { isPublic: true }
      ]
    });

    if (!view) {
      return res.status(404).json({
        success: false,
        message: 'Custom view not found'
      });
    }

    res.json({
      success: true,
      data: view
    });
  } catch (error) {
    console.error('Error fetching custom view:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching custom view',
      error: error.message
    });
  }
};

// Create a new custom view
const createCustomView = async (req, res) => {
  try {
    const { name, description, module, filters, sortBy, sortOrder, columns, isDefault, isPublic } = req.body;
    const organizationId = req.user.organizationId;

    // If setting as default, unset other defaults for this module
    if (isDefault) {
      await CustomView.updateMany(
        { organizationId, module, isDefault: true },
        { isDefault: false }
      );
    }

    const customView = new CustomView({
      name,
      description,
      module,
      filters: filters || [],
      sortBy: sortBy || 'date',
      sortOrder: sortOrder || 'desc',
      columns: columns || ['date', 'description', 'amount', 'vendor', 'status'],
      isDefault: isDefault || false,
      isPublic: isPublic || false,
      createdBy: req.user.id,
      organizationId
    });

    await customView.save();

    res.status(201).json({
      success: true,
      data: customView,
      message: 'Custom view created successfully'
    });
  } catch (error) {
    console.error('Error creating custom view:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating custom view',
      error: error.message
    });
  }
};

// Update a custom view
const updateCustomView = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, filters, sortBy, sortOrder, columns, isDefault, isPublic } = req.body;
    const organizationId = req.user.organizationId;

    const view = await CustomView.findOne({
      _id: id,
      organizationId,
      createdBy: req.user.id
    });

    if (!view) {
      return res.status(404).json({
        success: false,
        message: 'Custom view not found or you do not have permission to edit it'
      });
    }

    // If setting as default, unset other defaults for this module
    if (isDefault && !view.isDefault) {
      await CustomView.updateMany(
        { organizationId, module: view.module, isDefault: true },
        { isDefault: false }
      );
    }

    const updatedView = await CustomView.findByIdAndUpdate(
      id,
      {
        name,
        description,
        filters: filters || view.filters,
        sortBy: sortBy || view.sortBy,
        sortOrder: sortOrder || view.sortOrder,
        columns: columns || view.columns,
        isDefault: isDefault !== undefined ? isDefault : view.isDefault,
        isPublic: isPublic !== undefined ? isPublic : view.isPublic
      },
      { new: true }
    );

    res.json({
      success: true,
      data: updatedView,
      message: 'Custom view updated successfully'
    });
  } catch (error) {
    console.error('Error updating custom view:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating custom view',
      error: error.message
    });
  }
};

// Delete a custom view
const deleteCustomView = async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    const view = await CustomView.findOne({
      _id: id,
      organizationId,
      createdBy: req.user.id
    });

    if (!view) {
      return res.status(404).json({
        success: false,
        message: 'Custom view not found or you do not have permission to delete it'
      });
    }

    await CustomView.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Custom view deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting custom view:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting custom view',
      error: error.message
    });
  }
};

// Apply custom view filters and get data
const applyCustomView = async (req, res) => {
  try {
    const { module } = req.params;
    const { filters, sortBy, sortOrder, columns, searchTerm } = req.body;
    const organizationId = req.user.organizationId;

    // Get the appropriate model based on module
    let Model;
    switch (module) {
      case 'expenses':
        Model = Expense;
        break;
      case 'bills':
        Model = Bill;
        break;
      case 'payments':
        Model = Payment;
        break;
      case 'purchase-orders':
        Model = PurchaseOrder;
        break;
      case 'vendor-credits':
        Model = VendorCredit;
        break;
      case 'vendors':
        Model = Vendor;
        break;
      case 'recurring-bills':
        Model = RecurringBill;
        break;
      case 'recurring-expenses':
        Model = RecurringExpense;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid module'
        });
    }

    // Build query
    let query = { organizationId };

    // Apply search term
    if (searchTerm) {
      query.$or = [
        { description: { $regex: searchTerm, $options: 'i' } },
        { vendor: { $regex: searchTerm, $options: 'i' } },
        { account: { $regex: searchTerm, $options: 'i' } },
        { reference: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Apply custom filters
    if (filters && filters.length > 0) {
      filters.forEach(filter => {
        const { field, operator, value } = filter;
        
        switch (operator) {
          case 'equals':
            query[field] = value;
            break;
          case 'contains':
            query[field] = { $regex: value, $options: 'i' };
            break;
          case 'startsWith':
            query[field] = { $regex: `^${value}`, $options: 'i' };
            break;
          case 'endsWith':
            query[field] = { $regex: `${value}$`, $options: 'i' };
            break;
          case 'greaterThan':
            query[field] = { $gt: parseFloat(value) || value };
            break;
          case 'lessThan':
            query[field] = { $lt: parseFloat(value) || value };
            break;
          case 'greaterThanOrEqual':
            query[field] = { $gte: parseFloat(value) || value };
            break;
          case 'lessThanOrEqual':
            query[field] = { $lte: parseFloat(value) || value };
            break;
          case 'notEquals':
            query[field] = { $ne: value };
            break;
        }
      });
    }

    // Build sort object
    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    // Execute query
    const data = await Model.find(query)
      .sort(sort)
      .limit(1000); // Limit to prevent performance issues

    // Select only requested columns if specified
    let result = data;
    if (columns && columns.length > 0) {
      const projection = {};
      columns.forEach(col => {
        projection[col] = 1;
      });
      projection._id = 1; // Always include _id
      result = data.map(item => {
        const projected = {};
        columns.forEach(col => {
          projected[col] = item[col];
        });
        projected._id = item._id;
        return projected;
      });
    }

    res.json({
      success: true,
      data: result,
      count: result.length
    });
  } catch (error) {
    console.error('Error applying custom view:', error);
    res.status(500).json({
      success: false,
      message: 'Error applying custom view',
      error: error.message
    });
  }
};

export {
  getCustomViews,
  getCustomView,
  createCustomView,
  updateCustomView,
  deleteCustomView,
  applyCustomView
};
